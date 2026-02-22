🛡️ ScamShield — Project Specification
📌 Project Overview
ScamShield is an AI + Web3 web application that detects scam messages and stores scam fingerprints on blockchain.

Goal of hackathon MVP:
Build a working demo that shows:

AI scam detection

Screenshot OCR detection

Blockchain scam ledger

Public trends dashboard

This is a monorepo project.

🧠 Learning Tracking Requirement
We must track what we learn while building.

Create and maintain a file named learning.md in the root folder.

After EVERY major setup or feature implementation, update learning.md.

Each update must contain ONLY:

What we built

Why we built it

How it works (simple, non‑technical, 3–5 lines)

Tech used

Problems faced (if any)

Writing style:

Very simple English

Short and clear

Easy for hackathon judges

No long theory

By the end, learning.md should explain the full project journey.

🏗️ Monorepo Structure
scamshield/
  frontend/      → Next.js app
  backend/       → FastAPI API
  blockchain/    → Solidity smart contract
  learning.md
  PROJECT_SPEC.md
  README.md
🎨 Frontend Requirements
Framework:

Next.js 14

TypeScript

TailwindCSS

ShadCN UI

Design style: Neobrutalism

Thick borders

Hard shadows

Bold typography

Black/white base + accent colors

Large playful buttons

Pages to Build
1️⃣ Home Page — Scam Detection (Main Page)
Hero text:
“Detect scams instantly using AI”

User can:

Paste suspicious message

Upload screenshot

Click Analyze

Result card must show:

Scam probability %

Scam category

Red flags

Safety advice

Button → Add to Blockchain

2️⃣ Scam Ledger Page
Display:

Total scams stored

Recent scam hashes

Scam categories

3️⃣ Trends Dashboard Page
Display charts:

Total scans

Scam categories pie chart

Use mock data initially.

🧠 Backend Requirements (FastAPI)
AI Provider: Groq API
We will NOT train models.
We use LLM for classification.

Endpoint 1 — /analyze-text
Input: message text
Output JSON:

{
  probability,
  category,
  red_flags[],
  advice
}
Scam categories:

bank scam

job scam

courier scam

lottery scam

phishing

normal message

Return structured JSON only.

Endpoint 2 — /analyze-image
Flow:
Image → OCR → Extract text → Send to Groq → Return same JSON.

OCR:

Tesseract

English + Hindi support

Endpoint 3 — /store-scam
Input:

message hash

category

For now store in SQLite.
Later connect to blockchain.

🔗 Blockchain Requirements
Folder: /blockchain

Create Solidity smart contract:

Contract name: ScamLedger

Functions:

addScamHash(string hash, string category)

getTotalScams()

getScamByIndex(uint)

Target network:
Polygon Amoy Testnet

📊 Product Demo Flow
Paste scam SMS → AI detects scam

Upload scam screenshot → OCR + AI detects

Click Add to Blockchain

Show scam ledger page

Show trends dashboard

🚫 Features NOT in MVP
Do NOT build:

Login/auth

Chrome extension

Mobile app

WhatsApp bot

Payments

Advanced analytics

These are future roadmap items only.

🎯 Tech Stack Summary
Frontend → Next.js + Tailwind + ShadCN
Backend → FastAPI (Python)
AI → Groq LLM API
OCR → Tesseract (multilingual)
Blockchain → Solidity + Polygon Amoy
Database → SQLite

