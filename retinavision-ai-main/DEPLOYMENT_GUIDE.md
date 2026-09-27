# RetinaVision AI - Complete Deployment Guide

This guide explains how to deploy **RetinaVision AI** with both frontend and backend working in real time, keeping all diagnostic functions, XAI Grad-CAM, bilingual translations, risk indices, and QR reporting intact.

---

## 🚀 Choose Your Preferred Deployment Method

| Deployment Method | Best For | Free Tier? | Difficulty |
| :--- | :--- | :--- | :--- |
| **Method 1: Netlify (Frontend) + Render or HuggingFace (Backend)** | When you want a custom `*.netlify.app` domain | Yes | Easy |
| **Method 2: Hugging Face Spaces (All-in-One)** | Deep Learning models, 16 GB free RAM, single link | Yes | Easiest (Single click) |
| **Method 3: Render.com (All-in-One Docker)** | Unified web service with auto-deploy from GitHub | Yes | Easy |

---

## Method 1: Netlify (Frontend) + Cloud Backend (API)

Because PyTorch and the fine-tuned ResNet50 model weights (`model.pth`, 94MB) require a dedicated Python container, the backend runs on a free container service (Render or Hugging Face) and the frontend runs on Netlify.

### Step 1: Deploy Backend API on Render.com (or Hugging Face Spaces)
1. Push your project to a GitHub repository (e.g., `https://github.com/your-username/retinavision-ai`).
2. Go to [Render.com](https://render.com) and log in.
3. Click **New +** -> **Web Service**.
4. Connect your GitHub repository.
5. Select **Docker** environment (Render will automatically detect `Dockerfile` or `render.yaml`).
6. Click **Create Web Service**.
7. Render will build and deploy the container. Once deployed, copy your backend URL (e.g., `https://retinavision-backend.onrender.com`).
8. Test your backend in your browser by visiting: `https://your-backend.onrender.com/health` (it should return `{"status": "healthy"}`).

### Step 2: Deploy Frontend on Netlify
1. Go to [Netlify](https://app.netlify.com) and log in.
2. Click **Add new site** -> **Import an existing project**.
3. Select **GitHub** and authorize your repository.
4. Netlify will automatically read `netlify.toml` with:
   - **Base directory**: `frontend`
   - **Build command**: `npm install && npm run build`
   - **Publish directory**: `frontend/dist`
5. In Netlify's **Site configuration** -> **Environment variables**, add:
   - Key: `VITE_API_URL`
   - Value: `https://your-backend.onrender.com` (your Render backend URL)
6. Alternatively, edit `netlify.toml` in your repo and update the proxy line:
   ```toml
   [[redirects]]
     from = "/predict"
     to = "https://your-backend.onrender.com/predict"
     status = 200
     force = false
   ```
7. Click **Deploy Site**.
8. Your frontend will go live immediately at `https://your-app-name.netlify.app`!

---

## Method 2: Hugging Face Spaces (All-in-One, 100% Free 16GB RAM)

Hugging Face Spaces is designed specifically for PyTorch Machine Learning applications and provides **16 GB RAM** for free with no memory bottlenecks.

1. Go to [Hugging Face Spaces](https://huggingface.co/spaces) and create a free account.
2. Click **Create new Space**.
3. Name your space (e.g. `retinavision-ai`).
4. Select **Docker** as the Space SDK and choose the **Blank** template.
5. Click **Create Space**.
6. Clone your space repository locally or push your project files directly to it:
   ```bash
   git remote add space https://huggingface.co/spaces/<your-username>/retinavision-ai
   git push space main
   ```
7. Hugging Face will automatically execute `Dockerfile`, compile the React frontend, start the FastAPI engine, and launch your application at:
   `https://<your-username>-retinavision-ai.hf.space`

---

## Method 3: All-in-One on Render.com

If you want a single URL that hosts both the frontend and the PyTorch backend:

1. Push your repository to GitHub.
2. Go to [Render Dashboard](https://dashboard.render.com).
3. Click **New +** -> **Blueprint**.
4. Connect your repo (Render will automatically detect `render.yaml`).
5. Click **Apply**.
6. Render builds the multi-stage Docker image, runs the FastAPI server serving both the React app and `/predict`, and gives you a single live URL like `https://retinavision-ai.onrender.com`.

---

## 💻 Running & Testing Locally

### 1. Start the Backend
```bash
python main.py
```
*(Runs on `http://localhost:8000`. You can verify at `http://localhost:8000/health` or `http://localhost:8000/docs`)*

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
*(Runs on `http://localhost:5173`, with proxy automatically forwarding `/predict` to the backend)*

---

## 📋 Feature Checklist (All Working)
- [x] **OD (Right Eye) & OS (Left Eye)** bilateral scanning
- [x] **XAI Grad-CAM** inspection overlay & brightness/contrast/zoom adjustments
- [x] **Real-Time Screening**: Severity stage, Composite Risk Score (0-100), Model Confidence
- [x] **Pathology Biomarker Checklist**: Microaneurysms, Hard Exudates, Cotton Wool Spots, Neovascularization
- [x] **Clinical Action Guide**: Direct clinical referral protocols
- [x] **Multilingual Support**: English, Tamil (தமிழ்), Hindi (हिन्दी)
- [x] **Longitudinal History**: Persisted in browser localStorage
- [x] **Patient Takeaway Modal & QR Code**: Scannable care report
- [x] **One-Click EHR Copy & Print Report**: Print-optimized stylesheet
