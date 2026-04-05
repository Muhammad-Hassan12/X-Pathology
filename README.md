# X-Pathology 🔬

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.15-FF6F00?logo=tensorflow)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)
![Gemini API](https://img.shields.io/badge/Gemini_2.5_Flash-AI-4285F4?logo=google)

**X-Pathology** is an end-to-end Explainable AI (XAI) pipeline designed to bridge the gap between deep learning diagnostics and clinical interpretability. Built to analyze H&E-stained histopathology slides, this system provides rapid, transparent, and highly calibrated multi-organ tissue analysis.

Instead of relying on a "black box" prediction, X-Pathology utilizes a multimodal architecture to visually explain its reasoning and provide compassionate, human-readable context.

---

## ✨ Key Features

* **Multiclass Visual Engine:** A highly optimized MobileNetV2 backbone trained to classify 5 distinct tissue states across colon and lung histopathology (Colon Adenocarcinoma, Colon Benign, Lung Adenocarcinoma, Lung Benign, Lung Squamous Cell Carcinoma).
* **Explainable AI (XAI):** Custom Grad-CAM (Gradient-weighted Class Activation Mapping) extraction layers generate precise heatmaps, highlighting the exact architectural aberrations and cellular structures driving the CNN's predictions.
* **Cognitive LLM Guardrails:** Integrates Google's Gemini Vision API to act as a clinical safety layer. The LLM visually verifies the Grad-CAM output to prevent out-of-distribution hallucinations and generates dual-persona text: a dense Clinical Pathology Report for oncologists and a jargon-free summary for patients.
* **Decoupled Architecture:** Features an asynchronous Python/FastAPI backend (optimized for serverless Docker deployment) and a responsive, premium Next.js UI designed for frictionless clinical workflows.

---

## 🏗️ Tech Stack

### Frontend (User Interface)
* **Framework:** React / Next.js (App Router)
* **Styling:** Tailwind CSS
* **Deployment:** Vercel

### Backend (API & Machine Learning)
* **Server:** Python / FastAPI / Uvicorn
* **Deep Learning:** TensorFlow / Keras (MobileNetV2, 8.6MB footprint)
* **Computer Vision:** OpenCV (Headless)
* **Generative AI:** Google Generative AI SDK (Gemini 2.5 Flash)
* **Deployment:** Docker / Hugging Face Spaces

---

## 🚀 Local Installation & Development

To run the X-Pathology pipeline locally, you will need to start both the FastAPI backend and the Next.js frontend.

### 1. Clone the Repository
```bash
git clone [https://github.com/YOUR_GITHUB_USERNAME/X-Pathology.git](https://github.com/YOUR_GITHUB_USERNAME/X-Pathology.git)
cd X-Pathology
```

### 2. Setup the Backend (FastAPI)
Navigate to the backend directory and set up your Python environment:
```bash
cd xpathology-backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Configure Environment Variables:
Create a .env file in the xpathology-backend folder and add your Gemini API Key:
```bash
GEMINI_API_KEY="your_google_gemini_api_key_here"
```

#### Start the Server:
```bash
python main.py
# The backend will run on http://localhost:8000
```

### 3. Setup the Frontend (Next.js)
Open a new terminal window, navigate to the frontend directory, and start the node server:
```bash
cd xpathology-web

# Install Node dependencies
npm install

# Start the development server
npm run dev
# The frontend will run on http://localhost:3000
```

## 🔒 Security & Optimization
* Rate Limiting: The backend utilizes slowapi to protect against DoS attacks and quota exhaustion.
* Threadpooling: Heavy TensorFlow matrix calculations and synchronous OpenCV operations are routed through fastapi.concurrency.run_in_threadpool to prevent event-loop blocking.
* Layer Caching: The included Dockerfile is optimized to cache heavy ML dependencies prior to source code transfer, reducing cloud build times from minutes to seconds.

## ⚠️ Medical Disclaimer
X-Pathology is developed by AgenticEra Systems for research, portfolio, and educational purposes only. It is an AI-assisted screening prototype and must not be used for actual clinical diagnostics, patient care, or medical decision-making without rigorous verification by a certified human pathologist.
