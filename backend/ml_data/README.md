# 🧠 ScamShield — ML Data Pipeline

This folder powers ScamShield's **AI data flywheel** — a self-improving system that collects real-world scam data and user feedback to continuously retrain our detection models.

---

## 📁 Files

| File | Purpose |
|------|---------|
| `training_data.db` | SQLite database — every scanned message is stored here |
| `ml_data_service.py` | DB helper functions (save, update, dedup) |
| `dataset_export.py` | CLI script to export training datasets |
| `exports/` | Exported JSONL files for model retraining |

---

## 🔄 How It Works

```
User scans a message
       ↓
DistilBERT + Groq analyze it
       ↓
save_initial_prediction() → stored in training_data.db
       ↓
User gives feedback (👍 or 👎)
       ↓
If 👎 → Groq second-review re-evaluates
       ↓
Corrected label → high-quality training row
       ↓
Export → retrain DistilBERT → remove Groq dependency
```

---

## 🔒 Privacy Policy

- **We NEVER store** user names, emails, IPs, or device info.
- **We ONLY store** the text of the scanned message (the scam content).
- The database is excluded from git (see `.gitignore`) and **never pushed to GitHub**.
- Data is used exclusively to improve ScamShield's AI models.

---

## 📤 Exporting Datasets

```bash
cd backend
venv/bin/python ml_data/dataset_export.py
```

This generates in `exports/`:

### `classifier_dataset.jsonl`
For retraining the DistilBERT scam classifier:
```json
{"text": "Your SBI account will be blocked...", "label": 1}
{"text": "Hey, are you free for lunch?", "label": 0}
```
- `label: 1` = scam
- `label: 0` = safe

### `explanation_dataset.jsonl`
For training a future mini-LLM that generates explanations:
```json
{
  "input": "Message: Your account is blocked...",
  "output": "Verdict: SCAM\nRed Flags: urgency, fake link\nAdvice: Do not click."
}
```

---

## 🎯 Long-Term Goal

| Phase | Goal |
|-------|------|
| **Now** | Collect real-world scam data + user feedback |
| **Phase 2** | Retrain DistilBERT on collected data (higher accuracy) |
| **Phase 3** | Train mini-LLM on explanation dataset (replace Groq) |
| **Phase 4** | Fully local, self-improving, zero-API-cost ScamShield |
