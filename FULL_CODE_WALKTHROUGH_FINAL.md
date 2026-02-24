# ScamShield: Full Code Walkthrough (Final Edition)

This document is the **most complete, up-to-date, and accurate breakdown** of the ScamShield codebase as it exists right now. It is designed for hackathon judges, viva preparation, and developer onboarding.

**⚠️ CRITICAL ARCHITECTURE NOTE:** The project was originally designed to use the real Polygon Amoy blockchain. However, because Amoy now requires mainnet ETH to acquire testnet tokens, the blockchain layer is **currently mocked using a local SQLite database**. It generates deterministic `0x...` hashes, realistic block numbers, and mimics a real blockchain flawlessly for demonstration purposes without incurring costs or network friction. The actual Solidity smart contracts exist in the repo but are currently dormant/bypassed.

---

## 1️⃣ Repository Overview

ScamShield is an AI-powered scam analysis tool with a mocked Web3 ledger. It has two main parts:
1. **Frontend (/frontend):** Built with Next.js (App Router), React, and Tailwind CSS. It features a striking Neobrutalist design (high contrast, thick black borders, bold colors).
2. **Backend (/backend):** Built with Python FastAPI. It performs LLM-based scam analysis via the **Groq API** (`llama-3.1-8b-instant`), executes OCR for images via **Tesseract**, scrapes URL text using `BeautifulSoup`, and manages the simulated blockchain ledger in SQLite.

---

## 2️⃣ Root Files Walkthrough

These files exist at the very top level of the repository.

*   `FULL_CODE_WALKTHROUGH.md`, `learning.md`, `PROJECT_SPEC.md`, `test_messages.md`, `README.md`
    *   **Why they exist:** Project documentation, specifications, prompt tuning testing, and legacy guides.
    *   **What they do:** Explain the vision and rules for the AI, give sample test prompts, and provide context. This document supersedes older walkthroughs.
*   `temp_forge/` and `blockchain/` directories
    *   **Why they exist:** Artifacts of the original, true Web3 integration.
    *   **What they do:** Contain Hardhat/Forge configuration, `ScamLedger.sol` smart contracts, and deployment scripts. *They are currently not actively connected to the live backend.*

---

## 3️⃣ FRONTEND — FILE BY FILE
*Path: `/frontend`*

### Configurations
*   **`package.json` / `package-lock.json`**: Lists dependencies (Next.js, React, Tailwind, jsQR, etc.) and run scripts (`npm run dev`).
*   **`tailwind.config.ts`**: Configures Tailwind CSS. Includes custom colors (`neo-yellow`, `neo-red`, `neo-green`, etc.) and shadows essential for the Neobrutalist aesthetic.
*   **`next.config.mjs`**, **`postcss.config.mjs`**, **`tsconfig.json`**: Standard framework configurations for compilation, styling, and TypeScript strictness.

### Global App Flow
*   **`app/layout.tsx`**
    *   **Why it exists:** The root layout wrapping all pages.
    *   **What it does:** Injects global fonts (Space Grotesk, Space Mono), metadata for SEO, and persistent UI components like `<GlobalStatsBanner />`, `<LiveThreatToast />`, and `<Footer />`.
*   **`app/globals.css`**
    *   **Why it exists:** Global stylesheets.
    *   **What it does:** Sets up Tailwind base directives and any custom CSS variables not covered by tailwind config.

### Pages
*   **`app/page.tsx` (Home / Scam Detection)**
    *   **What it does:** The main user interface. It has a text area for pasting messages and a file input for uploading images.
    *   **Key functions:** 
        *   `handleImageChange`: Extracts QR codes locally using `jsQR`.
        *   `handleAnalyze`: Calls backend `/analyze-text`, `/analyze-image`, or `/analyze-url`. Applies a local "WhatsApp Forward" heuristic to boost threat scores.
        *   `handleStoreOnBlockchain`: Normalizes the input string, hashes it via `crypto.subtle.digest("SHA-256")`, and sends it to the backend for storage.
    *   **State:** Uses `useState` for storing user input, AI results, and loading status. Saves local history to `localStorage`.
*   **`app/ledger/page.tsx` (Scam Ledger)**
    *   **What it does:** Displays the "Blockchain". It polls the backend every 5 seconds to fetch the latest submitted scams.
    *   **Key functions:** `fetchScams()` calls the `/scams` API. Formats timestamps and color-codes threat categories. Clicking a scam opens a detailed modal with the transaction hash.
*   **`app/trends/page.tsx` (Visual Dashboard)**
    *   **What it does:** A real-time threat map and statistics dashboard.
    *   **Key functions:** Calculates category percentages using vanilla JavaScript. Renders a CSS-only conic-gradient pie chart and a randomized `<LiveThreatMap />` to show global simulated threats.
*   **`app/arcade/page.tsx` (Mini-Game)**
    *   **What it does:** A gamified experience asking users "Is this a scam or safe?". 
    *   **Key functions:** Calls the backend `/arcade/generate` to get dynamic AI-generated text. Tracks score and level using React state.
*   **`app/developers/page.tsx` (API Docs)**
    *   **What it does:** Static documentation page providing sample `cURL`, Python, and Node.js code snippets for external devs to integrate ScamShield APIs.

### Components (`/components`)
*   **`Navbar.tsx`**: Top navigation. Contains routing links and the logo.
*   **`HowItWorks.tsx`**: Simple static component explaining the 3-step process on the home page.
*   **`LocalHistory.tsx`**: Reads `localStorage` to display the last 5 scams the *current user* analyzed.
*   **`Footer.tsx`**: Standard bottom footer.
*   **`GlobalStatsBanner.tsx`** & **`LiveThreatToast.tsx`**: Cosmetic UI elements that dynamically display mock "live" network activity to make the app feel alive.

---

## 4️⃣ BACKEND — FILE BY FILE
*Path: `/backend`*

### API & Config
*   **`requirements.txt`**: Python dependencies (`fastapi`, `uvicorn`, `groq`, `pytesseract`, `beautifulsoup4`, `requests`, `python-dotenv`).
*   **`main.py` (The Core API Entrypoint)**
    *   **Why it exists:** It is the FastAPI server.
    *   **What it does:** Defines all API routes.
    *   **Key Endpoints:**
        *   `POST /analyze-text`: Accepts text, sends to `groq_service.py`.
        *   `POST /analyze-url`: Calls `scraper_service.py` to extract text, then sends to Groq.
        *   `POST /analyze-image`: Receives image, runs Tesseract OCR (`pytesseract.image_to_string`), sends text to Groq.
        *   `POST /store-scam`: Stores the deterministic message hash to the `blockchain_service`.
        *   `GET /scams`: Retrieves the full ledger history.
        *   `GET /arcade/generate`: Calls Groq to invent a new message.
*   **`scraper_service.py`**
    *   **What it does:** Takes a URL, uses `requests` to fetch HTML, and `BeautifulSoup` to strip scripts/styles and extract flat text (max 5000 chars) for LLM analysis.
*   **`groq_service.py`**
    *   **What it does:** Handles all AI logic.
    *   **Key functions:** `analyse_text()` injects the suspicious message into a strict JSON-enforcing `SYSTEM_PROMPT`. Uses `llama-3.1-8b-instant` to score probability, identify categories, quote highlighted phrases, and explain psychological tactics. It also calibrates the raw LLM score using weighted risk logic. `generate_arcade_level()` uses `llama-3.3-70b-versatile` to dynamically create game scenarios.
*   **`blockchain_service.py` (The Mock Ledger)**
    *   **Why it exists:** Web3 fallback.
    *   **What it does:** Stores data in a local SQLite file (`scam_ledger.db`).
    *   **Key functions:** `_make_tx_hash()` artificially generates an Ethereum-like transaction hash using a random nonce. `_next_block_number()` incrementally adds to a realistic Amoy block number base (`~5.2M`). `add_scam_to_ledger()` writes the transaction row. `get_all_scams()` reads it back.
*   **`scam_ledger.db`**: The automatically generated local database holding the mock blockchain data.

---

## 5️⃣ STORAGE / TRUST LAYER (IMPORTANT)

**How are scams stored NOW?**
Currently, ScamShield operates a **Simulated Ledger via SQLite**. 
*   **Why not Polygon?:** Free testnet tokens became too difficult to acquire, breaking the user experience.
*   **The Current Implementation:** 
    1. The frontend normalizes the raw message (formatting, spacing) and hashes it locally via SHA-256. 
    2. The hash and category are sent to the backend `/store-scam`. 
    3. `blockchain_service.py` creates a unique fake transaction hash (`0x` + random SHA256 digest) and increments a fake block number.
    4. The record is permanently recorded in `backend/scam_ledger.db`.
    5. The Frontend fetches these records via `/scams`, presenting them flawlessly as an immutable blockchain ledger exactly as it would look with Web3.

---

## 6️⃣ ASSETS / STATIC FILES

*   **`frontend/app/fonts/GeistMonoVF.woff` & `GeistVF.woff`**: Local font fallbacks (Vercel standard fonts).
*   **`frontend/app/favicon.ico`**: Standard website icon.

---

## 7️⃣ END-TO-END EXECUTION FLOW

**Scenario: User pastes a message & clicks "Analyze"**
1.  **Frontend Input:** User pastes text on `app/page.tsx`.
2.  **API Call:** React hits `/analyze-text` on the FastAPI backend.
3.  **AI Analysis:** `main.py` passes the text to `groq_service.py`. The system builds a prompt and asks Groq (`llama-3.1-8b-instant`) to return a strict JSON payload containing probability, category, psychology explainer, and red flags.
4.  **Backend Calculation:** The backend calibrates the AI probability using manual rule weights and replies to the frontend with JSON.
5.  **Frontend Render:** The UI displays a Threat Score meter, extracts highlighted substrings using Regex, and renders the "Attacker's Mirror" psychology explainer.
6.  **Ledger Storage (Manual Trigger):** If the user clicks **"Add to Ledger"**:
    *   The frontend normalizes and hashes the text (SHA-256).
    *   Passes it to `/store-scam`.
    *   Backend `blockchain_service.py` generates an Ethereum-style `0x...` transaction hash and saves it into `scam_ledger.db`.
7.  **Dashboard Update:** Navigating to the Trends or Ledger pages polls `/scams`, hitting the SQLite DB, instantly mapping the new threat onto the dashboard charts and tables.
