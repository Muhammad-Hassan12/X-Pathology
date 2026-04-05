import uvicorn
from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import tensorflow as tf
from keras import models
from keras.applications.mobilenet_v2 import preprocess_input
import numpy as np
import cv2
import base64
from PIL import Image
import google.generativeai as genai
import io
from huggingface_hub import hf_hub_download
import os
from dotenv import load_dotenv

load_dotenv()

# CONFIGURATION

app = FastAPI(title="X-Pathology API")

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# HEALTH CHECK
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "model": "MobileNetV2-5class", "version": "2.0"}

# SECURITY MEASURES MONITOR
# Securely load the API key from environment variables (from .env file)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    print("❌ SECURITY ERROR: GEMINI_API_KEY is missing!")
    print("Please ensure your .env file is present and properly configured.")
    # We raise an error to prevent the app from starting up with missing critical credentials
    raise ValueError("GEMINI_API_KEY not found in environment.")

genai.configure(api_key=GEMINI_API_KEY)
llm_model = genai.GenerativeModel('gemini-2.5-flash')

# Loading the CNN Model (From Hugging Face)
print("Fetching model from Hugging Face Hub...")
hf_token = os.getenv("HF_TOKEN")
model_path = hf_hub_download(
    repo_id="rarfileexe/XPathology-CNN_2.0_advance", 
    filename="xpathology_v2_5class_finetuned.keras",
    token=hf_token
)

print("Loading X-Pathology CNN architecture and weights...")
cnn_model = models.load_model(
    model_path, 
    custom_objects={'preprocess_input': preprocess_input},
    safe_mode=False
)
print("Model loaded successfully from Hugging Face!")

# GRAD-CAM FUNCTION
def generate_gradcam(img_array, full_model, class_index):
    with tf.GradientTape() as tape:
        x = img_array
        conv_output = None

        for layer in full_model.layers:
            if isinstance(layer, tf.keras.layers.InputLayer):
                continue
            x = layer(x, training=False)
            if layer.name == 'mobilenetv2_1.00_224':
                conv_output = x  # Shape: (batch, 7, 7, 1280)
                tape.watch(conv_output)
        class_channel = x[:, class_index]

    grads = tape.gradient(class_channel, conv_output)
    pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))

    last_conv_layer_output = conv_output[0]
    heatmap = last_conv_layer_output @ pooled_grads[..., tf.newaxis]
    heatmap = tf.squeeze(heatmap)

    # Keep only positive values
    heatmap = tf.maximum(heatmap, 0)

    # Prevent division by zero
    max_heat = tf.math.reduce_max(heatmap)
    if max_heat == 0:
        return heatmap.numpy()

    # Normalize between 0 and 1
    heatmap = heatmap / max_heat

    return heatmap.numpy()

# FASTAPI ENDPOINT

CLASS_NAMES = [
    "Colon Adenocarcinoma (Malignant)",
    "Colon Benign Tissue",
    "Lung Adenocarcinoma (Malignant)",
    "Lung Benign Tissue",
    "Lung Squamous Cell Carcinoma (Malignant)"
]

from fastapi.responses import JSONResponse

def process_image_sync(contents: bytes) -> dict:
    nparr = np.frombuffer(contents, np.uint8)
    original_img_cv = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if original_img_cv is None:
        raise ValueError("Invalid image file. Please upload a valid JPEG or PNG histopathology slide.")
    
    original_img_rgb = cv2.cvtColor(original_img_cv, cv2.COLOR_BGR2RGB)
    resized_img = cv2.resize(original_img_rgb, (224, 224))
    img_array = np.expand_dims(resized_img, axis=0).astype(np.float32)
    raw_predictions = cnn_model.predict(img_array)[0]
    class_idx = int(np.argmax(raw_predictions))
    
    prediction_class = CLASS_NAMES[class_idx]
    confidence = float(raw_predictions[class_idx] * 100)
    
    severity = "Malignant" if "Malignant" in prediction_class else "Benign"

    # Generate Grad-CAM Overlay
    heatmap = generate_gradcam(img_array, cnn_model, class_idx)
    
    heatmap_resized = cv2.resize(heatmap, (original_img_cv.shape[1], original_img_cv.shape[0]))
    heatmap_resized = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_resized, cv2.COLORMAP_JET)
    
    superimposed_img_cv = cv2.addWeighted(original_img_cv, 0.6, heatmap_colored, 0.4, 0)

    # Convert OpenCV images (BGR) to PIL format (RGB) for Gemini
    original_pil = Image.fromarray(cv2.cvtColor(original_img_cv, cv2.COLOR_BGR2RGB))
    overlay_pil = Image.fromarray(cv2.cvtColor(superimposed_img_cv, cv2.COLOR_BGR2RGB))

    system_prompt = f"""
    You are an expert pathologist and an empathetic patient communicator. 

    I am providing two images:
    1. An H&E stained histopathology slide.
    2. A Grad-CAM XAI overlay. Warm colors (red/yellow) indicate the cellular structures the CNN focused on. 

    The AI's prediction is: {prediction_class} ({severity}) with {confidence:.1f}% confidence.

    Task: Analyze the images and generate a report with two distinct sections formatted exactly like this:

    **Section 1: Clinical Pathology Report**
    [Write dense, technical analysis describing the morphological features highlighted by the heatmap. Keep it strictly clinical.]

    **Section 2: Patient-Facing Summary**
    [Write a compassionate, plain-English summary. Explain the "attention map" simply. State this is an AI-assisted screening to be reviewed by a doctor.]
    """
    
    print(f"Sending {prediction_class} prediction to Gemini...")
    response = llm_model.generate_content([system_prompt, original_pil, overlay_pil])

    # Package everything for the Next.js Frontend
    _, buffer = cv2.imencode('.jpg', superimposed_img_cv)
    img_base64 = base64.b64encode(buffer).decode('utf-8')

    return {
        "prediction": prediction_class,
        "severity": severity,
        "confidence": round(confidence, 1),
        "gradcam_image_base64": f"data:image/jpeg;base64,{img_base64}",
        "full_report": response.text
    }

@app.post("/api/analyze")
@limiter.limit("5/minute")
async def analyze_slide(request: Request, file: UploadFile = File(...)):
  try:
    contents = await file.read()
    
    # Restrict file size to 10MB
    if len(contents) > 10 * 1024 * 1024:
        return JSONResponse(
            status_code=413,
            content={"error": "File size exceeds the 10MB limit. Please upload a smaller image."}
        )
    
    # Run heavy OpenCV/TF operations in a separate thread, avoiding freezing event loop
    result_dict = await run_in_threadpool(process_image_sync, contents)
    return result_dict
  except ValueError as ve:
    return JSONResponse(
        status_code=400,
        content={"error": str(ve)}
    )
  except Exception as e:
    print(f"❌ Analysis error: {str(e)}")
    return JSONResponse(
        status_code=500,
        content={"error": "An internal server error occurred while processing the slide."}
    )

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    print(f"Starting X-Pathology Backend Server on {host}:{port}...")
    uvicorn.run(app, host=host, port=port)