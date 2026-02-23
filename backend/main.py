"""
main.py — ScamShield FastAPI backend.

Endpoints:
  POST /analyze-text   → Groq LLM scam analysis for text input
  POST /analyze-image  → Tesseract OCR + Groq LLM analysis for image upload
  POST /store-scam     → Store scam hash + category in SQLite
  GET  /scams          → Fetch all stored scams
"""

import io
import os

from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from blockchain_service import add_scam_to_ledger, get_all_scams
from groq_service import analyse_text, generate_arcade_level
import random

# ── Load environment variables from .env ───────────────────────────────────
load_dotenv()

# ── App setup ──────────────────────────────────────────────────────────────
app = FastAPI(title="ScamShield API", version="0.2.0")

# Allow frontend (localhost:3000) to call this API during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
async def startup():
    """Run validations on server start."""
    # Check API key is present
    if not os.environ.get("GROQ_API_KEY"):
        print("⚠️  WARNING: GROQ_API_KEY not set. Copy backend/.env.example → .env and add your key.")
    else:
        print("✅ Groq API key loaded.")


# ── Request / Response models ───────────────────────────────────────────────
class TextRequest(BaseModel):
    message: str


class HighlightedPhrase(BaseModel):
    phrase: str
    danger: str  # "high" or "medium"


class AnalysisResult(BaseModel):
    probability: float                              # 0.0 – 1.0
    category: str                                   # e.g. "bank scam"
    red_flags: list[str]
    highlighted_phrases: list[HighlightedPhrase] = []  # verbatim dangerous substrings
    advice: str
    extracted_text: str = ""                        # OCR text from image


class StoreRequest(BaseModel):
    message_hash: str
    category: str


# ── OCR: build language string once at import time ───────────────────────────
def _build_lang_string() -> str:
    """
    Dynamically fetch all installed Tesseract language packs and join them
    into a single lang string (e.g. 'eng+hin+fra+deu+...').

    Falls back to 'eng+hin' if Tesseract isn't installed yet.
    Excludes special non-text packs: osd (orientation) and snum (digits).
    """
    try:
        import pytesseract
        langs = pytesseract.get_languages(config="")
        # Filter out utility packs that aren't real languages
        langs = [l for l in langs if l not in ("osd", "snum")]
        if langs:
            lang_str = "+".join(sorted(langs))
            print(f"🌍 Tesseract OCR: {len(langs)} language packs loaded → {lang_str[:80]}…")
            return lang_str
    except Exception as e:
        print(f"⚠️  Could not list Tesseract languages: {e}")
    return "eng+hin"  # safe fallback


_TESSERACT_LANGS = _build_lang_string()


# ── OCR helper ───────────────────────────────────────────────────────────────
def _extract_text_from_image(image_bytes: bytes) -> str:
    """
    Run Tesseract OCR on image bytes using ALL installed language packs.

    Fallback chain:
      1. All installed langs (e.g. eng+hin+fra+deu+... 163 packs)
      2. eng+hin   — if the full multi-lang call fails
      3. eng       — last resort

    Returns extracted text, or a descriptive error string if Tesseract
    is not installed (so the AI still receives something useful).
    """
    try:
        import pytesseract
        from PIL import Image

        image = Image.open(io.BytesIO(image_bytes))

        # Convert to RGB if needed (e.g. PNG with alpha channel)
        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")

        # Try all languages, fall back progressively
        for lang in (_TESSERACT_LANGS, "eng+hin", "eng"):
            try:
                text = pytesseract.image_to_string(image, lang=lang)
                text = text.strip()
                if text:
                    return text
            except pytesseract.TesseractError:
                continue  # try next fallback

        return "[OCR returned empty text — image may be blurry or contain no text]"

    except ImportError:
        return "[pytesseract not installed — run: pip install pytesseract Pillow]"
    except Exception as e:
        return f"[OCR error: {e}]"


# ── Endpoints ───────────────────────────────────────────────────────────────
@app.post("/analyze-text", response_model=AnalysisResult)
async def analyze_text_endpoint(body: TextRequest):
    """
    Analyze a text message for scam indicators using Groq LLM.

    Input : { "message": "..." }
    Output: { probability, category, red_flags[], advice }
    """
    result = analyse_text(body.message)
    return result


@app.post("/analyze-image", response_model=AnalysisResult)
async def analyze_image(file: UploadFile = File(...)):
    """
    Accept an image upload, run OCR (English + Hindi), then analyze with Groq.

    Flow: image → pytesseract OCR → extracted text → Groq LLM → result JSON
    """
    image_bytes = await file.read()
    extracted_text = _extract_text_from_image(image_bytes)

    print(f"📝 OCR extracted ({len(extracted_text)} chars): {extracted_text[:120]}…")

    result = analyse_text(extracted_text)
    # Attach the OCR text so the frontend can show it to the user
    result["extracted_text"] = extracted_text
    return result


@app.post("/store-scam")
async def store_scam(body: StoreRequest):
    """
    Store a scam hash + category on the Polygon Amoy blockchain.

    Input : { "message_hash": "...", "category": "..." }
    Output: { "tx_hash": <transaction hex>, "message": "Scam stored on-chain successfully." }
    """
    tx_hash = add_scam_to_ledger(body.message_hash, body.category)
    return {"tx_hash": tx_hash, "message": "Scam stored on-chain successfully."}


@app.get("/scams")
async def get_scams():
    """Fetch all scam records directly from the Polygon Amoy blockchain."""
    try:
        scams = get_all_scams()
        # Sort newest first based on on-chain timestamp
        scams.sort(key=lambda x: x["timestamp"], reverse=True)
        return {"total": len(scams), "scams": scams}
    except Exception as e:
        print(f"Error fetching scams from blockahin: {e}")
        return {"total": 0, "scams": []}

# ── Dynamic AI Arcade Endpoint ──────────────────────────────────────────────
@app.get("/arcade/generate")
async def get_arcade_level():
    """
    Randomly generates a scam or safe text message using the Groq LLM.
    We skew it slightly towards scams (60/40) to keep the game engaging.
    """
    # 60% chance to force a scam message, 40% chance for a safe message
    force_scam = random.random() < 0.60
    
    try:
        level_data = generate_arcade_level(force_scam)
        return level_data
    except Exception as e:
        print(f"Error generating arcade level: {e}")
        return {
            "text": "Failed to connect to the AI engine.",
            "isScam": False,
            "explanation": "Backend error. Please try again."
        }

# ── Health check ────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"status": "ok", "service": "ScamShield API", "version": "0.2.0"}
