import os
import gc
import base64
import logging
import time
from contextlib import asynccontextmanager
from typing import Optional

import cv2
import numpy as np
import tensorflow as tf
from keras import models
from PIL import Image
from google import genai
from google.genai import types
import uvicorn
from fastapi import FastAPI, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.concurrency import run_in_threadpool
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from huggingface_hub import hf_hub_download, login
from dotenv import load_dotenv

load_dotenv()

# Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
log = logging.getLogger("xpathology")

# Constants
IMG_SIZE       = (240, 240)
MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME   = {"image/jpeg", "image/png", "image/tiff"}

CLASS_NAMES = ["ADI", "BACK", "DEB", "LYM", "MUC", "MUS", "NORM", "STR", "TUM"]

CLASS_DISPLAY = {
    "ADI":  "Adipose Tissue",
    "BACK": "Background",
    "DEB":  "Debris / Necrosis",
    "LYM":  "Lymphocytes",
    "MUC":  "Mucus",
    "MUS":  "Smooth Muscle",
    "NORM": "Normal Colon Mucosa",
    "STR":  "Cancer-Associated Stroma",
    "TUM":  "Colorectal Adenocarcinoma (Tumour)",
}

MALIGNANT_CLASSES = {"TUM"}

# Globals
cnn_model:       Optional[tf.keras.Model] = None
logit_extractor: Optional[tf.keras.Model] = None
final_weights:   Optional[np.ndarray]     = None
final_bias:      Optional[np.ndarray]     = None
gemini_client:   Optional[genai.Client]   = None
TEMPERATURE:     float                    = float(os.getenv("TEMPERATURE", "0.5576"))

# Lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    global cnn_model, logit_extractor, final_weights, final_bias, gemini_client, TEMPERATURE

    # Validate secrets
    gemini_key = os.getenv("GEMINI_API_KEY")
    if not gemini_key:
        raise RuntimeError("GEMINI_API_KEY secret is missing. Add it in Space settings.")

    hf_token = os.getenv("HF_TOKEN")
    if not hf_token:
        log.warning("HF_TOKEN not set — download will be unauthenticated (fine for public repos).")

    # Gemini client
    log.info("Initialising Gemini client...")
    gemini_client = genai.Client(api_key=gemini_key)
    log.info("Gemini ready.")

    # HuggingFace login
    if hf_token:
        login(token=hf_token, add_to_git_credential=False)
        log.info("Logged in to HuggingFace Hub.")

    hf_repo   = os.getenv("HF_REPO_ID",    "rarfileexe/Xpathology-Colon-Specialist")
    hf_file   = os.getenv("HF_MODEL_FILE", "xpathology_colon_specialist_b1.keras")
    temp_file = os.getenv("HF_TEMP_FILE",  "temperature_value.npy")

    # Download model
    log.info(f"Downloading model from {hf_repo} ...")
    model_path = hf_hub_download(
        repo_id  = hf_repo,
        filename = hf_file,
        token    = hf_token,
    )
    log.info(f"Model cached at: {model_path}")

    # Download temperature
    try:
        t_path = hf_hub_download(
            repo_id  = hf_repo,
            filename = temp_file,
            token    = hf_token,
        )
        TEMPERATURE = float(np.load(t_path)[0])
        log.info(f"Temperature T loaded from repo: {TEMPERATURE:.4f}")
    except Exception:
        log.warning(f"temperature_value.npy not found in repo — using T={TEMPERATURE:.4f} from env/default.")

    # Load model
    log.info("Loading EfficientNetB1 weights...")
    cnn_model = models.load_model(model_path, safe_mode=False)
    log.info(f"Model loaded. Input shape: {cnn_model.input_shape}")

    # Calibrated logit extractor
    logit_extractor = tf.keras.Model(
        inputs  = cnn_model.input,
        outputs = cnn_model.get_layer("intermediate_dropout").output,
        name    = "logit_extractor",
    )
    dense_layer              = cnn_model.get_layer("colon_specialist_output")
    final_weights, final_bias = dense_layer.get_weights()
    log.info("Logit extractor ready.")

    # Warm-up pass
    log.info("Running warm-up inference pass...")
    dummy = np.zeros((1, IMG_SIZE[0], IMG_SIZE[1], 3), dtype=np.float32)
    logit_extractor(dummy, training=False)
    log.info("Warm-up complete. Server is ready.")

    yield

    log.info("Shutdown — releasing resources.")
    del cnn_model, logit_extractor, gemini_client
    gc.collect()

# App
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title       = "X-Pathology API",
    description = "AI-assisted colorectal histopathology screening — research use only.",
    version     = "3.1.0",
    lifespan    = lifespan,
)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

allowed_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "*").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins     = allowed_origins,
    allow_credentials = True,
    allow_methods     = ["GET", "POST"],
    allow_headers     = ["*"],
)

# Inference helpers
def calibrated_predict(img_array: np.ndarray) -> tuple[int, float, np.ndarray]:
    """Temperature-scaled softmax prediction.
    img_array: float32 (1, 240, 240, 3) range [0, 255].
    Returns (class_idx, confidence_pct, all_probs).
    """
    features  = logit_extractor(img_array, training=False).numpy()
    logits    = features @ final_weights + final_bias
    scaled    = logits / TEMPERATURE
    exp_l     = np.exp(scaled - scaled.max(axis=1, keepdims=True))
    probs     = (exp_l / exp_l.sum(axis=1, keepdims=True)).flatten()
    class_idx = int(np.argmax(probs))
    return class_idx, float(probs[class_idx]) * 100.0, probs


def generate_gradcam(img_array: np.ndarray, class_idx: int) -> np.ndarray:
    """Grad-CAM for EfficientNetB1 — taps block7a_project_bn."""
    try:
        last_conv = cnn_model.get_layer("efficientnetb1").get_layer("block7a_project_bn")
        feat_model = tf.keras.Model(inputs=cnn_model.input, outputs=last_conv.output)
    except (ValueError, AttributeError):
        gap_input  = cnn_model.get_layer("spatial_pooling").input
        feat_model = tf.keras.Model(inputs=cnn_model.input, outputs=gap_input)

    with tf.GradientTape() as tape:
        conv_out = feat_model(img_array, training=False)
        tape.watch(conv_out)
        x = conv_out
        for name in ["spatial_pooling", "head_bn", "uncertainty_dropout",
                     "intermediate_dense", "intermediate_bn",
                     "intermediate_relu", "intermediate_dropout",
                     "colon_specialist_output"]:
            try:
                x = cnn_model.get_layer(name)(x, training=False)
            except Exception:
                pass
        score = x[:, class_idx]

    grads   = tape.gradient(score, conv_out)
    pooled  = tf.reduce_mean(grads, axis=(0, 1, 2))
    heatmap = tf.reduce_mean(conv_out[0] * pooled, axis=-1)
    heatmap = tf.maximum(heatmap, 0)
    max_v   = tf.math.reduce_max(heatmap)
    if max_v > 0:
        heatmap = heatmap / max_v
    return heatmap.numpy().astype(np.float32)


# Core processing
def process_image_sync(contents: bytes) -> dict:
    t0 = time.perf_counter()

    # Decode
    nparr        = np.frombuffer(contents, np.uint8)
    original_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if original_bgr is None:
        raise ValueError("Cannot decode image. Please upload a valid JPEG or PNG patch.")

    original_rgb  = cv2.cvtColor(original_bgr, cv2.COLOR_BGR2RGB)
    h_orig, w_orig = original_bgr.shape[:2]

    resized    = cv2.resize(original_rgb, IMG_SIZE).astype(np.float32)
    img_tensor = np.expand_dims(resized, axis=0)

    # Predict
    class_idx, confidence, all_probs = calibrated_predict(img_tensor)
    class_code    = CLASS_NAMES[class_idx]
    class_display = CLASS_DISPLAY[class_code]
    severity      = "Malignant" if class_code in MALIGNANT_CLASSES else "Benign"

    prob_breakdown = {
        CLASS_NAMES[i]: round(float(all_probs[i]) * 100, 2)
        for i in range(len(CLASS_NAMES))
    }
    log.info(f"Prediction: {class_code} ({severity}) — {confidence:.1f}%  T={TEMPERATURE:.4f}")

    # Grad-CAM
    heatmap         = generate_gradcam(img_tensor, class_idx)
    heatmap_resized = cv2.resize(heatmap, (w_orig, h_orig))
    heatmap_uint8   = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    overlay_bgr     = cv2.addWeighted(original_bgr, 0.6, heatmap_colored, 0.4, 0)
    overlay_rgb     = cv2.cvtColor(overlay_bgr, cv2.COLOR_BGR2RGB)

    # PIL for Gemini
    original_pil = Image.fromarray(original_rgb)
    overlay_pil  = Image.fromarray(overlay_rgb)

    # Convert PIL to bytes for google-genai SDK
    def pil_to_bytes(img: Image.Image) -> bytes:
        buf = __import__("io").BytesIO()
        img.save(buf, format="JPEG", quality=90)
        return buf.getvalue()

    mus_str_note = (
        "\nNOTE: The model has lower F1 for MUS and STR due to histological similarity "
        "at patch level. Reflect this uncertainty explicitly in both report sections."
        if class_code in ("MUS", "STR") else ""
    )

    prompt = f"""You are an expert pathologist and an empathetic patient communicator.

Two images are provided:
1. H&E stained histopathology patch (colorectal tissue).
2. Grad-CAM XAI overlay — warm colors (red/yellow) show regions the CNN focused on.

AI Model : XPathology Colon Specialist v3 (EfficientNetB1, 9-class)
Predicted : {class_code} — {class_display}
Status    : {severity}
Confidence: {confidence:.1f}% (temperature-calibrated, T={TEMPERATURE:.4f}){mus_str_note}

Generate a report with EXACTLY these two sections:

**Section 1: Clinical Pathology Report**
Dense technical analysis. Describe morphological features visible in the H&E image. Reference which structures the Grad-CAM heatmap highlighted and why they are consistent or inconsistent with the predicted tissue class. Use appropriate pathology terminology. Do NOT provide a final diagnosis — this is AI-assisted screening only.

**Section 2: Patient-Facing Summary**
Compassionate plain-English summary. Explain what tissue type was found, what the colour heatmap means simply, and clearly state this is an AI research tool that must be reviewed by a qualified pathologist before any medical decision."""

    log.info("Requesting Gemini report...")
    response = gemini_client.models.generate_content(
        model    = "gemini-2.5-flash",
        contents = [
            prompt,
            types.Part.from_bytes(data=pil_to_bytes(original_pil), mime_type="image/jpeg"),
            types.Part.from_bytes(data=pil_to_bytes(overlay_pil),  mime_type="image/jpeg"),
        ],
    )
    log.info("Gemini report received.")

    # Base64 overlay for frontend
    _, buf  = cv2.imencode(".jpg", overlay_bgr, [cv2.IMWRITE_JPEG_QUALITY, 90])
    img_b64 = base64.b64encode(buf).decode("utf-8")

    elapsed = round(time.perf_counter() - t0, 2)
    log.info(f"Request done in {elapsed}s")

    return {
        "prediction"            : class_code,
        "prediction_display"    : class_display,
        "severity"              : severity,
        "confidence"            : round(confidence, 1),
        "temperature_applied"   : round(TEMPERATURE, 4),
        "probability_breakdown" : prob_breakdown,
        "gradcam_image_base64"  : f"data:image/jpeg;base64,{img_b64}",
        "full_report"           : response.text,
        "processing_time_s"     : elapsed,
    }


# Endpoints
@app.get("/api/health")
async def health_check():
    return {
        "status"      : "healthy",
        "model"       : "EfficientNetB1-9class-ColonSpecialist",
        "version"     : "3.1.0",
        "temperature" : TEMPERATURE,
        "classes"     : CLASS_NAMES,
    }


@app.post("/api/analyze")
@limiter.limit("5/minute")
async def analyze_slide(request: Request, file: UploadFile = File(...)):
    if file.content_type and file.content_type not in ALLOWED_MIME:
        return JSONResponse(
            status_code=415,
            content={"error": f"Unsupported type '{file.content_type}'. Upload JPEG or PNG."},
        )

    contents = await file.read()

    if len(contents) == 0:
        return JSONResponse(status_code=400, content={"error": "Empty file received."})

    if len(contents) > MAX_FILE_BYTES:
        return JSONResponse(
            status_code=413,
            content={"error": "File exceeds 10 MB limit."},
        )

    try:
        result = await run_in_threadpool(process_image_sync, contents)
        return JSONResponse(status_code=200, content=result)
    except ValueError as ve:
        log.warning(f"Bad request: {ve}")
        return JSONResponse(status_code=400, content={"error": str(ve)})
    except Exception as e:
        log.exception(f"Unhandled error: {e}")
        return JSONResponse(
            status_code=500,
            content={"error": "Internal server error. Please try again later."},
        )


# Entry
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host    = os.getenv("HOST", "0.0.0.0"),
        port    = int(os.getenv("PORT", "7860")),
        workers = 1,
    )