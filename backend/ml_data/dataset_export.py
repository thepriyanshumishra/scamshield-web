"""
dataset_export.py — ScamShield Training Dataset Exporter

Reads from training_data.db and generates two JSONL files:

1. classifier_dataset.jsonl   → for future DistilBERT retraining
   Format: {"text": "...", "label": 0 or 1}
   Only includes rows with high-confidence labels (scam / safe).

2. explanation_dataset.jsonl  → for future mini-LLM explanation model
   Format: {"input": "Message: ...", "output": "...explanation + advice"}
   Includes all rows with non-empty advice.

Usage:
    cd backend
    venv/bin/python ml_data/dataset_export.py

Both files are saved in: backend/ml_data/exports/
"""

import json
import os
import sqlite3
from datetime import datetime
from pathlib import Path

# ── Paths ──────────────────────────────────────────────────────────────────
_HERE     = Path(__file__).parent
DB_PATH   = _HERE / "training_data.db"
EXPORT_DIR = _HERE / "exports"


def export_datasets() -> dict:
    """
    Export both JSONL datasets from the training DB.
    Returns a summary dict with row counts.
    """
    EXPORT_DIR.mkdir(exist_ok=True)

    if not DB_PATH.exists():
        print(f"❌ Database not found at {DB_PATH}")
        print("   Run the backend server first to auto-create the DB.")
        return {}

    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row

    # ── 1. Classifier dataset ─────────────────────────────────────────────
    classifier_path = EXPORT_DIR / "classifier_dataset.jsonl"
    classifier_count = 0

    rows = conn.execute(
        """
        SELECT message_text, final_label
        FROM messages
        WHERE final_label IN ('scam', 'safe')
        ORDER BY created_at ASC
        """
    ).fetchall()

    with open(classifier_path, "w", encoding="utf-8") as f:
        for row in rows:
            label = 1 if row["final_label"] == "scam" else 0
            record = {
                "text":  row["message_text"].strip(),
                "label": label,
            }
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
            classifier_count += 1

    print(f"✅ Classifier dataset → {classifier_path}")
    print(f"   {classifier_count} rows  (scam=1 / safe=0)")

    # ── 2. Explanation dataset ────────────────────────────────────────────
    explanation_path = EXPORT_DIR / "explanation_dataset.jsonl"
    explanation_count = 0

    rows = conn.execute(
        """
        SELECT message_text, final_label, red_flags, psychology_tags, advice
        FROM messages
        WHERE advice IS NOT NULL AND advice != ''
        ORDER BY created_at ASC
        """
    ).fetchall()

    with open(explanation_path, "w", encoding="utf-8") as f:
        for row in rows:
            # Build the input prompt
            input_text = f"Message: {row['message_text'].strip()}"

            # Build the expected output
            verdict = row["final_label"].upper() if row["final_label"] else "UNKNOWN"

            try:
                flags = json.loads(row["red_flags"] or "[]")
                flags_text = ", ".join(flags) if flags else "None"
            except Exception:
                flags_text = row["red_flags"] or "None"

            output_text = (
                f"Verdict: {verdict}\n"
                f"Red Flags: {flags_text}\n"
                f"Psychology: {row['psychology_tags'] or 'N/A'}\n"
                f"Advice: {row['advice']}"
            )

            record = {
                "input":  input_text,
                "output": output_text,
            }
            f.write(json.dumps(record, ensure_ascii=False) + "\n")
            explanation_count += 1

    conn.close()

    print(f"✅ Explanation dataset → {explanation_path}")
    print(f"   {explanation_count} rows")

    # ── Summary ────────────────────────────────────────────────────────────
    summary = {
        "exported_at":       datetime.now().isoformat(),
        "classifier_rows":   classifier_count,
        "explanation_rows":  explanation_count,
        "classifier_file":   str(classifier_path),
        "explanation_file":  str(explanation_path),
    }

    summary_path = EXPORT_DIR / "export_summary.json"
    with open(summary_path, "w") as f:
        json.dump(summary, f, indent=2)

    print(f"\n📋 Export summary → {summary_path}")
    return summary


if __name__ == "__main__":
    print("🚀 ScamShield Dataset Exporter")
    print("=" * 40)
    result = export_datasets()
    if result:
        print("\n✅ Export complete!")
        print(f"   Classifier rows:  {result['classifier_rows']}")
        print(f"   Explanation rows: {result['explanation_rows']}")
