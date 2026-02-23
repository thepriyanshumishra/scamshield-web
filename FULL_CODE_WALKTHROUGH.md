# ScamShield: Full Code Walkthrough 🚀

Welcome to the complete code walkthrough for **ScamShield**! This document is written for beginners, hackathon judges, and new team members to fully understand how the entire project fits together. 

ScamShield is an AI-powered scam detection platform that uses **Groq (Llama-3)** to analyze text/images and **Polygon (Web3)** to store confirmed scams onto an immutable public ledger.

---

## 📁 1. Project Root Overview

This is what you see when you open the main project folder.

- **`README.md`**: The main introduction file for the project. It tells people what the project is, how to install it, and what technologies it uses.
- **`learning.md` / `PROJECT_DEEP_DIVE.md`**: Internal documentation files we created to track our learnings and plan major feature implementations.
- **`.gitignore`**: Tells Git which files to ignore (like `node_modules`, standard `.env` secrets, and python cache files), so we don't accidentally push large or sensitive files to GitHub.
- **`frontend/`**: The entire Next.js web application (React, Tailwind CSS).
- **`backend/`**: The entire Python FastAPI server (AI integrations, API endpoints, OOP logic).
- **`blockchain/`**: The Hardhat environment for writing and deploying our Solidity smart contracts to the Polygon Amoy blockchain.

---

## 🖥 2. FRONTEND — File by File Walkthrough

The frontend is built with **Next.js (App Router)**, **React**, and **Tailwind CSS**. It uses a very recognizable, high-contrast "Neobrutalism" design language.

### Folder Structure
- `frontend/app/`: Contains all the "pages" of the website. Each folder inside represents a route (e.g., `/arcade`, `/ledger`).
- `frontend/components/`: Reusable UI pieces (like the Navigation bar).
- `frontend/tailwind.config.ts`: Where the design system is defined.

### File: `frontend/tailwind.config.ts`
- **Purpose**: Defines our custom "Neobrutalist" colors (`neo-yellow`, `neo-red`, `neo-green`, etc.), massive font-sizes, and thick borders/shadows. 
- **How it fits**: Every page uses these custom classes (e.g., `bg-neo-yellow shadow-neo`) to maintain a unique, premium design.

### File: `frontend/app/layout.tsx`
- **Purpose**: The master wrapper for every page. It loads the "Space Grotesk" font and includes the `<LiveThreatToast />` component so popups appear on every single screen.

### File: `frontend/components/Navbar.tsx`
- **Purpose**: The top navigation bar. Links the user to Detect (Home), Ledger, Trends, Arcade, and the Developer API portal.

### File: `frontend/components/LiveThreatToast.tsx`
- **Purpose**: A fun UI component that randomly pops up fake "scam intercepted" messages in the bottom-right corner of the screen every 8-15 seconds. It makes the platform feel alive and active.

### File: `frontend/app/page.tsx`
- **Purpose**: The main **Home / Detect Page**. This is where users paste text or upload an image to be scanned.
- **Key Code & Flow**:
    - `handleAnalyze()`: Gathers the text or image, shows a "Analyzing..." loading state, and sends it to the backend (`POST /analyze-text` or `POST /analyze-image`).
    - `handleStoreOnBlockchain()`: If a scam is detected, this function uses `crypto.subtle.digest("SHA-256")` to create a secure unique hash of the message, then sends it to the backend (`POST /store-scam`) to save it to the Polygon blockchain.
    - **Police Report**: Contains a hidden PDF layout (`className="hidden print:block"`) that only appears when the user clicks "Download Police Report". It calls `window.print()` to generate a clean, official-looking document of the AI analysis.

### File: `frontend/app/ledger/page.tsx`
- **Purpose**: Shows the public **Blockchain Ledger**.
- **Key Code**: Connects to the backend `GET /scams` to retrieve all past scams. Displays them in a sleek list with category badges. Clicking a scam opens a beautiful Neobrutalist popup showing the exact timestamp and providing a direct link to view it on PolygonScan (the blockchain explorer).

### File: `frontend/app/trends/page.tsx`
- **Purpose**: The **Analytics Dashboard**.
- **Key Code**: Fetches the same `/scams` data as the Ledger, but instead of a list, it calculates percentages and renders a massive "Donut/Pie Chart" and interactive progress bars using CSS `conic-gradient()`.

### File: `frontend/app/arcade/page.tsx`
- **Purpose**: An interactive, endless educational minigame ("Spot the Scam").
- **Key Code**:
    - `fetchNextLevel()`: Automatically calls the backend (`GET /arcade/generate`) to dynamically generate a *brand new, unique* message using Groq AI. 
    - The user has to click "Scam" or "Safe". If they guess right, the score goes up. If they guess wrong, it's Game Over! It teaches users what modern scams look like.

### File: `frontend/app/developers/page.tsx`
- **Purpose**: A **Developer API Portal** designed for B2B integration.
- **Key Code**: Just a visually stunning, static documentation page showing functional `cURL`, `Python`, and `Node.js` code snippets that point to our local backend, allowing developers to integrate ScamShield directly into their own chat apps.

---

## ⚙️ 3. BACKEND — File by File Walkthrough

The backend is written in **Python** using the **FastAPI** framework. It acts as the brain connecting the Web Frontend to the Groq AI Engine and Polygon Blockchain.

### File: `backend/main.py`
- **Purpose**: The core server file. Maps incoming HTTP requests (URLs) to Python functions.
- **Important Endpoints**:
    - `POST /analyze-text`: Accepts a `{message}` payload, sends it to `groq_service.py`, and returns exactly what the AI thinks (Probability, Red Flags, Advice).
    - `POST /analyze-image`: Receives an uploaded image. Uses **Tesseract OCR (pytesseract)** to extract any text from the screenshot, then passes that extracted text to the AI for analysis.
    - `POST /store-scam`: Receives a secure hash of a scam message and talks to `blockchain_service.py` to write it permanently to Polygon.
    - `GET /scams`: Returns the full history of recorded scams from the blockchain.
    - `GET /arcade/generate`: A special endpoint exclusively for the minigame that asks the AI to randomly invent a new scam or a safe message.

### File: `backend/groq_service.py`
- **Purpose**: The AI Intelligence layer. Talks directly to the **Groq Llama-3.3-70b Engine**.
- **Key Functions**:
    - `analyse_text(text)`: Tells the AI: *"You are a cybersecurity expert. Analyze the following message and output strict JSON..."*. It parses the AI response and returns it to `main.py`.
    - `generate_arcade_level(force_scam)`: Used for the minigame. It picks a random theme (e.g., "Pig Butchering", "Netflix Reset") and forces the AI to invent a highly realistic example on the fly. 

### File: `backend/blockchain_service.py`
- **Purpose**: The Web3 integration layer.
- **Key Logic**: Uses the Python `web3` library to construct transactions. It loads the Smart Contract's address and ABI (the map of its functions), signs transactions using a private Wallet Key defined in our `.env` file, and broadcasts them to the Polygon Amoy Testnet.

### File: `backend/.env`
- **Purpose**: Secrets storage. Contains our `GROQ_API_KEY`, our Web3 Wallet Private Key, and Alchemy API endpoint URL. This file is *never* pushed to GitHub.

---

## ⛓ 4. BLOCKCHAIN — File by File Walkthrough

This directory contains our Ethereum/Polygon smart contract environment using **Hardhat**.

### File: `blockchain/contracts/ScamLedger.sol`
- **Purpose**: The actual **Smart Contract** running live on the blockchain. Written in Solidity.
- **Key Functions**:
    - `storeScam(string memory _hash, string memory _category)`: Accepts a unique ID (hash) of the scam and its category (e.g., "phishing"). It ties it to the current block timestamp and saves it forever into the blockchain's state. It emits a `ScamStored` event so listeners can react.
    - `getScamByHash()` & `getAllScams()`: "Read-only" functions that allow anyone in the world to query our contract and see the scam history for free.

### File: `blockchain/hardhat.config.js`
- **Purpose**: Tells Hardhat how to connect to the Polygon Amoy testnet using our private key and RPC URL (via Alchemy). 

### File: `blockchain/ignition/modules/ScamLedger.js`
- **Purpose**: The deployment script. When we ran `npx hardhat ignition deploy`, this script told Hardhat exactly which contract to compile and push to the live blockchain network.

---

## 🔄 5. END-TO-END CODE FLOW (How it all works together)

Let's trace exactly what happens when a user uses the app, step-by-step:

1. **User Input:** The user visits the ScamShield website (loaded from `frontend/app/page.tsx`). They paste a text message (e.g., *"Click here for free money: bit.ly/scam"*) and press the **"⚡ Analyze Message Now"** button.
2. **Frontend Request:** The `handleAnalyze` function in `page.tsx` takes that text, packages it into JSON, and makes a network `fetch` request to the backend: `POST http://127.0.0.1:8000/analyze-text`.
3. **Backend Routing:** `backend/main.py` receives the request. It extracts the `{message}` and passes it directly to the `analyse_text()` function in `backend/groq_service.py`.
4. **AI Processing:** `groq_service.py` packages the message alongside a strict System Prompt and sends it instantly to the **Groq API**. Groq processes the text using a massive Llama 3 AI model and replies with a JSON object saying *"Probability: 0.99, Category: phishing, Red Flags: Suspicious link, Urgency"*.
5. **Display Result:** `main.py` sends this JSON back to the frontend. The `page.tsx` React component magically updates, rendering the red "🚨 Scam Detected" `ResultCard`.
6. **Blockchain Storage:** The user clicks **"⛓️ Add to Blockchain Ledger"**.
   - `page.tsx` scrambles the text into a completely unrecognizable, secure SHA-256 hash (e.g., `0xabc123...`).
   - It sends that hash to `POST /store-scam` in `backend/main.py`.
   - `main.py` calls `blockchain_service.py`.
   - Python signs a blockchain transaction with our wallet key and sends it to the Polygon Amoy network.
   - The `ScamLedger.sol` smart contract executes `storeScam()`, burning the scam's hash into the immutable public ledger forever.
7. **Reporting:** When the user visits the `/ledger` or `/trends` pages later, those pages ask `main.py` for all past scams, which pulls the data directly out of the Smart Contract state and displays it to the world!

**That is the complete lifecycle of ScamShield!** 🛡️🚀
