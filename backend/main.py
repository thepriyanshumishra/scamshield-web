"""
main.py — ScamShield FastAPI backend.

Endpoints:
  POST /analyze-text   → DistilBERT + Groq LLM scam analysis
  POST /analyze-image  → Tesseract OCR + Groq LLM analysis for image upload
  POST /analyze-url    → Scrape + analyze a URL
  POST /analyze-ml     → Fast local DistilBERT-only classification
  POST /feedback       → User feedback (agree / disagree) — powers data flywheel
  GET  /dataset-stats  → Dataset collection statistics
  POST /store-scam     → Store scam hash + category in SQLite
  GET  /scams          → Fetch all stored scams
"""

import io
import os
import sys

from dotenv import load_dotenv
from fastapi import BackgroundTasks, FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from blockchain_service import add_scam_to_ledger, get_all_scams
from groq_service import analyse_text, generate_arcade_level, second_review
from scraper_service import fetch_text_from_url
import ml_service
from ml_data import ml_data_service
import random

# ── Load environment variables from .env ───────────────────────────────────
load_dotenv()

# ── App setup ──────────────────────────────────────────────────────────────
app = FastAPI(title="ScamShield API", version="0.4.0")

# Allow frontend (localhost:3000) to call this API during development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    # Load local DistilBERT model
    ml_service.load_model()
    # Initialise training data database
    ml_data_service.init_db()


# ── Request / Response models ───────────────────────────────────────────────
class TextRequest(BaseModel):
    message: str


class UrlRequest(BaseModel):
    url: str


class HighlightedPhrase(BaseModel):
    phrase: str
    danger: str  # "high" or "medium"


class AnalysisResult(BaseModel):
    probability: float                              # 0.0 – 1.0
    category: str                                   # e.g. "bank scam"
    red_flags: list[str]
    highlighted_phrases: list[HighlightedPhrase] = []  # verbatim dangerous substrings
    psychology_explainer: str = ""                  # psychological manipulation breakdown
    advice: str
    extracted_text: str = ""                        # OCR text from image
    ml_score: float | None = None                   # local DistilBERT scam score (0.0–1.0)


class MLAnalysisResult(BaseModel):
    ml_score: float        # scam probability 0.0–1.0
    label: str             # "SCAM" or "SAFE"
    confidence: float      # probability of the winning label
    model_available: bool  # False if model not loaded


class StoreRequest(BaseModel):
    message_hash: str
    category: str


class FeedbackRequest(BaseModel):
    message_text: str          # original message the user scanned
    feedback: str              # "agree" | "disagree"
    reason: str = ""           # optional explanation from user


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


# ── Data flywheel helper ─────────────────────────────────────────────────────
def _save_to_db(message_text: str, result: dict, ml_score: float | None) -> None:
    """
    Persist a completed analysis result to the training database.
    Runs as a background task so it never blocks the HTTP response.
    """
    try:
        # Determine final label from probability + category
        prob = result.get("probability", 0)
        category = result.get("category", "normal message")
        if category == "normal message" or prob < 0.35:
            final_label = "safe"
        elif prob >= 0.55:
            final_label = "scam"
        else:
            final_label = "uncertain"

        ml_prediction = None
        if ml_score is not None:
            ml_prediction = "SCAM" if ml_score >= 0.5 else "SAFE"

        ml_data_service.save_initial_prediction(
            message_text=message_text,
            local_model_prediction=ml_prediction,
            local_model_score=ml_score,
            groq_prediction=category,
            final_label=final_label,
            red_flags=result.get("red_flags", []),
            psychology_tags=result.get("psychology_explainer", ""),
            advice=result.get("advice", ""),
        )
    except Exception as e:
        print(f"⚠️  Background DB save failed: {e}")


# ── Endpoints ───────────────────────────────────────────────────────────────
@app.post("/analyze-text", response_model=AnalysisResult)
async def analyze_text_endpoint(body: TextRequest, background_tasks: BackgroundTasks):
    """
    Analyze a text message for scam indicators.

    Uses Groq LLM for rich analysis (category, flags, advice) and blends
    in the local DistilBERT score for a more accurate final probability.
    Every result is saved to the training DB as a background task.

    Input : { "message": "..." }
    Output: { probability, category, red_flags[], advice, ml_score }
    """
    result = analyse_text(body.message)

    # Blend in local ML score if available
    ml_score = ml_service.classify_text(body.message)
    if ml_score is not None:
        groq_prob = result["probability"]   # already 0.0–1.0
        blended = round(0.60 * groq_prob + 0.40 * ml_score, 4)
        result["probability"] = blended
        result["ml_score"] = ml_score

    # Save to training DB (non-blocking)
    background_tasks.add_task(_save_to_db, body.message, result, ml_score)

    return result


@app.post("/analyze-ml", response_model=MLAnalysisResult)
async def analyze_ml_endpoint(body: TextRequest):
    """
    Fast local scam classification using the fine-tuned DistilBERT model.
    No external API call — runs entirely on-device in ~50ms.

    Input : { "message": "..." }
    Output: { ml_score, label, confidence, model_available }
    """
    if not ml_service.is_available():
        return MLAnalysisResult(
            ml_score=0.5,
            label="UNKNOWN",
            confidence=0.5,
            model_available=False,
        )

    ml_score = ml_service.classify_text(body.message)
    if ml_score is None:
        return MLAnalysisResult(
            ml_score=0.5,
            label="UNKNOWN",
            confidence=0.5,
            model_available=True,
        )

    label = "SCAM" if ml_score >= 0.5 else "SAFE"
    confidence = ml_score if label == "SCAM" else (1.0 - ml_score)

    return MLAnalysisResult(
        ml_score=round(ml_score, 4),
        label=label,
        confidence=round(confidence, 4),
        model_available=True,
    )


@app.post("/analyze-url", response_model=AnalysisResult)
async def analyze_url_endpoint(body: UrlRequest, background_tasks: BackgroundTasks):
    """
    Scrape text from a public URL and analyze it for scam indicators,
    such as fake login pages, fraudulent shops, or investment schemes.

    Input : { "url": "https://..." }
    Output: { probability, category, red_flags[], advice, extracted_text }
    """
    try:
        scraped_text = fetch_text_from_url(body.url)
        if not scraped_text.strip():
            raise Exception("No readable text found at this URL.")

        result = analyse_text(scraped_text)
        result["extracted_text"] = scraped_text[:1000] + ("..." if len(scraped_text) > 1000 else "")

        ml_score = ml_service.classify_text(scraped_text)
        background_tasks.add_task(_save_to_db, scraped_text, result, ml_score)
        return result
    except Exception as e:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/analyze-image", response_model=AnalysisResult)
async def analyze_image(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    """
    Accept an image upload, run OCR (English + Hindi), then analyze with Groq.

    Flow: image → pytesseract OCR → extracted text → Groq LLM → result JSON
    """
    image_bytes = await file.read()
    extracted_text = _extract_text_from_image(image_bytes)

    print(f"📝 OCR extracted ({len(extracted_text)} chars): {extracted_text[:120]}…")

    result = analyse_text(extracted_text)
    result["extracted_text"] = extracted_text

    ml_score = ml_service.classify_text(extracted_text)
    background_tasks.add_task(_save_to_db, extracted_text, result, ml_score)
    return result


@app.post("/store-scam")
async def store_scam(body: StoreRequest):
    """
    Store a scam hash + category in the persistent ledger.

    Input : { "message_hash": "...", "category": "..." }
    Output: { "tx_hash": <hex string>, "message": "Scam stored successfully." }
    """
    try:
        tx_hash = add_scam_to_ledger(body.message_hash, body.category)
        return {"tx_hash": tx_hash, "message": "Scam stored successfully."}
    except Exception as e:
        print(f"❌ /store-scam failed: {e}")
        from fastapi import HTTPException
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/scams")
async def get_scams():
    """Fetch all scam records directly from the Polygon Amoy blockchain."""
    try:
        scams = get_all_scams()
        # Sort newest first based on on-chain timestamp
        scams.sort(key=lambda x: x["timestamp"], reverse=True)
        return {"total": len(scams), "scams": scams}
    except Exception as e:
        print(f"Error fetching scams from blockchain: {e}")
        return {"total": 0, "scams": []}


# ── Feedback endpoint (data flywheel) ──────────────────────────────────────
@app.post("/feedback")
async def submit_feedback(body: FeedbackRequest):
    """
    Record a user's thumbs-up / thumbs-down for a previous analysis.

    If feedback == "agree":
        Simply marks the row as confirmed → high-confidence training label.

    If feedback == "disagree":
        Triggers a Groq second-review with the user's reason.
        If Groq changes its verdict, the DB label is updated.
        This produces corrected, human-verified training data.

    Input : { "message_text": "...", "feedback": "agree"|"disagree", "reason": "..." }
    Output: { "status": "ok", "label_changed": bool, "new_verdict": str }
    """
    if body.feedback not in ("agree", "disagree"):
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="feedback must be 'agree' or 'disagree'")

    # Save the user's feedback to the DB
    ml_data_service.update_feedback(
        message_text=body.message_text,
        feedback=body.feedback,
        reason=body.reason,
    )

    if body.feedback == "agree":
        return {"status": "ok", "label_changed": False, "new_verdict": None}

    # ── Disagreement path: Groq second-review ─────────────────────────────
    try:
        new_verdict = second_review(
            message=body.message_text,
            user_reason=body.reason,
        )
        # new_verdict is "scam" | "safe" | "uncertain"
        ml_data_service.update_final_label(
            message_text=body.message_text,
            new_label=new_verdict,
        )
        print(f"🔄 Second-review updated label → {new_verdict} for: {body.message_text[:60]}")
        return {"status": "ok", "label_changed": True, "new_verdict": new_verdict}
    except Exception as e:
        print(f"⚠️  Second-review failed: {e}")
        return {"status": "ok", "label_changed": False, "new_verdict": None}


@app.get("/dataset-stats")
async def dataset_stats():
    """Return statistics about the collected training dataset."""
    stats = ml_data_service.get_stats()
    return stats

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
    stats = ml_data_service.get_stats()
    return {
        "status": "ok",
        "service": "ScamShield API",
        "version": "0.4.0",
        "ml_model_loaded": ml_service.is_available(),
        "dataset_rows": stats.get("total", 0),
    }
