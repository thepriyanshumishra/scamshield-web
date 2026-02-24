# 🚀 Deployment Guide — ScamShield

This guide will help you deploy the ScamShield project for free using **Vercel** (Frontend) and **Railway** (Backend).

---

## 🏗️ 1. Prepare Backend (Railway / Render)

The backend is containerized with Docker, which is the easiest way to handle Tesseract OCR and the ML model.

### Recommended: Railway (Easier)
1. Sign up at [Railway.app](https://railway.app/).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your `ScamShield` repo.
4. Set the **Root Directory** to `backend`.
5. Add **Environment Variables**:
   - `GROQ_API_KEY`: Your Groq API key.
   - `PORT`: 8000
6. Railway will automatically detect the `Dockerfile` and deploy.
7. Once deployed, Railway will give you a public URL (e.g., `scamshield-api.up.railway.app`). **Copy this.**

### Alternative: Render (Requires more RAM)
1. Sign up at [Render.com](https://render.com/).
2. Create a **New Web Service**.
3. Connect your GitHub repo.
4. Set **Root Directory** to `backend`.
5. Select **Docker** as the Runtime.
6. Add your `GROQ_API_KEY` in the Environment section.
7. *Note: The free tier has 512MB RAM. If the DistilBERT model crashes, you may need to upgrade to a $7/mo tier or use the pure LLM version.*

---

## 🎨 2. Prepare Frontend (Vercel)

1. Sign up at [Vercel.com](https://vercel.com/).
2. Click **Add New** → **Project**.
3. Import your `ScamShield` repo.
4. Under **Framework Preset**, select **Next.js**.
5. Under **Root Directory**, set it to `frontend`.
6. **CRITICAL STEP:** Under **Environment Variables**, add:
   - `NEXT_PUBLIC_API_URL`: Your Backend URL from Step 1 (e.g., `https://scamshield-api.up.railway.app`).
   - *Do not include a trailing slash.*
7. Click **Deploy**.

---

## 🔗 3. Connecting Everything

Once both are deployed:
1. Go to your Backend settings and ensure you have **CORS** allowed for your Vercel URL.
   - *The code already handles this, but it's good to check if your Vercel URL is `https://scamshield-web.vercel.app`.*
2. Test the app! 

---

## 🛠️ Maintenance & Tips

### 📝 Database Persistence
On free tiers, SQLite databases like `scam_ledger.db` and `training_data.db` will **reset every time the server restarts**. 
- To keep the data permanently, you can attach a **Volume** to your Railway/Render service (usually $0.25/mo).
- Alternatively, connect to a free MongoDB or PostgreSQL instance.

### 🤖 ML Model Size
The `model.safetensors` file is 268MB. If your free tier host kills the process, it's because it ran out of RAM. 
- You can optimize this by using the **ONNX** version of the model which is smaller and faster.
- Or, use an API for classification instead of local hosting.

### 📂 Large Files & Git
Since the model is ~270MB, you might have trouble pushing to GitHub without **Git LFS**.
1. Install Git LFS: `brew install git-lfs`.
2. Track model: `git lfs track "backend/scamshield-distilbert/model.safetensors"`.
3. Push again.
