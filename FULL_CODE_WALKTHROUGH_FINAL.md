# ScamShield: Full Code Walkthrough (Final Edition)

This document is the **most complete, up-to-date, and accurate breakdown** of the ScamShield codebase as it exists right now. It is designed for hackathon judges, viva preparation, and developer onboarding.

**⚠️ CRITICAL ARCHITECTURE NOTE:** The project was originally designed to use the real Polygon Amoy blockchain. However, because Amoy now requires mainnet ETH to acquire testnet tokens, the blockchain layer is **currently mocked using a local SQLite database**. It generates deterministic `0x...` hashes, realistic block numbers, and mimics a real blockchain flawlessly for demonstration purposes without incurring costs or network friction. The actual Solidity smart contracts exist in the repo but are currently dormant/bypassed.

---

## 1️⃣ Repository Overview

ScamShield is a hybrid AI-powered scam defense ecosystem. It has two main parts:
1. **Frontend (/frontend):** Built with Next.js 14, React, and Tailwind CSS. It features a striking Neobrutalist design (high contrast, bold colors).
2. **Backend (/backend):** Built with Python FastAPI. It performs **Dual-Engine Analysis**:
    - **Local Intelligence:** A fine-tuned **DistilBERT** model (running locally on CPU) for high-speed pattern recognition.
    - **Global Intelligence:** **Groq Llama 3** for deep semantic reasoning and psychological breakdown.
    - **Flywheel:** An automated data collection pipeline that captures every scan into a training database for continuous model improvement.
    - **Mock Ledger:** A simulated blockchain stored in SQLite to provide immutable-style public transparency.

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

### AI & Data Services
*   **`ml_service.py` (Local AI)**
    -   **Why it exists:** Provides fast, local classification without API costs.
    -   **What it does:** Loads the fine-tuned `scamshield-distilbert` weights using the Hugging Face `transformers` library. It converts text into a scam probability score (0.0 - 1.0) in under 50ms.
*   **`groq_service.py` (Cloud AI)**
    -   **What it does:** Handles complex reasoning. It generates red flags, advice, and the "Attacker's Mirror" psychology explainer. It also includes a `second_review()` function that re-evaluates messages if a user disagrees with the initial result.
*   **`ml_data/` (The Flywheel Engine)**
    -   **`ml_data_service.py`**: Manages `training_data.db`. Auto-creates the schema and saves every raw analysis result as a background task. 
    -   **`dataset_export.py`**: A CLI tool that exports the collected data into `.jsonl` formats ready for Hugging Face/OpenAI fine-tuning.
*   **`main.py` (The API Orchestrator)**
    -   **What it does:** Wires everything together. Bumps the version to `v0.4.0`.
    -   **Logic:** In `/analyze-text`, it calls both DistilBERT and Groq, blending their scores (40% ML / 60% LLM) for a more robust final verdict. It then kicks off a **Background Task** to save the evidence for the flywheel.

### Web3 & Scraping
*   **`blockchain_service.py` (The Mock Ledger)**
    -   **What it does:** Mimics a transparent ledger using a local SQLite file (`scam_ledger.db`). It generates deterministic `0x...` hashes and increments fake block numbers to provide a realistic experience of public auditability.
*   **`scraper_service.py`**
    -   **What it does:** Uses `BeautifulSoup` to strip HTML clutter and extract pure text for AI analysis.

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

## 7️⃣ THE AI DATA FLYWHEEL (SELF-IMPROVEMENT)

This is ScamShield’s competitive advantage. Every scan makes the system smarter.

1.  **Prediction:** A user scans a message.
2.  **Collection:** The backend saves the raw text, the AI's logic, and the score into `training_data.db`.
3.  **Human Feedback:** The user can click **👍 Looks Correct** or **👎 I Disagree** on the Result Card.
4.  **Verification:** If the user disagrees, the system automatically triggers a **Groq Second-Review**. Llama 3 re-evaluates the case carefully.
5.  **Ground Truth:** If Groq corrects its mistake, the `final_label` in the database is updated.
6.  **Retraining:** Developers run `dataset_export.py` to get a high-quality, human-verified dataset to fine-tune a new version of the local DistilBERT model.

---

## 8️⃣ END-TO-END EXECUTION FLOW

**Scenario: User uploads a screenshot of a "Bank Blocked" SMS**
1.  **OCR Extraction:** Frontend sends image to `/analyze-image`. Backend uses Tesseract to extract the text.
2.  **Dual-Analysis:** 
    - **ML:** `ml_service` gets a 0.98 score from DistilBERT ("Highly likely scam pattern").
    - **LLM:** `groq_service` reads the text, spots the fake URL and urgency, and confirms "Scam" with reasoning.
3.  **Blending:** `main.py` merges these results (Weighted average).
4.  **Background Save:** While the user sees the result, a background task saves the evidence to the Data Flywheel DB for future training.
5.  **User Review:** The user clicks "Add to Ledger" to put the hash on the blockchain mock, and "👍 Looks Correct" to verify the AI's reasoning.
6.  **Global Update:** The Trends dashboard instantly reflects the new scan in the "Live Threat Radar".
