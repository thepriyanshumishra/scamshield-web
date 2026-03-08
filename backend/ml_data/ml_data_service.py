"""
ml_data_service.py — ScamShield Data Collection Service

This module manages the SQLite database that powers ScamShield's
AI data flywheel. Every message scanned by the app is stored here
(without any personal user data), creating a high-quality dataset
for future model retraining.

PRIVACY GUARANTEE:
- We only store the message text (the scam content itself).
- No user IPs, emails, names, or device info are ever stored.
- This database is gitignored and stays on the server only.

Data flow:
  User scans message
      → save_initial_prediction()   [called by main.py after every analysis]
      → User gives feedback
      → update_feedback()           [called by /feedback endpoint]
      → If disagreed → Groq re-evaluates
      → update_final_label()        [updates the ground-truth label]

Over time this builds a self-improving, human-verified training dataset.
"""

import json
import os
import re
import sqlite3
from datetime import datetime
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────
_HERE = Path(__file__).parent
DB_PATH = _HERE / "training_data.db"


# ── Database initialisation ────────────────────────────────────────────────

def init_db() -> None:
    """
    Create the training_data.db and messages table if they don't exist.
    Safe to call multiple times (uses CREATE TABLE IF NOT EXISTS).
    Called automatically at FastAPI startup.
    """
    with _connect() as conn:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS messages (
                id                    INTEGER PRIMARY KEY AUTOINCREMENT,

                -- The actual scanned content
                message_text          TEXT NOT NULL,
                normalized_text       TEXT NOT NULL,

                -- Local DistilBERT model output
                local_model_prediction TEXT,   -- "SCAM" or "SAFE"
                local_model_score      REAL,   -- 0.0 – 1.0

                -- Groq LLM output
                groq_prediction       TEXT,    -- "scam" or "safe" or "normal message"

                -- Merged final label (ground truth for training)
                final_label           TEXT,    -- "scam" | "safe" | "uncertain"

                -- Groq-generated explanations
                red_flags             TEXT,    -- JSON array string
                psychology_tags       TEXT,    -- Plain text
                advice                TEXT,

                -- User feedback
                user_feedback         TEXT DEFAULT 'none',  -- "agree" | "disagree" | "none"
                user_feedback_reason  TEXT DEFAULT '',

                -- Metadata
                created_at            TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_messages_normalized
            ON messages (normalized_text);
        """)
    print(f"✅ ML data DB ready at {DB_PATH}")


# ── Core data operations ───────────────────────────────────────────────────

def save_initial_prediction(
    message_text: str,
    local_model_prediction: str | None,
    local_model_score: float | None,
    groq_prediction: str,
    final_label: str,
    red_flags: list[str],
    psychology_tags: str,
    advice: str,
) -> int | None:
    """
    Save a new analysis result to the training database.

    Called automatically after every /analyze-text, /analyze-image,
    and /analyze-url request. Skips duplicates (same normalized text).

    Returns the new row ID, or None if the message was a duplicate.
    """
    norm = _normalize(message_text)

    # Skip empty or very short messages
    if len(norm) < 10:
        return None

    # Dedup: don't store the same message twice
    if _is_duplicate(norm):
        return None

    try:
        with _connect() as conn:
            cursor = conn.execute(
                """
                INSERT INTO messages (
                    message_text, normalized_text,
                    local_model_prediction, local_model_score,
                    groq_prediction, final_label,
                    red_flags, psychology_tags, advice,
                    user_feedback, user_feedback_reason
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'none', '')
                """,
                (
                    message_text.strip(),
                    norm,
                    local_model_prediction,
                    local_model_score,
                    groq_prediction,
                    final_label,
                    json.dumps(red_flags),
                    psychology_tags,
                    advice,
                ),
            )
            row_id = cursor.lastrowid
        return row_id
    except Exception as e:
        print(f"⚠️  ml_data_service: Failed to save prediction: {e}")
        return None


def update_feedback(
    message_text: str,
    feedback: str,           # "agree" | "disagree"
    reason: str = "",
) -> bool:
    """
    Record a user's thumbs-up / thumbs-down for an analysis.

    Returns True if the row was found and updated, False otherwise.
    """
    norm = _normalize(message_text)
    try:
        with _connect() as conn:
            result = conn.execute(
                """
                UPDATE messages
                SET user_feedback = ?, user_feedback_reason = ?
                WHERE normalized_text = ?
                """,
                (feedback, reason.strip(), norm),
            )
            return result.rowcount > 0
    except Exception as e:
        print(f"⚠️  ml_data_service: Failed to update feedback: {e}")
        return False


def update_final_label(message_text: str, new_label: str) -> bool:
    """
    Override the final_label for a message.

    Called when a user disagrees and the Groq second-review changes
    the verdict. This corrected label is HIGH-QUALITY training data.
    """
    norm = _normalize(message_text)
    try:
        with _connect() as conn:
            result = conn.execute(
                "UPDATE messages SET final_label = ? WHERE normalized_text = ?",
                (new_label, norm),
            )
            return result.rowcount > 0
    except Exception as e:
        print(f"⚠️  ml_data_service: Failed to update final_label: {e}")
        return False


def get_stats() -> dict:
    """Return basic statistics about the collected dataset."""
    try:
        with _connect() as conn:
            total = conn.execute("SELECT COUNT(*) FROM messages").fetchone()[0]
            scam  = conn.execute("SELECT COUNT(*) FROM messages WHERE final_label='scam'").fetchone()[0]
            safe  = conn.execute("SELECT COUNT(*) FROM messages WHERE final_label='safe'").fetchone()[0]
            agreed    = conn.execute("SELECT COUNT(*) FROM messages WHERE user_feedback='agree'").fetchone()[0]
            disagreed = conn.execute("SELECT COUNT(*) FROM messages WHERE user_feedback='disagree'").fetchone()[0]
        return {
            "total": total,
            "scam": scam,
            "safe": safe,
            "uncertain": total - scam - safe,
            "user_agreed": agreed,
            "user_disagreed": disagreed,
        }
    except Exception as e:
        print(f"⚠️  ml_data_service: Failed to get stats: {e}")
        return {}


# ── Internal helpers ───────────────────────────────────────────────────────

def _connect() -> sqlite3.Connection:
    """Open a connection to the SQLite database."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def _normalize(text: str) -> str:
    """
    Normalize a message for deduplication.
    Lowercases, strips punctuation, and collapses whitespace.
    """
    text = text.lower()
    text = re.sub(r"[^\w\s]", " ", text)   # remove punctuation
    text = re.sub(r"\s+", " ", text)        # collapse whitespace
    return text.strip()


def _is_duplicate(normalized_text: str) -> bool:
    """Check if the normalized text already exists in the database."""
    try:
        with _connect() as conn:
            row = conn.execute(
                "SELECT 1 FROM messages WHERE normalized_text = ? LIMIT 1",
                (normalized_text,),
            ).fetchone()
            return row is not None
    except Exception:
        return False
