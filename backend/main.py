"""
main.py — ScamShield FastAPI backend.

Endpoints:
  POST /analyze-text   → AI scam analysis for text input
  POST /analyze-image  → OCR + AI scam analysis for image upload
  POST /store-scam     → Store scam hash + category in SQLite
  GET  /scams          → Fetch all stored scams
"""

import hashlib
import io

from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from database import fetch_all_scams, init_db, insert_scam

# ── App setup ──────────────────────────────────────────────────────────────
app = FastAPI(title="ScamShield API", version="0.1.0")

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
    """Initialize the SQLite database on server start."""
    init_db()


# ── Request / Response models ───────────────────────────────────────────────
class TextRequest(BaseModel):
    message: str


class AnalysisResult(BaseModel):
    probability: float       # 0.0 – 1.0
    category: str            # e.g. "bank scam"
    red_flags: list[str]
    advice: str


class StoreRequest(BaseModel):
    message_hash: str
    category: str


# ── Helper: build mock analysis result ─────────────────────────────────────
def _mock_analysis(text: str) -> dict:
    """
    Placeholder analysis — returns a hardcoded result.
    Replace with Groq LLM call in the next phase.
    """
    return {
        "probability": 0.87,
        "category": "bank scam",
        "red_flags": [
            "Urgency language detected",
            "Request for OTP / PIN",
            "Unknown sender number",
        ],
        "advice": (
            "Do NOT share your OTP or bank PIN with anyone. "
            "Report this number to your bank immediately."
        ),
    }


# ── Endpoints ───────────────────────────────────────────────────────────────
@app.post("/analyze-text", response_model=AnalysisResult)
async def analyze_text(body: TextRequest):
    """
    Analyze a text message for scam indicators.

    Input : { "message": "..." }
    Output: { probability, category, red_flags[], advice }
    """
    result = _mock_analysis(body.message)
    return result


@app.post("/analyze-image", response_model=AnalysisResult)
async def analyze_image(file: UploadFile = File(...)):
    """
    Accept an image upload, run OCR to extract text, then analyze.

    Phase 1: OCR via pytesseract (English + Hindi).
    Phase 2 (next step): Replace mock analysis with Groq LLM call.
    """
    try:
        import pytesseract
        from PIL import Image

        image_bytes = await file.read()
        image = Image.open(io.BytesIO(image_bytes))

        # OCR — English + Hindi
        extracted_text = pytesseract.image_to_string(image, lang="eng+hin")
    except Exception as e:
        # If tesseract isn't installed yet, fall back to placeholder text
        extracted_text = f"[OCR unavailable: {e}] Sample scam text for demo."

    result = _mock_analysis(extracted_text)
    return result


@app.post("/store-scam")
async def store_scam(body: StoreRequest):
    """
    Store a scam hash + category in SQLite.

    Input : { "message_hash": "...", "category": "..." }
    Output: { "id": <new row id>, "message": "Scam stored successfully." }
    """
    new_id = insert_scam(body.message_hash, body.category)
    return {"id": new_id, "message": "Scam stored successfully."}


@app.get("/scams")
async def get_scams():
    """Return all stored scam records."""
    scams = fetch_all_scams()
    return {"total": len(scams), "scams": scams}


# ── Health check ────────────────────────────────────────────────────────────
@app.get("/")
async def root():
    return {"status": "ok", "service": "ScamShield API"}
