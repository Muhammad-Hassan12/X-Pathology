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
from fastapi import FastAPI, UploadFile, File, Form, Request
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
MAX_FILE_BYTES = 10 * 1024 * 1024  # 10 MB
ALLOWED_MIME   = {"image/jpeg", "image/png", "image/tiff"}

# Globals
gemini_client:   Optional[genai.Client]   = None

SPECIALISTS = {
    "colon": {
        "model": None,
        "logit_extractor": None,
        "final_weights": None,
        "final_bias": None,
        "temperature": 0.5576,
        "class_names": ["ADI", "BACK", "DEB", "LYM", "MUC", "MUS", "NORM", "STR", "TUM"],
        "class_display": {
            "ADI":  "Adipose Tissue",
            "BACK": "Background",
            "DEB":  "Debris / Necrosis",
            "LYM":  "Lymphocytes",
            "MUC":  "Mucus",
            "MUS":  "Smooth Muscle",
            "NORM": "Normal Colon Mucosa",
            "STR":  "Cancer-Associated Stroma",
            "TUM":  "Colorectal Adenocarcinoma (Tumour)",
        },
        "img_size": (240, 240),
        "gradcam_layer": "block7a_project_bn",
        "backbone_name": "efficientnetb1",
        "output_layer": "colon_specialist_output",
        "logit_layer": "intermediate_dropout",
    },
    "brain": {
        "model": None,
        "logit_extractor": None,
        "final_weights": None,
        "final_bias": None,
        "temperature": 0.7867,
        "class_names": ["glioma", "meningioma", "notumor", "pituitary"],
        "class_display": {
            "glioma": "Glioma",
            "meningioma": "Meningioma",
            "notumor": "No Tumor Detected",
            "pituitary": "Pituitary Tumor"
        },
        "img_size": (224, 224),
        "gradcam_layer": "top_conv",
        "backbone_name": "efficientnetb0",
        "output_layer": "brain_specialist_output",
        "logit_layer": "uncertainty_dropout",
    }
}

def get_severity(specialist: str, predicted_class: str) -> str:
    if specialist == "colon":
        return "Malignant" if predicted_class == "TUM" else "Benign"
    elif specialist == "brain":
        if predicted_class == "glioma": return "High Concern"
        if predicted_class in ["meningioma", "pituitary"]: return "Moderate Concern"
        if predicted_class == "notumor": return "No Tumor Detected"
    return "Unknown"

# Lifespan
@asynccontextmanager
async def lifespan(app: FastAPI):
    global gemini_client

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

    hf_colon_repo   = os.getenv("HF_REPO_ID",    "rarfileexe/Xpathology-Colon-Specialist")
    hf_colon_file   = os.getenv("HF_MODEL_FILE", "xpathology_colon_specialist_b1.keras")
    hf_colon_temp   = os.getenv("HF_TEMP_FILE",  "temperature_value.npy")
    
    hf_brain_repo   = os.getenv("HF_BRAIN_REPO_ID", "rarfileexe/xpathology-brain-specialist")
    hf_brain_file   = os.getenv("HF_BRAIN_MODEL_FILE", "xpathology_brain_specialist_b0.keras")
    hf_brain_temp   = os.getenv("HF_BRAIN_TEMP_FILE", "brain_temperature_value.npy")

    model_configs = {
        "colon": (hf_colon_repo, hf_colon_file, hf_colon_temp),
        "brain": (hf_brain_repo, hf_brain_file, hf_brain_temp),
    }

    for spec_name, (repo, file_name, temp_file) in model_configs.items():
        log.info(f"Downloading model {spec_name} from {repo} ...")
        model_path = hf_hub_download(
            repo_id  = repo,
            filename = file_name,
            token    = hf_token,
        )
        log.info(f"{spec_name} model cached at: {model_path}")

        spec_cfg = SPECIALISTS[spec_name]
        try:
            t_path = hf_hub_download(
                repo_id  = repo,
                filename = temp_file,
                token    = hf_token,
            )
            spec_cfg["temperature"] = float(np.load(t_path)[0])
            log.info(f"{spec_name} Temperature T loaded from repo: {spec_cfg['temperature']:.4f}")
        except Exception:
            log.warning(f"{temp_file} not found in {repo} — using fallback T={spec_cfg['temperature']:.4f}.")

        log.info(f"Loading {spec_name} weights...")
        loaded_model = models.load_model(model_path, safe_mode=False)
        spec_cfg["model"] = loaded_model
        log.info(f"{spec_name} loaded. Input shape: {loaded_model.input_shape}")

        extractor = tf.keras.Model(
            inputs  = loaded_model.input,
            outputs = loaded_model.get_layer(spec_cfg["logit_layer"]).output,
            name    = f"{spec_name}_logit_extractor",
        )
        spec_cfg["logit_extractor"] = extractor
        dense_layer = loaded_model.get_layer(spec_cfg["output_layer"])
        w, b = dense_layer.get_weights()
        spec_cfg["final_weights"] = w
        spec_cfg["final_bias"]    = b
        log.info(f"{spec_name} extractor ready.")

        log.info(f"Running warm-up inference for {spec_name}...")
        img_size = spec_cfg["img_size"]
        dummy = np.zeros((1, img_size[0], img_size[1], 3), dtype=np.float32)
        extractor(dummy, training=False)
        
    log.info("Full warm-up complete. Server is ready.")

    yield

    log.info("Shutdown — releasing resources.")
    for sp in SPECIALISTS.values():
        if sp["model"] is not None:
            del sp["model"]
        if sp["logit_extractor"] is not None:
            del sp["logit_extractor"]
    del gemini_client
    gc.collect()

# App
limiter = Limiter(key_func=get_remote_address)
app = FastAPI(
    title       = "X-Pathology API",
    description = "AI-assisted multi-model oncology screening — research use only.",
    version     = "4.0.0",
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
def calibrated_predict(img_array: np.ndarray, specialist: str) -> tuple[int, float, np.ndarray]:
    """Temperature-scaled softmax prediction.
    img_array: float32 (1, H, W, 3) range [0, 255].
    Returns (class_idx, confidence_pct, all_probs).
    """
    spec_cfg = SPECIALISTS[specialist]
    features  = spec_cfg["logit_extractor"](img_array, training=False).numpy()
    logits    = features @ spec_cfg["final_weights"] + spec_cfg["final_bias"]
    scaled    = logits / spec_cfg["temperature"]
    exp_l     = np.exp(scaled - scaled.max(axis=1, keepdims=True))
    probs     = (exp_l / exp_l.sum(axis=1, keepdims=True)).flatten()
    class_idx = int(np.argmax(probs))
    return class_idx, float(probs[class_idx]) * 100.0, probs


def generate_gradcam(img_array: np.ndarray, class_idx: int, specialist: str) -> np.ndarray:
    """Grad-CAM for selected specialist."""
    spec_cfg = SPECIALISTS[specialist]
    model = spec_cfg["model"]
    backbone = spec_cfg["backbone_name"]
    gradcam_layer = spec_cfg["gradcam_layer"]
    
    try:
        if backbone in ["efficientnetb1", "efficientnetb0"]:
            last_conv = model.get_layer(backbone).get_layer(gradcam_layer)
        else:
            last_conv = model.get_layer(gradcam_layer)
        feat_model = tf.keras.Model(inputs=model.input, outputs=last_conv.output)
    except (ValueError, AttributeError):
        gap_input  = model.get_layer("spatial_pooling").input
        feat_model = tf.keras.Model(inputs=model.input, outputs=gap_input)

    # Building the forward-pass layer chain dynamically per specialist.
    # The colon model has: spatial_pooling → head_bn → uncertainty_dropout →
    #   intermediate_dense → intermediate_bn → intermediate_relu → intermediate_dropout → output
    # The brain model is simpler: spatial_pooling → head_bn → uncertainty_dropout → output
    # The following list contains all possible layers; missing ones are silently skipped.
    forward_layers = [
        "spatial_pooling", "head_bn", "uncertainty_dropout",
        "intermediate_dense", "intermediate_bn",
        "intermediate_relu", "intermediate_dropout",
        spec_cfg["output_layer"],
    ]

    with tf.GradientTape() as tape:
        conv_out = feat_model(img_array, training=False)
        tape.watch(conv_out)
        x = conv_out
        for name in forward_layers:
            try:
                layer = model.get_layer(name)
                x = layer(x, training=False)
            except ValueError:
                continue
        score = x[:, class_idx]

    grads = tape.gradient(score, conv_out)
    if grads is None:
        h, w = conv_out.shape[1], conv_out.shape[2]
        return np.zeros((h, w), dtype=np.float32)
    pooled  = tf.reduce_mean(grads, axis=(0, 1, 2))
    heatmap = tf.reduce_mean(conv_out[0] * pooled, axis=-1)
    heatmap = tf.maximum(heatmap, 0)
    max_v   = tf.math.reduce_max(heatmap)
    if max_v > 0:
        heatmap = heatmap / max_v
    return heatmap.numpy().astype(np.float32)


def anatomical_plausibility_check(heatmap, predicted_class):
    h, w = heatmap.shape
    y_coords = np.arange(h)
    x_coords = np.arange(w)

    row_weights = heatmap.mean(axis=1)
    col_weights = heatmap.mean(axis=0)

    if row_weights.sum() == 0 or col_weights.sum() == 0:
        return False, "Anatomically consistent"

    centroid_y = np.average(y_coords, weights=row_weights)
    centroid_x = np.average(x_coords, weights=col_weights)
    norm_y = centroid_y / h
    norm_x = centroid_x / w

    if predicted_class == "pituitary":
        if norm_y < 0.55 or abs(norm_x - 0.5) > 0.35:
            return True, "Activation outside expected pituitary region (lower-centre)"

    if predicted_class == "glioma":
        if norm_y > 0.75 and abs(norm_x - 0.5) < 0.2:
            return True, "Activation in pituitary region — possible misclassification"

    return False, "Anatomically consistent"

# Core processing
def process_image_sync(contents: bytes, specialist: str) -> dict:
    t0 = time.perf_counter()

    # Decode
    nparr        = np.frombuffer(contents, np.uint8)
    original_bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if original_bgr is None:
        raise ValueError("Cannot decode image. Please upload a valid JPEG or PNG patch.")

    original_rgb  = cv2.cvtColor(original_bgr, cv2.COLOR_BGR2RGB)
    h_orig, w_orig = original_bgr.shape[:2]

    spec_cfg = SPECIALISTS[specialist]
    resized    = cv2.resize(original_rgb, spec_cfg["img_size"]).astype(np.float32)
    img_tensor = np.expand_dims(resized, axis=0)

    # Predict
    class_idx, confidence, all_probs = calibrated_predict(img_tensor, specialist)
    class_code    = spec_cfg["class_names"][class_idx]
    class_display = spec_cfg["class_display"][class_code]
    severity      = get_severity(specialist, class_code)

    prob_breakdown = {
        spec_cfg["class_names"][i]: round(float(all_probs[i]) * 100, 2)
        for i in range(len(spec_cfg["class_names"]))
    }
    log.info(f"Prediction: {class_code} ({severity}) — {confidence:.1f}%  T={spec_cfg['temperature']:.4f}")

    # Grad-CAM
    heatmap         = generate_gradcam(img_tensor, class_idx, specialist)
    heatmap_resized = cv2.resize(heatmap, (w_orig, h_orig))
    heatmap_uint8   = np.uint8(255 * heatmap_resized)
    heatmap_colored = cv2.applyColorMap(heatmap_uint8, cv2.COLORMAP_JET)
    overlay_bgr     = cv2.addWeighted(original_bgr, 0.6, heatmap_colored, 0.4, 0)
    overlay_rgb     = cv2.cvtColor(overlay_bgr, cv2.COLOR_BGR2RGB)

    # PIL for Gemini
    original_pil = Image.fromarray(original_rgb)
    overlay_pil  = Image.fromarray(overlay_rgb)

    # Anatomical Check (Brain only)
    anatomical_note = ""
    is_flagged = False
    if specialist == "brain":
        is_flagged, anatomical_note = anatomical_plausibility_check(heatmap, class_code)
        if not is_flagged:
            anatomical_note = ""

    # Convert PIL to bytes for google-genai SDK
    def pil_to_bytes(img: Image.Image) -> bytes:
        buf = __import__("io").BytesIO()
        img.save(buf, format="JPEG", quality=90)
        return buf.getvalue()

    if specialist == "colon":
        mus_str_note = (
            "\nNOTE: The model has lower F1 for MUS and STR due to histological similarity "
            "at patch level. Reflect this uncertainty explicitly in both report sections."
            if class_code in ("MUS", "STR") else ""
        )
        prompt = f"""You are an expert pathologist and an empathetic patient communicator.

Two images are provided:
1. H&E stained histopathology patch (colorectal tissue).
2. Grad-CAM XAI overlay — warm colors (red/yellow) show regions the CNN focused on.

AI Model : XPathology Colon Specialist v4 (EfficientNetB1, 9-class)
Predicted : {class_code} — {class_display}
Status    : {severity}
Confidence: {confidence:.1f}% (temperature-calibrated, T={spec_cfg['temperature']:.4f}){mus_str_note}

Generate a report with EXACTLY these two sections:

**Section 1: Clinical Pathology Report**
Dense technical analysis. Describe morphological features visible in the H&E image. Reference which structures the Grad-CAM heatmap highlighted and why they are consistent or inconsistent with the predicted tissue class. Use appropriate pathology terminology. Do NOT provide a final diagnosis — this is AI-assisted screening only.

**Section 2: Patient-Facing Summary**
Compassionate plain-English summary. Explain what tissue type was found, what the colour heatmap means simply, and clearly state this is an AI research tool that must be reviewed by a qualified pathologist before any medical decision."""
    else:
        anatomical_flag_text = (
            f"\nNOTE: The Grad-CAM heatmap activation centroid does not align with the expected anatomical location for {class_code}. This prediction may be unreliable. Reflect this uncertainty explicitly in both report sections."
            if is_flagged else ""
        )
        ambiguity_note = (
            "\nNOTE: There is often ambiguity between glioma and meningioma depending on scan slice. Address this explicitly."
            if class_code in ("glioma", "meningioma") else ""
        )
        prompt = f"""You are an expert radiologist and an empathetic patient communicator.

Two images are provided:
1. T1-weighted axial MRI scan.
2. Grad-CAM XAI overlay — warm colors (red/yellow) show regions the CNN focused on.

AI Model : XPathology Brain Specialist (EfficientNetB0, 4-class)
Predicted : {class_code} — {class_display}
Status    : {severity}
Confidence: {confidence:.1f}% (temperature-calibrated, T={spec_cfg['temperature']:.4f}){anatomical_flag_text}{ambiguity_note}

Generate a report with EXACTLY these two sections:

**Section 1: Radiology Report**
Dense technical analysis. Reference T1-weighted MRI signal characteristics, anatomical location, and tumor morphology visible in the scan. Reference which structures the Grad-CAM heatmap highlighted and why they are consistent or inconsistent with the predicted class. Use appropriate radiology terminology. Do NOT provide a final diagnosis — this is AI-assisted screening only, not FDA approved.

**Section 2: Patient-Facing Summary**
Compassionate plain-English summary. Explain what was found, what the colour heatmap means simply, and clearly state this is an AI research tool, not FDA approved, and must be reviewed by a qualified radiologist before any medical decision."""

    # Base64 overlay for frontend
    _, buf  = cv2.imencode(".jpg", overlay_bgr, [cv2.IMWRITE_JPEG_QUALITY, 90])
    img_b64 = base64.b64encode(buf).decode("utf-8")

    # Gemini report
    report_text = ""
    try:
        log.info("Requesting Gemini report...")
        response = gemini_client.models.generate_content(
            model    = "gemini-3.1-flash-lite-preview",
            contents = [
                prompt,
                types.Part.from_bytes(data=pil_to_bytes(original_pil), mime_type="image/jpeg"),
                types.Part.from_bytes(data=pil_to_bytes(overlay_pil),  mime_type="image/jpeg"),
            ],
            config   = types.GenerateContentConfig(
                thinking_config=types.ThinkingConfig(
                    thinking_level="HIGH"
                )
            ),
        )
        report_text = response.text
        log.info("Gemini report received.")
    except Exception as gemini_err:
        log.warning(f"Gemini API failed (non-fatal): {gemini_err}")
        section1_title = "Clinical Pathology Report" if specialist == "colon" else "Radiology Report"
        reviewer = "pathologist" if specialist == "colon" else "radiologist"
        report_text = (
            f"**Section 1: {section1_title}**\n\n"
            "⚠ The AI report is temporarily unavailable due to high demand on the Gemini API. "
            "The CNN classification and Grad-CAM heatmap above remain valid. "
            "Please retry in a few moments to generate the full clinical narrative.\n\n"
            "**Section 2: Patient-Facing Summary**\n\n"
            "The AI classification and visual heatmap have been generated successfully. "
            "However, the detailed written report could not be produced right now due to temporary "
            f"server load. Please try again shortly. Remember — all AI results must be reviewed "
            f"by a qualified {reviewer} before any medical decision."
        )

    elapsed = round(time.perf_counter() - t0, 2)
    log.info(f"Request done in {elapsed}s")

    return {
        "specialist"            : specialist,
        "prediction"            : class_code,
        "prediction_display"    : class_display,
        "severity"              : severity,
        "confidence"            : round(confidence, 1),
        "temperature_applied"   : round(spec_cfg['temperature'], 4),
        "probability_breakdown" : prob_breakdown,
        "anatomical_note"       : anatomical_note,
        "gradcam_image_base64"  : f"data:image/jpeg;base64,{img_b64}",
        "full_report"           : report_text,
        "processing_time_s"     : elapsed,
    }


# Endpoints
@app.get("/api/health")
async def health_check():
    return {
        "status": "healthy",
        "version": "4.0.0",
        "specialists": {
            "colon": {
                "model": "EfficientNetB1-9class",
                "temperature": SPECIALISTS["colon"]["temperature"],
                "classes": SPECIALISTS["colon"]["class_names"]
            },
            "brain": {
                "model": "EfficientNetB0-4class",
                "temperature": SPECIALISTS["brain"]["temperature"],
                "classes": SPECIALISTS["brain"]["class_names"]
            }
        }
    }


@app.post("/api/analyze")
@limiter.limit("5/minute")
async def analyze_slide(
    request: Request,
    file: UploadFile = File(...),
    specialist: str = Form("colon"),
):
    if specialist not in ("colon", "brain"):
        return JSONResponse(status_code=400, content={"error": f"Invalid specialist '{specialist}'. Must be 'colon' or 'brain'."})

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
        result = await run_in_threadpool(process_image_sync, contents, specialist)
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