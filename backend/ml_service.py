"""
ml_service.py — ScamShield local DistilBERT scam classifier.

Loads the fine-tuned scamshield-distilbert model once at startup and
provides a fast, offline classify_text() function used to enrich the
probability score returned by the Groq LLM.

No external API calls — runs entirely on CPU in ~50ms per message.
"""

from __future__ import annotations

import os
from pathlib import Path

# ── Model path ──────────────────────────────────────────────────────────────
_HERE = Path(__file__).parent
MODEL_DIR = _HERE / "scamshield-distilbert"

# ── Lazy-loaded globals (populated by load_model()) ──────────────────────────
_tokenizer = None
_model = None
_device = None
_available = False   # True once model is loaded successfully


def load_model() -> bool:
    """
    Load the DistilBERT tokenizer + model from the local model directory.

    Called once at FastAPI startup. Returns True if successful, False if
    the model folder is missing or transformers is not installed.
    """
    global _tokenizer, _model, _device, _available

    if _available:
        return True  # already loaded

    if not MODEL_DIR.exists():
        print(
            f"⚠️  ML model not found at {MODEL_DIR}. "
            "Copy the scamshield-distilbert folder into backend/ to enable local ML scoring."
        )
        return False

    try:
        import torch
        from transformers import AutoTokenizer, AutoModelForSequenceClassification

        _device = "cuda" if torch.cuda.is_available() else "cpu"

        print(f"🤖 Loading DistilBERT from {MODEL_DIR} on {_device.upper()}…")

        _tokenizer = AutoTokenizer.from_pretrained(str(MODEL_DIR))
        _model = AutoModelForSequenceClassification.from_pretrained(str(MODEL_DIR))
        _model.to(_device)
        _model.eval()  # inference mode — disables dropout

        _available = True
        print(f"✅ DistilBERT loaded successfully ({_count_params(_model):,} params, device={_device.upper()})")
        return True

    except ImportError:
        print(
            "⚠️  `transformers` / `torch` not installed. "
            "Run: pip install transformers torch  to enable local ML scoring."
        )
        return False

    except Exception as e:
        print(f"⚠️  Failed to load DistilBERT model: {e}")
        return False


def classify_text(message: str) -> float | None:
    """
    Classify a text message using the local DistilBERT model.

    Returns:
        float: Scam probability in range [0.0, 1.0]
        None:  If the model is not loaded (graceful degradation)
    """
    if not _available or _model is None or _tokenizer is None:
        return None

    try:
        import torch

        inputs = _tokenizer(
            message,
            return_tensors="pt",
            truncation=True,
            max_length=256,
            padding=True,
        )
        # DistilBERT does NOT use token_type_ids — remove it if present
        inputs = {k: v.to(_device) for k, v in inputs.items() if k != "token_type_ids"}

        with torch.no_grad():
            logits = _model(**inputs).logits

        probs = torch.softmax(logits, dim=-1)[0]
        scam_prob = probs[1].item()   # index 1 = SCAM label
        return round(scam_prob, 4)

    except Exception as e:
        print(f"⚠️  ML inference error: {e}")
        return None


def is_available() -> bool:
    """Return True if the model has been loaded and is ready for inference."""
    return _available


# ── Internal helpers ──────────────────────────────────────────────────────────
def _count_params(model) -> int:
    return sum(p.numel() for p in model.parameters())
