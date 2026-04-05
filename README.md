<div align="center">

# X-Pathology 🔬

### Explainable AI-Assisted Oncology Screening for Histopathology

**Classify · Explain · Report — in one pipeline.**

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Hugging Face](https://img.shields.io/badge/🤗_Hugging_Face-FFD21E?style=for-the-badge)](https://huggingface.co/rarfileexe/XPathology-CNN_2.0_advance)

---

<p align="center">
  <strong>Built by</strong>&nbsp;
  <a href="https://www.linkedin.com/company/AgenticEra-Systems">AgenticEra Systems</a>
  &nbsp;·&nbsp;
  <strong>Developed by</strong>&nbsp;
  <a href="https://github.com/Muhammad-Hassan12">Syed Muhammad Hassan</a>
</p>

<p align="center">
  <em>A portfolio project for research & educational purposes only.</em>
</p>

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Pipeline](#-architecture--pipeline)
- [Supported Classifications](#-supported-classifications)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Docker Deployment](#-docker-deployment)
- [Security & Optimization](#-security--optimization)
- [Model Details](#-model-details)
- [Architecture Evolution](#-architecture-evolution)
- [Author & Acknowledgements](#-author--acknowledgements)
- [Medical Disclaimer](#%EF%B8%8F-medical-disclaimer)
- [License](#-license)

---

## 🧬 Overview

**X-Pathology** is an end-to-end **Explainable AI (XAI)** pipeline designed to bridge the gap between deep learning diagnostics and clinical interpretability. Built to analyze **H&E-stained histopathology slides**, this system provides rapid, transparent, and highly calibrated multi-organ tissue analysis for colon and lung histopathology.

Instead of relying on a "black box" prediction, X-Pathology employs a **multimodal architecture** that visually explains its reasoning through Grad-CAM heatmaps and generates compassionate, human-readable reports via Google's Gemini LLM — producing **dual-persona output** for both oncologists and patients.

> **Why X-Pathology?**  
> The "X" stands for **Explainability** — the core philosophy that every AI prediction in a medical context must be transparent, interpretable, and verifiable by a human expert.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **5-Class Tissue Classification** | Classifies colon & lung histopathology across 5 distinct tissue states with ~98% accuracy using an optimized MobileNetV2 backbone. |
| **Grad-CAM Visual Explainability** | Custom XAI layer generates precise heatmaps highlighting the exact cellular structures and architectural aberrations driving CNN predictions. |
| **Dual-Persona LLM Reporting** | Gemini 2.5 Flash acts as a clinical safety layer — visually verifying the heatmap and generating both a dense **Clinical Pathology Report** (for oncologists) and a jargon-free **Patient-Facing Summary**. |
| **Interactive Sample Gallery** | 5 pre-loaded histopathology slides for instant demo — no upload needed. Reviewers can test every class immediately. |
| **Medical Disclaimer System** | First-visit modal with persistent acknowledgement, plus a permanent footer warning banner ensuring responsible use. |
| **Decoupled Architecture** | Async FastAPI backend (Docker-optimized) + premium Next.js 16 dark UI — fully decoupled for independent scaling. |
| **Production Security** | Rate limiting via `slowapi`, CORS configuration, file size validation, request timeouts, and environment-variable-based secrets management. |

---

## 🏗️ Architecture & Pipeline

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                           X-PATHOLOGY PIPELINE                              │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐     ┌──────────────────┐     ┌──────────────────────────┐  │
│   │   Next.js    │     │    FastAPI       │     │    Model Inference       │  │
│   │   Frontend   │────▶│    Backend       │────▶│    (MobileNetV2)        │  │
│   │              │     │                  │     │                          │  │
│   │  • Upload    │     │  • Image decode  │     │  • 224×224 preprocessing │  │
│   │  • Sample    │     │  • Validation    │     │  • 5-class softmax       │  │
│   │    Gallery   │     │  • Rate limiting │     │  • Confidence scoring    │  │
│   └──────────────┘     └────────┬─────────┘     └─────────┬────────────────┘  │
│                                │                          │                   │
│                                │                          ▼                   │
│                                │                ┌──────────────────────┐      │
│                                │                │   Grad-CAM Engine    │      │
│                                │                │                      │      │
│                                │                │  • GradientTape      │      │
│                                │                │  • Heatmap gen       │      │
│                                │                │  • OpenCV overlay    │      │
│                                │                └──────────┬───────────┘      │
│                                │                           │                  │
│                                │                           ▼                  │
│                                │                ┌──────────────────────┐      │
│                                │                │  Gemini 2.5 Flash    │      │
│                                │                │  (LLM Guardrail)     │      │
│                                │                │                      │      │
│                                │                │  • Visual verify     │      │
│                                │                │  • Dual-persona      │      │
│                                │                │    report gen        │      │
│   ┌─────────────┐              │                └──────────┬───────────┘      │
│   │  Results     │◀────────────┴─────────────────────────────┘               │
│   │  Dashboard   │                                                            │
│   │              │     Response payload:                                       │
│   │  • Original  │     ┌─────────────────────────────────────┐               │
│   │    slide     │     │ • prediction      (class label)     │               │
│   │  • Grad-CAM  │     │ • severity        (Malignant/Benign)│               │
│   │    overlay   │     │ • confidence      (0-100%)          │               │
│   │  • Clinical  │     │ • gradcam_base64  (heatmap image)   │               │
│   │    report    │     │ • full_report     (LLM text)        │               │
│   │  • Patient   │     └─────────────────────────────────────┘               │
│   │    summary   │                                                            │
│   └─────────────┘                                                            │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Pipeline Steps

| Step | Component | Description |
|:----:|-----------|-------------|
| **01** | **Upload H&E Slide** | User uploads a histopathology tissue section image (JPEG/PNG) via drag-and-drop, file picker, or by selecting from the pre-loaded sample gallery. |
| **02** | **MobileNetV2 CNN Inference** | The image is resized to 224×224, preprocessed, and passed through the fine-tuned MobileNetV2 model. A 5-class softmax layer produces calibrated probability scores. |
| **03** | **Grad-CAM XAI Heatmap** | `tf.GradientTape` computes gradients against the predicted class through the final convolutional block. The resulting heatmap is resized, colorized (JET), and superimposed on the original slide at 60/40 opacity. |
| **04** | **Gemini LLM Analysis** | Both the original slide *and* the Grad-CAM overlay are sent to Google's Gemini 2.5 Flash multimodal model with a structured clinical prompt. The LLM visually verifies the heatmap focus areas and generates a structured dual-persona report. |
| **05** | **Dual-Persona Report** | The frontend renders: the original input, the explainability overlay, a **Clinical Pathology Report** (dense, technical — for oncologists), and a **Patient-Facing Summary** (compassionate, plain-English — for patients). |

---

## 🎯 Supported Classifications

The CNN model classifies H&E-stained histopathology slides into **5 tissue categories** across two organ systems:

| # | Class | Organ | Type | Description |
|:-:|-------|:-----:|:----:|-------------|
| 1 | **Colon Adenocarcinoma** | Colon | 🔴 Malignant | Glandular epithelial cancer of the colon |
| 2 | **Colon Benign Tissue** | Colon | 🟢 Benign | Normal/non-cancerous colon tissue |
| 3 | **Lung Adenocarcinoma** | Lung | 🔴 Malignant | Glandular epithelial cancer of the lung |
| 4 | **Lung Benign Tissue** | Lung | 🟢 Benign | Normal/non-cancerous lung tissue |
| 5 | **Lung Squamous Cell Carcinoma** | Lung | 🔴 Malignant | Squamous epithelial cancer of the lung |

---

## 🛠️ Tech Stack

### Frontend — Clinical UI
| Technology | Role |
|------------|------|
| **React 19** / **Next.js 16** (App Router) | Server-rendered UI framework with component-based architecture |
| **TypeScript** | Type-safe development across all components |
| **Tailwind CSS v4** | Utility-first styling + custom CSS design system with dark mode variables |
| **Google Fonts** (Syne, DM Mono, DM Sans) | Premium typography system — display, monospace, and body families |
| **Vercel** | Production frontend deployment with edge CDN |

### Backend — AI & API
| Technology | Role |
|------------|------|
| **Python** / **FastAPI** / **Uvicorn** | High-performance async API server with automatic OpenAPI docs |
| **TensorFlow** / **Keras** | Deep learning framework powering the MobileNetV2 fine-tuned model |
| **OpenCV** (Headless) | Image preprocessing, Grad-CAM heatmap colorization, and overlay compositing |
| **Google Generative AI SDK** | Gemini 2.5 Flash multimodal LLM for clinical report generation |
| **Hugging Face Hub** | Cloud-hosted model registry for versioned CNN weight management |
| **SlowAPI** | Rate limiting middleware (5 requests/minute per client) |
| **python-dotenv** | Secure environment variable management |

### Infrastructure & DevOps
| Technology | Role |
|------------|------|
| **Docker** | Containerized backend with layer-cached ML dependencies |
| **Hugging Face Spaces** | Backend API hosting (Docker SDK, port 7860) |

---

## 📁 Project Structure

```
X-Pathology/
├── README.md
├── .gitattributes
│
├── xpathology-backend/                 # FastAPI Backend
│   ├── main.py                         # Core API — inference, Grad-CAM, Gemini integration
│   ├── requirements.txt                # Python dependencies
│   ├── Dockerfile                      # Production container (Python 3.10-slim)
│   ├── .env.example                    # Environment variable template
│   └── .gitignore
│
└── xpathology-frontend/               # Next.js Frontend
    └── my-app/
        ├── app/
        │   ├── layout.tsx              # Root layout — fonts, metadata, SEO
        │   ├── page.tsx                # Main analysis page — upload, results dashboard
        │   ├── globals.css             # Design system — CSS variables, animations, utilities
        │   ├── Favicon.png             # App favicon
        │   ├── about/
        │   │   └── page.tsx            # About page — architecture evolution, team, tech stack
        │   └── components/
        │       ├── Header.tsx          # Sticky header — nav, branding, GitHub link
        │       ├── Footer.tsx          # Footer — disclaimer banner, social links, status
        │       └── DisclaimerModal.tsx  # First-visit medical disclaimer (localStorage persisted)
        ├── public/
        │   └── sample/                 # Pre-loaded sample histopathology slides
        │       ├── colon_aca_sample.jpg
        │       ├── colon_n_sample.jpg
        │       ├── lung_aca_sample.jpeg
        │       ├── lung_n_sample.jpeg
        │       └── lung_scc_samlpe.jpeg
        ├── package.json
        ├── tsconfig.json
        ├── next.config.ts
        ├── postcss.config.mjs
        └── eslint.config.mjs
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18.x & **npm** ≥ 9.x
- **Python** ≥ 3.10
- A **Google Gemini API Key** ([get one here](https://aistudio.google.com/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/Muhammad-Hassan12/X-Pathology.git
cd X-Pathology
```

### 2. Setup the Backend (FastAPI)

```bash
cd xpathology-backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # macOS / Linux
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables

Copy the example and add your keys:

```bash
cp .env.example .env
```

Then edit `.env`:

```env
GEMINI_API_KEY=your_google_gemini_api_key_here

# Optional
HF_TOKEN=                       # Required only for private HF repos
ALLOWED_ORIGINS=*               # Comma-separated allowed CORS origins
HOST=0.0.0.0
PORT=8000
```

#### Start the Backend Server

```bash
python main.py
# ✅ Server running at http://localhost:8000
# 📄 API docs at   http://localhost:8000/docs
```

### 3. Setup the Frontend (Next.js)

Open a **new terminal**:

```bash
cd xpathology-frontend/my-app

# Install Node dependencies
npm install

# Start the development server
npm run dev
# ✅ Frontend running at http://localhost:3000
```

> **Note:** Set the `NEXT_PUBLIC_API_URL` environment variable if your backend runs on a different host/port.

---

## 🔑 Environment Variables

### Backend (`xpathology-backend/.env`)

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `GEMINI_API_KEY` | ✅ | — | Google Gemini API key for LLM report generation |
| `HF_TOKEN` | ❌ | — | Hugging Face access token (only for private model repos) |
| `ALLOWED_ORIGINS` | ❌ | `*` | Comma-separated CORS allowed origins |
| `HOST` | ❌ | `0.0.0.0` | Server bind host |
| `PORT` | ❌ | `8000` | Server bind port |

### Frontend

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `NEXT_PUBLIC_API_URL` | ❌ | `https://rarfileexe-xpathology-backend.hf.space` | Backend API base URL |

---

## 🐳 Docker Deployment

The backend includes a production-ready Dockerfile optimized for **Hugging Face Spaces** deployment:

```dockerfile
FROM python:3.10-slim
WORKDIR /app

# Layer-cached dependency installation
COPY requirements.txt /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Non-root user for security
RUN useradd -m -u 1000 user
USER user

COPY --chown=user:user . /app
EXPOSE 7860
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "7860"]
```

### Build & Run Locally

```bash
cd xpathology-backend

docker build -t xpathology-backend .
docker run -p 7860:7860 --env-file .env xpathology-backend
```

### Key Optimizations

- **Layer caching:** `requirements.txt` is copied and installed *before* source code, so rebuilds that only change application code skip the heavy ML dependency installation.
- **Non-root execution:** Runs under a dedicated `user` account (UID 1000) following container security best practices.
- **Slim base image:** `python:3.10-slim` minimizes attack surface and image size.

---

## 🔒 Security & Optimization

| Measure | Implementation |
|---------|----------------|
| **Rate Limiting** | `slowapi` middleware limits API requests to **5/minute per client IP**, protecting against DoS attacks and Gemini API quota exhaustion. |
| **Thread Pooling** | Heavy TensorFlow inference and synchronous OpenCV operations are routed through `fastapi.concurrency.run_in_threadpool` to prevent async event-loop blocking. |
| **File Size Validation** | Uploaded files are capped at **10 MB** with server-side validation before processing. |
| **Request Timeouts** | Frontend enforces a **35-second** `AbortController` timeout on API calls. |
| **Secret Management** | All API keys are loaded from environment variables via `python-dotenv` — never hardcoded. The server refuses to start if `GEMINI_API_KEY` is missing. |
| **CORS Configuration** | Configurable allowed origins via `ALLOWED_ORIGINS` environment variable. |
| **Medical Disclaimer** | First-visit modal with `localStorage` persistence + persistent footer warning banner on every page. |

---

## 🧠 Model Details

| Property | Value |
|----------|-------|
| **Architecture** | MobileNetV2 (fine-tuned) |
| **Input Size** | 224 × 224 × 3 (RGB) |
| **Output** | 5-class softmax |
| **Model Size** | ~8.6 MB |
| **Accuracy** | ~98% on validation set |
| **Preprocessing** | `keras.applications.mobilenet_v2.preprocess_input` |
| **Grad-CAM Target** | `mobilenetv2_1.00_224` (final convolutional block) |
| **Hosted On** | [🤗 Hugging Face Hub](https://huggingface.co/rarfileexe/XPathology-CNN_2.0_advance) |
| **File** | `xpathology_v2_5class_finetuned.keras` |

The model is automatically downloaded from Hugging Face Hub at server startup. No manual download is required.

---

## 📈 Architecture Evolution

X-Pathology underwent a significant architectural evolution to meet production-grade standards:

### Version 1.0 — VGG16 Baseline *(Deprecated)*

- **Architecture:** VGG16 (heavyweight, 150+ MB)
- **Task:** Binary classification (Colon Adenocarcinoma vs. Normal)
- **Issue:** The massive parameter count acting on a simple binary sigmoid output led to mathematical saturation — producing "100% confidence" predictions even on out-of-distribution data. In clinical settings, *nuance is critical*.

### Version 2.0 — MobileNetV2 *(Current)*

- **Architecture:** MobileNetV2 (8.6 MB — a **17× size reduction**)
- **Task:** 5-class multi-organ classification (Colon + Lung)
- **Key Improvements:**
  - ✅ **Precision Calibration** — 5-class softmax eliminates binary saturation, forcing the model to learn nuanced morphological features.
  - ✅ **Radical Efficiency** — 17× smaller model enables near-instantaneous inference and seamless cloud deployment.
  - ✅ **Enhanced XAI** — MobileNetV2's streamlined convolutional blocks produce tighter, more precise Grad-CAM heatmaps.

---

## 🧑‍💻 Author & Acknowledgements

<table>
  <tr>
    <td align="center" width="200">
      <a href="https://github.com/Muhammad-Hassan12">
        <img src="https://github.com/Muhammad-Hassan12.png" width="100" style="border-radius:50%;" alt="Syed Muhammad Hassan"/>
        <br />
        <strong>Syed Muhammad Hassan</strong>
      </a>
      <br />
      <sub>Co-Founder & Lead AI Engineer</sub>
      <br />
      <sub><a href="https://www.linkedin.com/company/AgenticEra-Systems">AgenticEra Systems</a></sub>
      <br /><br />
      <a href="https://github.com/Muhammad-Hassan12">
        <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" />
      </a>
      <a href="https://www.linkedin.com/in/syed-muhammad-hassan-aa112928b/">
        <img src="https://img.shields.io/badge/LinkedIn-0A66C2?style=flat-square&logo=linkedin&logoColor=white" />
      </a>
    </td>
  </tr>
</table>

> *Every line of code, the full-stack architecture, and the CNN model training were developed entirely by me. AI coding assistants (Gemini & Antigravity) were used as development accelerators during the build process.*

### Built By

<a href="https://www.linkedin.com/company/AgenticEra-Systems">
  <img src="https://img.shields.io/badge/AgenticEra_Systems-00D296?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0id2hpdGUiPjxwYXRoIGQ9Ik0xMiAyTDIgN2wxMCA1IDEwLTV6TTIgMTdsNSAyLjVWMTMuNUw3LjUgMTRWMTdMNi41IDE2LjVMOCAxNHYtMS44TDIgMTd6Ii8+PC9zdmc+&logoColor=white" alt="AgenticEra Systems" />
</a>

*Pioneering the intersection of agentic AI and real-world applications. From intelligent code assistants to medical diagnostics — we build AI systems that augment human expertise with precision and responsibility.*

---

## ⚠️ Medical Disclaimer

> **IMPORTANT:** X-Pathology is developed by [AgenticEra Systems](https://www.linkedin.com/company/AgenticEra-Systems) for **research, portfolio, and educational purposes only**.

- 🔬 This is an **AI-assisted screening prototype** — it is **NOT** FDA-approved diagnostic software.
- ⚕️ It is **NOT** a substitute for professional diagnosis by a licensed, board-certified pathologist.
- 📋 All AI-generated results **must be reviewed and verified** by a qualified medical professional.
- 🚫 **Do NOT** make any clinical or treatment decisions based solely on this tool's output.

---

## 📄 License

This project is provided as-is for educational and portfolio purposes. All rights reserved by [Syed Muhammad Hassan](https://github.com/Muhammad-Hassan12).

---

<div align="center">
  <sub>
    Made with ❤️ and a lot of ☕ by <a href="https://github.com/Muhammad-Hassan12">Syed Muhammad Hassan</a> at <a href="https://www.linkedin.com/company/AgenticEra-Systems">AgenticEra Systems</a>
  </sub>
  <br />
  <sub>
    🔬 X-Pathology v2.0 · MobileNetV2 · Grad-CAM XAI · Gemini 2.5 Flash
  </sub>
</div>
