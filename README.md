# 🛡️ ScamShield

> AI + Web3 powered scam detection & blockchain ledger — Hackathon MVP

ScamShield detects scam messages and images using AI, and stores scam fingerprints on the blockchain for public transparency.

---

## 🧱 Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 · TypeScript · Tailwind CSS · ShadCN UI |
| Backend | FastAPI (Python) |
| AI | Groq LLM API |
| OCR | Tesseract (English + Hindi) |
| Blockchain | Solidity · Polygon Amoy Testnet |
| Database | SQLite |

---

## 📁 Monorepo Structure

```
scamshield/
  frontend/      → Next.js app (UI)
  backend/       → FastAPI API server
  blockchain/    → Solidity smart contract
  learning.md    → Build journey log
  PROJECT_SPEC.md
  README.md
```

---

## 🚀 Running Locally

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
# API docs: http://127.0.0.1:8000/docs
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:3000
```

---

## ✨ Features (MVP)

- 🔍 **AI Scam Detection** — paste any suspicious message and get instant analysis
- 📸 **Screenshot OCR** — upload a screenshot; AI reads and detects scam text
- ⛓️ **Blockchain Ledger** — store scam fingerprints on Polygon Amoy
- 📊 **Trends Dashboard** — visualize scam categories and volumes

---

## 🚫 Not in MVP

Login/auth · Chrome extension · Mobile app · WhatsApp bot · Payments
