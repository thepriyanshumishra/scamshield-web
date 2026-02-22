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
SYSTEM_PROMPT = """You are ScamShield AI — a precise scam detection assistant.

Analyse the message and rate it on a 0–100 scale using this rubric:

0–10   → Completely normal. No suspicious signals at all.
11–25  → Slightly unusual but likely legitimate (marketing, informal text).
26–45  → Mildly suspicious — has one or two concerning elements but could be real.
46–60  → Moderately suspicious — multiple warning signs present.
61–75  → Highly suspicious — strong scam indicators, proceed with caution.
76–90  → Almost certainly a scam — clear manipulation tactics used.
91–100 → Definite scam — textbook fraud pattern, do not engage.

You MUST reply with ONLY a valid JSON object — no explanation, no markdown, nothing else.

{
  "probability": <integer 0–100 using the rubric above>,
  "category": <one of: "bank scam", "job scam", "courier scam", "lottery scam", "phishing", "normal message">,
  "red_flags": [<list of specific suspicious phrases or patterns found, empty if safe>],
  "advice": <one clear, actionable sentence of safety advice>
}

Scoring tips:
- A generic "Hi, how are you?" is 0–5.
- A promotional SMS with a discount code is 10–20.
- An unsolicited job offer with unusually high pay is 40–60.
- A message asking the user to forward an OTP + urgent deadline is 75–88.
- A message with OTP request + prize claim + unknown sender is 90–98.
- Do NOT default to 0 or 95. Use the full range.

CRITICAL EXCEPTION FOR LEGITIMATE OTPs AND BANK ALERTS:
If a message is clearly a standard automated OTP, login verification, or transaction alert sent *by* a legitimate service (e.g., "Your Swiggy OTP is 1234. Do not share it", or "SBI Alert: Rs. 500 debited. If not done by you, forward to 1915"):
- Score it 0-10.
- Category MUST be "normal message".
- "Do not share with anyone", "Forward to 1915", or "Call 1800..." in these contexts are standard safety warnings/instructions provided BY the service, NOT scam red flags.
- "Valid for 10 minutes" is standard expiry time, NOT a scam "urgency" tactic.
- Do NOT add any red flags for these standard phrases.

For ALL messages, your `advice` MUST be dynamically generated based on the specific context of the message. Do NOT use generic advice. For example:
- If it's a legitimate login OTP: "Only use this OTP if you are actively logging in. If you didn't request this, ignore it."
- If it's a legitimate bank alert: "This is a standard transaction alert. If you didn't authorize this, contact your bank immediately through their official channels."
- If it's a legitimate promotional message: "This appears to be a standard promotional offer."
- If it's a scam: provide specific advice on what to avoid doing (e.g., "Do not click the link or provide your bank details").
"""

# ── Category risk weights (used for calibration) ────────────────────────────
_CATEGORY_WEIGHT = {
    "bank scam":    1.10,
    "phishing":     1.08,
    "lottery scam": 1.05,
    "job scam":     1.03,
    "courier scam": 1.02,
    "normal message": 0.85,
}



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
            temperature=0.25,  # slightly higher = more spread in scores
            max_tokens=400,
        )

        raw = response.choices[0].message.content.strip()

        # Extract JSON — sometimes the model wraps it in ```json ... ``` despite instructions
        json_match = re.search(r"\{.*\}", raw, re.DOTALL)
        if json_match:
            raw = json_match.group(0)

        result = json.loads(raw)

        # ── Parse probability ─────────────────────────────────────────────
        # Model now returns 0–100 int per the new prompt.
        # Guard against 0.0–1.0 floats (some models ignore the format change).
        raw_prob = float(result.get("probability", 50))
        if raw_prob <= 1.0:
            # Model returned old-style 0.0–1.0 float — scale it up
            raw_prob = raw_prob * 100

        # ── Category ──────────────────────────────────────────────────────
        category = str(result.get("category", "normal message")).lower().strip()
        if category not in VALID_CATEGORIES:
            category = "normal message"

        # ── Red flags ─────────────────────────────────────────────────────
        red_flags = result.get("red_flags", [])
        if not isinstance(red_flags, list):
            red_flags = []
        red_flags = [str(f) for f in red_flags[:5]]

        # ── Advice ────────────────────────────────────────────────────────
        advice = str(result.get("advice", "Stay cautious and verify the source."))

        # ── Calibration: blend model score with red-flag count + category ─
        # This spreads scores across the full range instead of clustering at 0/90.
        flag_count   = len(red_flags)
        flag_bonus   = flag_count * 4.0          # each red flag adds ~4 points
        cat_weight   = _CATEGORY_WEIGHT.get(category, 1.0)

        # Weighted blend: 70% model score + 30% flag-based score
        flag_score   = min(flag_count / 5 * 100, 100)   # 5 flags = 100 points
        blended      = 0.70 * raw_prob + 0.30 * flag_score
        calibrated   = blended * cat_weight + flag_bonus

        # For "normal message", strictly cap the score to avoid mathematical hallucination
        # of high risk from innocent words.
        if category == "normal message":
            calibrated = min(calibrated, 15.0)

        probability = round(max(0.0, min(100.0, calibrated))) / 100.0

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

# ── Arcade Minigame Generation ───────────────────────────────────────────────
ARCADE_PROMPT = """You are a creative cybersecurity game developer for ScamShield.
Your job is to generate exactly ONE random, highly realistic text message (SMS, WhatsApp, or short Email).

The user parameter 'Force-Scam:' will dictate whether you generate a malicious scam or a perfectly safe, normal message.

RULES:
1. Make it realistic (e.g. typos in scams, standard corporate speak in safe messages).
2. For SCAMS, use common modern vectors: Pig butchering, fake crypto refunds, job tasks, KYC suspension, fake delivery.
3. For SAFE messages, use standard notifications: OTPs from known services, friend texting, calendar reminders, legitimate delivery updates.
4. Keep the text under 300 characters.
5. Provide a short, educational explanation of WHY it is or is not a scam.

You must output ONLY valid JSON without markdown wrapping. Format:
{
  "text": "The generated string message",
  "isScam": true/false,
  "explanation": "Short 1-2 sentence explanation of the red flags or safety indicators."
}"""

def generate_arcade_level(force_scam: bool) -> dict:
    """
    Generates a fresh, realistic text message for the /arcade minigame.
    Returns: {"text": str, "isScam": bool, "explanation": str}
    """
    client = _get_client()
    
    constraint = "Force-Scam: TRUE (Generate a highly deceptive scam message)" if force_scam else "Force-Scam: FALSE (Generate a completely safe, normal everyday message)"
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": ARCADE_PROMPT},
                {"role": "user", "content": constraint}
            ],
            temperature=0.9, # High temp for varied creativity
            response_format={"type": "json_object"}
        )
        
        raw = response.choices[0].message.content
        result = json.loads(raw)
        
        return {
            "text": str(result.get("text", "Error generating text.")),
            "isScam": bool(result.get("isScam", force_scam)),
            "explanation": str(result.get("explanation", "No explanation available."))
        }
        
    except Exception as e:
        print(f"⚠️  Groq Arcade Error: {e}")
        return {
            "text": "System error. Could not connect to AI generator.",
            "isScam": False,
            "explanation": "The backend AI service is currently unavailable."
        }
