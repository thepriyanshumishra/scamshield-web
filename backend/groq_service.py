"""
groq_service.py — ScamShield AI analysis using Groq LLM.

How it works:
  1. We send the suspicious text to Groq's LLM (llama3-8b-8192).
  2. We give it a strict prompt: classify the message and return JSON.
  3. We parse the JSON and return a structured AnalysisResult.

We intentionally ask the model to return ONLY JSON so we can parse it
reliably without any extra text-cleaning.
"""

import json
import os
import re

from dotenv import load_dotenv

# Load .env BEFORE creating the Groq client — the client reads the env var
# at instantiation time, so this must happen at module level.
load_dotenv()

from groq import Groq  # noqa: E402 — import after load_dotenv intentionally

# ── Client (lazy singleton) ───────────────────────────────────────────────────
# We create the client inside get_client() so tests can patch os.environ easily.
_client: Groq | None = None


def _get_client() -> Groq:
    """Return the shared Groq client, creating it on first use."""
    global _client
    if _client is None:
        api_key = os.environ.get("GROQ_API_KEY", "")
        if not api_key:
            raise RuntimeError(
                "GROQ_API_KEY is not set. "
                "Copy backend/.env.example → backend/.env and add your key."
            )
        _client = Groq(api_key=api_key)
    return _client


# ── Valid scam categories (as defined in PROJECT_SPEC.md) ────────────────────
VALID_CATEGORIES = {
    "bank scam",
    "job scam",
    "courier scam",
    "lottery scam",
    "phishing",
    "normal message",
}

# ── Prompt template ───────────────────────────────────────────────────────────
SYSTEM_PROMPT = """You are ScamShield AI — an expert scam detection assistant.

Your job is to analyse a text message and classify it.

You MUST reply with ONLY a JSON object — no explanation, no markdown, no extra text.
The JSON must follow this exact structure:

{
  "probability": <float between 0.0 and 1.0 — how likely it is a scam>,
  "category": <one of: "bank scam", "job scam", "courier scam", "lottery scam", "phishing", "normal message">,
  "red_flags": [<list of short strings describing suspicious elements, empty list if safe>],
  "advice": <one sentence of safety advice for the user>
}

Rules:
- probability = 1.0 means definitely a scam, 0.0 means definitely safe.
- For normal/safe messages, use category "normal message", probability < 0.2, empty red_flags.
- red_flags must be short (< 10 words each), max 5 items.
- advice must be a single, clear sentence.
- Do NOT include any text outside the JSON object.
"""


def analyse_text(message: str) -> dict:
    """
    Send a text message to Groq LLM and return a parsed scam analysis result.

    Returns a dict with keys: probability, category, red_flags, advice.
    Falls back to a safe default if parsing fails.
    """
    raw = ""
    try:
        client = _get_client()

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user",   "content": f"Analyse this message:\n\n{message}"},
            ],
            temperature=0.1,   # low temperature = more consistent, structured output
            max_tokens=400,
        )

        raw = response.choices[0].message.content.strip()

        # Extract JSON — sometimes the model wraps it in ```json ... ``` despite instructions
        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        if json_match:
            raw = json_match.group(0)

        result = json.loads(raw)

        # Sanitise and enforce types
        probability = float(result.get("probability", 0.5))
        probability = max(0.0, min(1.0, probability))  # clamp to [0, 1]

        category = str(result.get("category", "normal message")).lower().strip()
        if category not in VALID_CATEGORIES:
            category = "normal message"

        red_flags = result.get("red_flags", [])
        if not isinstance(red_flags, list):
            red_flags = []
        red_flags = [str(f) for f in red_flags[:5]]  # max 5 flags

        advice = str(result.get("advice", "Stay cautious and verify the source."))

        return {
            "probability": probability,
            "category":    category,
            "red_flags":   red_flags,
            "advice":      advice,
        }

    except json.JSONDecodeError as e:
        # Model returned non-JSON — log and return a safe fallback
        print(f"⚠️  Groq JSON parse error: {e}\nRaw response: {raw!r}")
        return _fallback_result()

    except RuntimeError as e:
        # Missing API key
        print(f"⚠️  Configuration error: {e}")
        return _fallback_result()

    except Exception as e:
        print(f"⚠️  Groq API error: {e}")
        return _fallback_result()


def _fallback_result() -> dict:
    """Return a conservative fallback when the AI call fails."""
    return {
        "probability": 0.5,
        "category":    "normal message",
        "red_flags":   ["Could not analyse — AI service unavailable"],
        "advice":      "Please try again. If you suspect a scam, do not share personal information.",
    }
