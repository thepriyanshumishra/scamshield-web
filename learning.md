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

_More entries will be added as we build each feature._
