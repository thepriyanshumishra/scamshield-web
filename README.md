# 🛡️ ScamShield

> **AI + Web3 Powered Unified Scam Protection**
> Winner of building a self-improving, transparent scam detection ecosystem.

ScamShield is a dual-intelligence security platform that identifies fraudulent messages, images, and URLs using a blend of local ML (Fine-tuned DistilBERT) and global LLM (Groq Llama 3) reasoning. High-risk fingerprints are archived on the Polygon blockchain for immutable public tracking.

---

## 🚀 Key Features

- 🧠 **Dual-Engine AI** — Blends a local, fast **DistilBERT** model (99.6% accuracy) with **Groq Llama 3** for deep semantic analysis.
- 📸 **Multi-Modal Detection** — Built-in Tesseract OCR supports scanned screenshots in English and Hindi.
- 🔗 **AI Data Flywheel** — A self-improving pipeline that collects user feedback to automatically retrain and refine local models.
- ⛓️ **Blockchain Ledger** — Immutable scam audits stored on the Polygon Amoy Testnet.
- 🕹️ **Arcade Training** — Gamified "Scam or Safe" training to educate users through real-world scenarios.
- 📊 **Security Pulse** — Live threat dashboard visualizing global scam categories and patterns.

---

## 🧱 Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | Next.js 14 · TypeScript · Neo-Brutalism UI · Tailwind CSS |
| **Backend** | FastAPI (Python 3.12) |
| **ML Engine** | DistilBERT (Local) + Groq Llama 3 (Cloud) |
| **OCR** | Tesseract (Multi-lingual) |
| **Blockchain** | Solidity · Polygon Amoy · ethers.js |
| **Database** | SQLite + AI Training Data Pipeline |

---

## 📁 Project Structure

```bash
scamshield/
  ├── frontend/          # Next.js Application (UI)
  ├── backend/           # FastAPI Server & AI Logic
  │   ├── ml_data/       # AI Flywheel data collection & Export scripts
  │   └── scamshield-distilbert/ # Fine-tuned weights
  ├── blockchain/        # Smart Contracts (Solidity)
  ├── ml-training/       # Jupyter Notebooks for model training
  └── DEPLOYMENT_GUIDE.md # Documentation for going live
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- Python 3.12
- Node.js 18+
- [Groq API Key](https://console.groq.com/)

### 2. Backend Setup
```bash
cd backend
python3.12 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🛡️ Privacy & Ethics
ScamShield only stores the *text* of suspicious messages for model improvement. No personally identifiable information (PII) is ever collected, stored, or processed.

---

## 📜 Legal & Policies
- [Privacy Policy](./frontend/app/privacy/page.tsx)
- [Terms & Conditions](./frontend/app/terms/page.tsx)
