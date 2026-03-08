# 🛡️ ScamShield — DistilBERT ML Training Pipeline

This folder contains everything needed to **fine-tune a DistilBERT model** for scam/spam detection using Google Colab — no local GPU required.

---

## 📂 Files

| File | Description |
|------|-------------|
| `train_distilbert.ipynb` | Main training notebook (run on Colab) |
| `requirements.txt` | Python packages used during training |
| `README.md` | This file |

---

## 🚀 How to Run on Google Colab

### Step 1 — Open the Notebook

Go to [Google Colab](https://colab.research.google.com/) and choose one of:

**Option A — Upload from your computer:**
> File → Upload notebook → select `train_distilbert.ipynb`

**Option B — Open from GitHub:**
> File → Open notebook → GitHub tab → paste the repo URL and select the notebook

---

### Step 2 — Enable GPU (Important!)

DistilBERT training requires a GPU. In Colab:

> **Runtime → Change runtime type → Hardware accelerator → T4 GPU → Save**

You should see a green RAM/Disk indicator in the top-right corner once connected.

---

### Step 3 — Run All Cells

> **Runtime → Run all**

Or press `Shift + Enter` to run each cell one by one. Read the Markdown explanations between cells to understand what each step does.

The notebook will:
1. Install all required packages
2. Mount your Google Drive
3. Download and merge 3 datasets (SMS Spam Collection, HuggingFace sms_spam, synthetic scams)
4. Clean and preprocess the data
5. Tokenize using DistilBERT's tokenizer
6. Fine-tune the model for 3 epochs
7. Evaluate on the test set (accuracy, F1, confusion matrix)
8. Save the trained model to your Google Drive

---

### Step 4 — Check Your Google Drive

After training completes, your model will be saved to:

```
My Drive/
└── scamshield-distilbert/
    ├── config.json
    ├── model.safetensors
    ├── tokenizer_config.json
    ├── tokenizer.json
    └── vocab.txt
```

---

## 📥 How to Download the Trained Model

**From Colab:**
```python
from google.colab import files
import shutil

shutil.make_archive("scamshield-distilbert", "zip", "/content/drive/MyDrive/scamshield-distilbert")
files.download("scamshield-distilbert.zip")
```

**From Google Drive UI:**
1. Open [drive.google.com](https://drive.google.com)
2. Find the `scamshield-distilbert` folder
3. Right-click → Download

---

## 🔄 How to Retrain on New Data

1. Open the notebook in Colab
2. Scroll to **Cell 10 — Synthetic Data** and add your new messages to the `synthetic_scams` list, or load a new CSV
3. Change the save path in the last cell if you want a separate version:
   ```python
   SAVE_PATH = "/content/drive/MyDrive/scamshield-distilbert-v2"
   ```
4. Run all cells again

---

## 🧠 What is DistilBERT? (Quick Primer)

**BERT** (Bidirectional Encoder Representations from Transformers) is a language model pre-trained on massive text corpora. It understands context from *both directions* in a sentence.

**DistilBERT** is a smaller, faster version — 40% smaller, 60% faster, retaining 97% of BERT's performance. This makes it ideal for fine-tuning on specific tasks like scam detection without needing enormous compute.

**Fine-tuning** means we take this pre-trained model and train it for a few more epochs on our specific dataset (SMS scam/spam messages), teaching it to classify text as *safe (0)* or *scam (1)*.

---

## 📊 Expected Results

| Metric | Expected Value |
|--------|---------------|
| Accuracy | > 97% |
| F1 Score | > 0.96 |
| Training Time (T4 GPU) | ~8–12 minutes |

---

## 🐛 Common Issues

| Problem | Fix |
|---------|-----|
| `CUDA out of memory` | Reduce batch size from 16 to 8 in the TrainingArguments cell |
| `Drive not mounted` | Re-run the "Mount Google Drive" cell and authorize again |
| Slow training | Make sure GPU is enabled (Step 2 above) |
| `datasets` not found | Re-run the `!pip install` cell |
