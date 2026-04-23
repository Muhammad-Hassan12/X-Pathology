<div align="center">

# X-Pathology 🔬

### Explainable AI-Assisted Multi-Specialist Oncology Screening

**Classify · Explain · Report — in one pipeline.**

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![TensorFlow](https://img.shields.io/badge/TensorFlow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white)](https://www.tensorflow.org/)
[![Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Hugging Face](https://img.shields.io/badge/🤗_Hugging_Face-FFD21E?style=for-the-badge)](https://huggingface.co/rarfileexe)

---

<p align="center">
  <strong>Built by</strong>&nbsp;
  <a href="https://www.linkedin.com/company/AgenticEra-Systems">AgenticEra Systems</a>
  &nbsp;·&nbsp;
  <strong>Developed by</strong>&nbsp;
  <a href="https://github.com/Muhammad-Hassan12">Syed Muhammad Hassan</a>
</p>

<p align="center">
  <em>This project is for research & educational purposes only.</em>
</p>

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & Pipeline](#-architecture--pipeline)
- [Supported Classifications](#-supported-classifications)
  - [Colon Specialist (9-Class)](#1-colon-specialist-9-class-histopathology)
  - [Brain Specialist (4-Class)](#2-brain-specialist-4-class-mri)
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

**X-Pathology** is an end-to-end **Explainable AI (XAI)** platform designed to bridge the gap between deep learning diagnostics and clinical interpretability. In its V4 iteration, the platform has evolved into a **Multi-Specialist Architecture**, providing rapid, transparent, and highly calibrated classifications for both **Colorectal Histopathology** and **Brain Tumor MRIs**.

Instead of relying on a "black box" prediction, X-Pathology employs a **multimodal architecture** that visually explains its reasoning through dynamic Grad-CAM heatmaps. It then leverages Google's Gemini LLM via Domain-Adapted Prompting to generate compassionate, human-readable reports — producing **dual-persona output** tailored for both medical professionals (Pathologists/Radiologists) and patients.

> **Why X-Pathology?**  
> The "X" stands for **Explainability** — the core philosophy that every AI prediction in a medical context must be transparent, interpretable, and verifiable by a human expert.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **Multi-Specialist Routing** | Dynamic backend routing seamlessly switches between the Colon Specialist (EfficientNetB1) and the Brain Specialist (EfficientNetB0) based on user selection. |
| **Broad Classification Scope** | 9-class colorectal tissue classification (H&E patches) and 4-class brain tumor classification (T1-weighted axial MRIs). |
| **Temperature-Calibrated Confidence** | Post-training temperature scaling (T=0.5576 for Colon, T=0.7867 for Brain) ensures confidence values are statistically calibrated for clinical decision-support. |
| **Grad-CAM Visual Explainability** | Dynamic XAI layer targeting specific convolutional blocks (`block7a_project_bn` or `top_conv`) to generate precise heatmaps highlighting the exact structures driving CNN predictions. |
| **Anatomical Plausibility Checks** | Advanced heuristic checks on Brain MRI heatmaps to flag out-of-bounds activations (e.g., pituitary activations outside the expected lower-center region). |
| **Domain-Adapted LLM Reporting** | Gemini 2.5 Flash visually verifies the heatmap and generates a **Clinical Report** (using pathology or radiology terminology depending on the specialist) alongside a jargon-free **Patient-Facing Summary**. |
| **Probability Breakdown** | Full probability distribution across all classes displayed as an interactive bar chart in the results dashboard. |
| **Decoupled Architecture** | Async FastAPI backend (Docker-optimized) + premium Next.js 16 dark UI — fully decoupled for independent scaling and Hugging Face Spaces deployment. |
| **Production Security** | Rate limiting via `slowapi`, CORS configuration, file size validation, 60-second fetch timeouts for cold starts, and environment-variable-based secrets management. |

---

## 🏗️ Architecture & Pipeline

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│                           X-PATHOLOGY V4 PIPELINE                            │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐     ┌──────────────────┐     ┌──────────────────────────┐ │
│   │   Next.js    │     │    FastAPI       │     │     Dynamic Routing      │ │
│   │   Frontend   │────▶│    Backend       │────▶│      (Specialist)        │ │
│   │              │     │                  │     │                          │ │
│   │  • Select    │     │  • Image decode  │     │  ▶ Colon (EffNetB1)      │ │
│   │    Specialist│     │  • Validation    │     │  ▶ Brain (EffNetB0)      │ │
│   │  • Upload    │     │  • Rate limiting │     │                          │ │
│   └──────────────┘     └────────┬─────────┘     └─────────┬────────────────┘ │
│                                 │                         │                  │
│                                 │                         ▼                  │
│                                 │               ┌──────────────────────┐     │
│                                 │               │   Grad-CAM Engine    │     │
│                                 │               │                      │     │
│                                 │               │ • Target conv layer  │     │
│                                 │               │ • Anatomical checks  │     │
│                                 │               │ • OpenCV overlay     │     │
│                                 │               └──────────┬───────────┘     │
│                                 │                          │                 │
│                                 │                          ▼                 │
│                                 │               ┌──────────────────────┐     │
│                                 │               │  Gemini 2.5 Flash    │     │
│                                 │               │  (Domain-Adapted)    │     │
│                                 │               │                      │     │
│                                 │               │ • Visual verify      │     │
│                                 │               │ • Dual-persona       │     │
│                                 │               │   report generation  │     │
│   ┌─────────────┐               │               └──────────┬───────────┘     │
│   │  Results    │◀──────────────┴──────────────────────────┘                 │
│   │  Dashboard  │                                                            │
│   │             │     Response payload:                                      │
│   │ • Slide/MRI │     ┌────────────────────────────────────────────────┐     │
│   │ • Grad-CAM  │     │ • prediction       (class code)                │     │
│   │ • Prob bars │     │ • prediction_display (full name)               │     │
│   │ • Clinical  │     │ • severity         (Malignant/Benign)          │     │
│   │   report    │     │ • confidence       (calibrated %)              │     │
│   │ • Patient   │     │ • temperature_applied (T value)                │     │
│   │   summary   │     │ • probability_breakdown (N-class dictionary)   │     │
│   └─────────────┘     │ • gradcam_base64   (heatmap image)             │     │
│                       │ • full_report      (LLM text)                  │     │
│                       └────────────────────────────────────────────────┘     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### Pipeline Steps

| Step | Component | Description |
|:----:|-----------|-------------|
| **01** | **Upload Scan** | User selects a specialist (Colon or Brain) and uploads a scan (H&E patch or MRI) via drag-and-drop or the pre-loaded sample gallery. |
| **02** | **CNN Inference** | The image is routed to the appropriate EfficientNet backbone. Temperature-scaled softmax produces calibrated probability scores. |
| **03** | **Grad-CAM XAI** | `tf.GradientTape` computes gradients through the model-specific final convolutional block. The heatmap is colorized (JET) and superimposed on the original scan. Brain MRIs undergo anatomical plausibility checks. |
| **04** | **Domain-Adapted LLM** | Both the original scan and Grad-CAM overlay are sent to Gemini 2.5 Flash. The prompt dynamically adapts to be a Pathologist (Colon) or Radiologist (Brain) to generate a highly contextual report. |
| **05** | **Results Dashboard** | The frontend renders the original input, explainability overlay, interactive probability breakdown, a **Clinical Report**, and a **Patient-Facing Summary**. |

---

## 🎯 Supported Classifications

### 1. Colon Specialist (9-Class Histopathology)
*Architecture: EfficientNetB1 | Resolution: 240×240*

| # | Code | Full Name | Type | Description |
|:-:|:----:|-----------|:----:|-------------|
| 1 | **ADI** | Adipose Tissue | 🟢 Benign | Fat tissue surrounding the colon |
| 2 | **BACK** | Background | 🟢 Benign | Non-tissue background regions |
| 3 | **DEB** | Debris / Necrosis | 🟢 Benign | Cellular debris and necrotic tissue |
| 4 | **LYM** | Lymphocytes | 🟢 Benign | Immune cell aggregates and infiltrates |
| 5 | **MUC** | Mucus | 🟢 Benign | Mucinous secretions and pools |
| 6 | **MUS** | Smooth Muscle | 🟢 Benign | Muscularis propria / muscularis mucosae |
| 7 | **NORM** | Normal Colon Mucosa | 🟢 Benign | Healthy epithelial glandular tissue |
| 8 | **STR** | Cancer-Associated Stroma | 🟢 Benign | Desmoplastic stromal reaction tissue |
| 9 | **TUM** | Colorectal Adenocarcinoma | 🔴 Malignant | Tumour epithelium — neoplastic |

### 2. Brain Specialist (4-Class MRI)
*Architecture: EfficientNetB0 | Resolution: 224×224*

| # | Code | Full Name | Type | Description |
|:-:|:----:|-----------|:----:|-------------|
| 1 | **glioma** | Glioma Tumor | 🔴 High Concern | Tumors arising from glial cells |
| 2 | **meningioma** | Meningioma Tumor | 🔴 High Concern | Tumors forming on membranes covering the brain |
| 3 | **pituitary** | Pituitary Tumor | 🟡 Moderate | Tumors in the pituitary gland |
| 4 | **notumor** | No Tumor Detected | 🟢 Benign | Healthy brain MRI, no visible masses |

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
| **TensorFlow** / **Keras** | Deep learning framework powering the CNN Specialist models |
| **OpenCV** (Headless) | Image preprocessing, Grad-CAM heatmap colorization, and overlays |
| **Google Generative AI SDK** | Gemini 2.5 Flash multimodal LLM for clinical report generation |
| **Hugging Face Hub** | Cloud-hosted model registry for versioned CNN weights and assets |
| **SlowAPI** | Rate limiting middleware (5 requests/minute per client) |

### Infrastructure & DevOps
| Technology | Role |
|------------|------|
| **Docker** | Containerized backend with layer-cached ML dependencies |
| **Hugging Face Spaces** | Backend API hosting (Docker SDK, port 7860) |

---

## 📁 Project Structure

```text
X-Pathology/
├── README.md
├── xpathology-backend/                 # FastAPI Backend
│   ├── main.py                         # Core API — multi-model inference, Grad-CAM, Gemini
│   ├── requirements.txt                # Python dependencies
│   ├── Dockerfile                      # Production HF Spaces container
│   └── .env.example                    # Environment variable template
│
└── xpathology-frontend/                # Next.js Frontend
    └── my-app/
        ├── app/
        │   ├── layout.tsx              # Root layout — fonts, metadata, SEO
        │   ├── page.tsx                # Main dashboard — upload, results, fetch logic
        │   ├── globals.css             # Design system
        │   ├── about/page.tsx          # Interactive whitepaper & architecture documentation
        │   └── components/             # Reusable UI components (SpecialistSelector, Footer, etc.)
        ├── public/sample/              # Pre-loaded sample medical scans
        ├── package.json
        └── next.config.ts
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

```bash
cp .env.example .env
```
Edit `.env` and add your `GEMINI_API_KEY`.

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
| `ALLOWED_ORIGINS` | ❌ | `*` | Comma-separated CORS allowed origins |
| `HOST` | ❌ | `0.0.0.0` | Server bind host |
| `PORT` | ❌ | `7860` | Server bind port |

### Frontend (`xpathology-frontend/my-app/.env.local`)

| Variable | Required | Default | Description |
|----------|:--------:|---------|-------------|
| `NEXT_PUBLIC_API_URL` | ❌ | `https://rarfileexe-xpathology-backend.hf.space` | Backend API base URL |

---

## 🐳 Docker Deployment

The backend includes a production-ready Dockerfile optimized for **Hugging Face Spaces**:

```bash
cd xpathology-backend
docker build -t xpathology-backend .
docker run -p 7860:7860 --env-file .env xpathology-backend
```

**Key Optimizations:**
- **Layer caching:** `requirements.txt` is installed before source code.
- **Non-root execution:** Runs under a dedicated `user` account (UID 1000).
- **Slim base image:** `python:3.11-slim` minimizes attack surface.

---

## 🔒 Security & Optimization

| Measure | Implementation |
|---------|----------------|
| **Rate Limiting** | `slowapi` restricts API requests to **5/minute per client IP**. |
| **Thread Pooling** | Synchronous OpenCV/TensorFlow operations run via `run_in_threadpool` to prevent async blocking. |
| **File Validation** | Uploads capped at **10 MB** with strict MIME type checking (JPEG/PNG/TIFF). |
| **Graceful Degradation**| If the Gemini API fails/timeouts, the backend gracefully catches the error and returns the CNN classification and Grad-CAM heatmap with a pre-written fallback notice. |
| **Secret Management** | API keys loaded via `python-dotenv` — never hardcoded. |

---

## 🧠 Model Details

Both models are hosted on the Hugging Face Hub and are dynamically downloaded and cached by the backend upon startup.

### 1. Colon Specialist
- **Hub Repo:** [rarfileexe/Xpathology-Colon-Specialist](https://huggingface.co/rarfileexe/Xpathology-Colon-Specialist)
- **Architecture:** EfficientNetB1
- **Calibration:** T = 0.5576
- **Performance:** 92.7% External Holdout Accuracy (CRC-VAL-HE-7K). TUM F1 Score = 0.9558.

### 2. Brain Specialist
- **Hub Repo:** [rarfileexe/xpathology-brain-specialist](https://huggingface.co/rarfileexe/xpathology-brain-specialist)
- **Architecture:** EfficientNetB0
- **Calibration:** T = 0.7867
- **Performance:** 90.1% Holdout Accuracy (masoudnickparvar Testing split). Glioma F1 = 0.8440.

---

## 📈 Architecture Evolution

- **V1.0 (VGG16 Baseline):** Heavyweight (150MB) binary classification. Suffered from mathematical saturation and overconfidence.
- **V2.0 (MobileNetV2):** Multi-organ 5-class model. Lightweight (8.6MB), but suffered from organ-mismatched reporting.
- **V3.0 (Colon Specialist):** Dedicated EfficientNetB1 for 9-class colorectal tissue. Introduced temperature calibration, external validation, and Grad-CAM.
- **V4.0 (Multi-Specialist):** Current architecture. Dynamic backend routing supporting multiple distinct specialist models (Colon + Brain), Domain-Adapted Gemini Prompting, and Anatomical Plausibility Checks.

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
- ⚕️ It is **NOT** a substitute for professional diagnosis by a licensed, board-certified medical professional.
- 📋 All AI-generated results **must be reviewed and verified** by a qualified expert.
- 🚫 **Do NOT** make any clinical or treatment decisions based solely on this tool's output.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve **X-Pathology**:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

---

## 📄 License

This project is Open-Source and available under [Apache-2.0 License](LICENSE)

The models are released under the [Apache 2.0 License](https://www.apache.org/licenses/LICENSE-2.0). Training datasets are credited to their respective original authors on Kaggle.

---

<div align="center">
  <sub>
    Made with ❤️ and a lot of ☕ by <a href="https://github.com/Muhammad-Hassan12">Syed Muhammad Hassan</a> at <a href="https://www.linkedin.com/company/AgenticEra-Systems">AgenticEra Systems</a>
  </sub>
  <br />
  <sub>
    🔬 X-Pathology v4.0 · Multi-Specialist Architecture · Temperature Calibrated · Grad-CAM XAI · Gemini 2.5 Flash
  </sub>
</div>
