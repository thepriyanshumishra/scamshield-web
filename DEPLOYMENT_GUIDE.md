# 🚀 Deployment Guide — ScamShield (Production Ready)

This guide provides step-by-step instructions for deploying the ScamShield ecosystem. We recommend **Railway** for the backend (due to Docker/Tesseract requirements) and **Vercel** for the frontend.

---

## 🏗️ 1. Backend Deployment (The AI Core)

The backend is built with **FastAPI** and requires **Tesseract OCR** and **PyTorch**. The provided `Dockerfile` handles all dependencies automatically.

### Option A: Railway (Highly Recommended)
1.  **Repo Setup**: Ensure your repo has the `backend/` folder at the root.
2.  **New Project**: In [Railway.app](https://railway.app/), click **New Project** → **GitHub Repo**.
3.  **Config**:
    - **Root Directory**: `backend`
    - **Environment Variables**:
        - `GROQ_API_KEY`: (Get yours at [console.groq.com](https://console.groq.com/))
        - `PORT`: `8000`
        - `PYTHONUNBUFFERED`: `1`
4.  **Deployment**: Railway will detect the `Dockerfile`. Note that it will take ~4-6 minutes to build because it installs `torch` and downloads the DistilBERT weights.
5.  **Public URL**: Once done, go to **Settings** → **Generate Domain**. You will get something like `https://scamshield-production.up.railway.app`.

### Option B: Local Docker (For Private Servers)
If you are deploying to a VPS (DigitalOcean/AWS):
```bash
cd backend
docker build -t scamshield-backend .
docker run -p 8000:8000 -e GROQ_API_KEY=your_key_here scamshield-backend
```

---

## 🎨 2. Frontend Deployment (The UI)

The frontend is a **Next.js 14** app. It should be deployed to **Vercel** for optimal performance.

1.  **New Project**: In [Vercel](https://vercel.com/), import your repo.
2.  **Config**:
    - **Framework Preset**: `Next.js`
    - **Root Directory**: `frontend`
    - **Environment Variables**:
        - `NEXT_PUBLIC_API_URL`: Use your Railway URL (e.g., `https://scamshield-production.up.railway.app`).
        - *IMPORTANT: Ensure it starts with `https://` and has NO trailing slash.*
3.  **Build**: Vercel will build and give you a production link.

---

## ⚠️ 3. Critical Troubleshooting

### 1. "No OCR text found" / Tesseract Errors
If you are NOT using Docker and getting OCR errors:
- **Ubuntu/Debian**: `sudo apt update && sudo apt install tesseract-ocr tesseract-ocr-hin`
- **Mac**: `brew install tesseract tesseract-lang`
- **Error 500**: Ensure the `TESSDATA_PREFIX` is set correctly in your environment.

### 2. "Out of Memory" (OOM) on Backend
The DistilBERT model uses ~450MB RAM. The Free Tier of some providers (like Render) only gives 512MB, which may cause crashes.
- **Fix**: Upgrade to a 1GB RAM tier or set the environment variable `DISABLE_LOCAL_ML=true` to run in Groq-only mode.

### 3. Database Persistence (The Flywheel)
By default, Railway/Render use ephemeral disk space. Your `training_data.db` will be **deleted** every time the server restarts.
- **Fix**: 
    1. Attach a **Volume** (Railway usage: $0.25/mo).
    2. Change the DB path in `ml_data_service.py` to point to the `/mount` directory.
    3. Or, export the data daily using `/export-data` endpoint.

---

## 🧪 4. Post-Deployment Verification

Once deployed, run these checks:
1.  **Health Check**: Visit `https://your-api.com/` — you should see a JSON welcome message.
2.  **CORS Test**: Try to analyze a message from your Vercel URL. If you get a "Network Error", check the `backend/main.py` CORS list.
3.  **ML Warmup**: The first scan might be slow (~5s) as the model loads into memory. Subsequent scans will be <1s.

---
*Generated for ScamShield Core v0.5.0*
