# 📓 ScamShield — Learning Log

> This file tracks what we built, why, and how it works. Written simply for hackathon judges.

---

## Entry 1 — Monorepo Setup & Project Scaffold
**Date:** 2026-02-22

### What we built
Set up the full ScamShield project from scratch — the folder structure, frontend, backend, a blockchain contract stub, and connected everything to GitHub.

### Why we built it
Every big project needs a solid foundation. Without a clear structure, code gets messy fast. We set this up first so every future feature has a clear home.

### How it works (simple)
The project is split into 3 folders:
1. **frontend/** — the website users see (built with Next.js).
2. **backend/** — the "brain" server that runs AI analysis (built with FastAPI in Python).
3. **blockchain/** — a smart contract that stores scam fingerprints on a public blockchain.

All 3 talk to each other. User sees the website → website calls backend → backend calls AI → result comes back → user can store it on blockchain.

### Tech used
| Part | Tech |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, ShadCN UI |
| Design style | Neobrutalism (thick borders, hard shadows, bold fonts) |
| Backend | FastAPI (Python) |
| Blockchain | Solidity smart contract (ScamLedger) |
| Git | GitHub — `thepriyanshumishra/scamshield-web` |

### Problems faced
- Next.js default branch was `master` — renamed to `main` to match GitHub conventions.
- ShadCN needed `-d` flag to skip interactive prompts and use defaults.
- Neobrutalism in Tailwind required custom `boxShadow` values (no blur, hard offset) which aren't in Tailwind by default — added them to `tailwind.config.ts`.

---

## Entry 2 — AI Scam Detection with Groq + OCR
**Date:** 2026-02-22

### What we built
Connected a real AI brain to our backend — the Groq LLM API — and wired up Tesseract OCR so the app can read text from screenshots too.

### Why we built it
The previous version returned fake data every time. Now the app actually thinks about the message and gives a real answer. OCR lets users upload a screenshot of a scam WhatsApp message or SMS and get it analysed automatically.

### How it works (simple)
1. User pastes a message or uploads a screenshot.
2. If it's a screenshot, Tesseract reads the text from the image (supports English + Hindi).
3. That text gets sent to Groq's AI (LLaMA 3 model) with a strict instruction: "analyse this and return JSON only."
4. The AI returns: how likely it's a scam (%), what type of scam, what red flags it spotted, and safety advice.
5. The frontend shows all of this in a result card.

### Tech used
| Part | Tech |
|---|---|
| AI Model | Groq API — `llama3-8b-8192` (free, fast) |
| Prompt style | Structured JSON-only output prompt |
| OCR | Tesseract — English + Hindi (`eng+hin`) |
| Env management | `python-dotenv` — loads API key from `.env` |
| Error safety | JSON parse fallback if AI returns unexpected format |

### Problems faced
- Groq's model sometimes wraps JSON in markdown code fences (` ```json `) — fixed with a regex to extract the raw JSON object.
- Tesseract on some systems doesn't have the Hindi language pack (`hin`) — added automatic fallback to English-only mode.
- `.env` file must never be committed — ensured by `.gitignore` and added `.env.example` as a safe template.

---

_More entries will be added as we build each feature._
