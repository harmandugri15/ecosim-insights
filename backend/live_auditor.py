"""
=============================================================================
EcoSim — Live ESG Auditor Engine (Pathway + DistilBERT)
=============================================================================
This script uses the **Pathway** real-time data framework to continuously
watch a local folder (`./dropzone`) for new `.txt` files (corporate ESG
reports) and instantly classifies them for greenwashing risk using a
Hugging Face DistilBERT zero-shot classification model.

Architecture:
  ./dropzone/*.txt  →  Pathway pw.io.fs.read  →  @pw.udf (DistilBERT)
                                                       ↓
                                              live_audits.jsonl  →  FastAPI

Hackathon: Hack For Green Bharat 🌱
Team USP:  Autonomous Continuous ESG Auditing via Pathway LiveAI
=============================================================================
"""

import pathway as pw
import json
import os
from datetime import datetime, timezone

# ---------------------------------------------------------------------------
# 1. INITIALIZE THE HUGGING FACE DISTILBERT ZERO-SHOT CLASSIFICATION MODEL
# ---------------------------------------------------------------------------
# We load the model once at the module level so every UDF invocation
# re-uses the same warm model — no cold-start penalty per document.
# ---------------------------------------------------------------------------
from transformers import pipeline

print("[EcoSim Auditor] Loading DistilBERT zero-shot classification model...")
classifier = pipeline(
    "zero-shot-classification",
    model="typeform/distilbert-base-uncased-mnli",
)
print("[EcoSim Auditor] Model loaded successfully ✓")

# The three candidate labels our auditor classifies against.
# These map directly to ESG compliance risk categories.
CANDIDATE_LABELS = [
    "greenwashing",                    # High risk — deceptive sustainability claims
    "verified sustainability metrics", # Low risk  — backed by data & certifications
    "vague marketing",                 # High risk — unsubstantiated feel-good language
]

# ---------------------------------------------------------------------------
# 2. DEFINE THE PATHWAY USER-DEFINED FUNCTION (UDF)
# ---------------------------------------------------------------------------
# This is the core AI reasoning step. Pathway calls this function for every
# new document that appears in the dropzone. It runs the DistilBERT model
# and returns a structured JSON string with the classification results.
# ---------------------------------------------------------------------------
@pw.udf
def classify_esg_document(content: str) -> str:
    """
    Pathway UDF: Classifies raw ESG report text using DistilBERT.

    Returns a JSON string containing:
      - filename_hint : first 60 chars of the document (for display)
      - primary_classification : top predicted label
      - model_confidence : confidence score (0-1) of the top prediction
      - risk_level : "High" if greenwashing/vague, "Low" if verified
      - all_scores : full label→score mapping for transparency
      - audited_at : ISO-8601 timestamp of when the audit ran
    """
    # Guard against empty or whitespace-only files
    text = content.strip()
    if not text:
        return json.dumps({
            "filename_hint": "(empty file)",
            "primary_classification": "unknown",
            "model_confidence": 0.0,
            "risk_level": "Unknown",
            "all_scores": {},
            "audited_at": datetime.now(timezone.utc).isoformat(),
        })

    # Run DistilBERT zero-shot classification
    result = classifier(text, CANDIDATE_LABELS)

    # Extract top prediction
    top_label = result["labels"][0]
    top_score = round(result["scores"][0], 4)

    # Build label → score mapping for all candidates
    all_scores = {
        label: round(score, 4)
        for label, score in zip(result["labels"], result["scores"])
    }

    # Determine risk level based on the primary classification
    # "greenwashing" and "vague marketing" are HIGH risk
    # "verified sustainability metrics" is LOW risk
    if top_label in ("greenwashing", "vague marketing"):
        risk_level = "High"
    else:
        risk_level = "Low"

    # Build the structured audit payload
    payload = {
        "filename_hint": text[:60].replace("\n", " ") + ("..." if len(text) > 60 else ""),
        "primary_classification": top_label,
        "model_confidence": top_score,
        "risk_level": risk_level,
        "all_scores": all_scores,
        "audited_at": datetime.now(timezone.utc).isoformat(),
    }

    return json.dumps(payload)


# ---------------------------------------------------------------------------
# 3. PATHWAY PIPELINE — CONTINUOUS FILE INGESTION + AI REASONING
# ---------------------------------------------------------------------------
# pw.io.fs.read watches the ./dropzone directory for any new .txt files.
# Pathway treats the folder as a *streaming source* — any new file that
# appears is instantly ingested as a new row in the reactive table.
# ---------------------------------------------------------------------------

# Resolve the dropzone path relative to this script's location
DROPZONE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "dropzone")
OUTPUT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "live_audits.jsonl")

# Ensure the dropzone directory exists
os.makedirs(DROPZONE_DIR, exist_ok=True)

print(f"[EcoSim Auditor] Watching folder: {DROPZONE_DIR}")
print(f"[EcoSim Auditor] Output file:     {OUTPUT_FILE}")

# Step 3a: Read all .txt files from the dropzone as a streaming table.
# "plaintext_by_file" reads the ENTIRE file content as a single string
# in the `data` column — one row per file. This is the correct format
# for document-level classification (not line-by-line splitting).
# mode="streaming" makes Pathway continuously poll for new files.
documents = pw.io.fs.read(
    path=DROPZONE_DIR,
    format="plaintext_by_file",
    mode="streaming",
    autocommit_duration_ms=1500,      # Pathway checks for new files every 1.5s
)

# Step 3b: Apply the DistilBERT UDF to every document in the stream.
# This is the AI reasoning step — Pathway automatically triggers it
# whenever a new file lands in the dropzone. No manual decode needed:
# "plaintext_by_file" already gives us a UTF-8 string in `data`.
audited = documents.select(
    audit_result=classify_esg_document(pw.this.data),
)

# ---------------------------------------------------------------------------
# 4. OUTPUT — WRITE RESULTS TO JSONLINES FILE (CONTINUOUS)
# ---------------------------------------------------------------------------
# pw.io.jsonlines.write appends each new audit result as a JSON line.
# The FastAPI backend reads this file to serve the React dashboard.
# ---------------------------------------------------------------------------
pw.io.jsonlines.write(audited, OUTPUT_FILE)

# ---------------------------------------------------------------------------
# 5. RUN THE PATHWAY ENGINE
# ---------------------------------------------------------------------------
# pw.run() starts the reactive computation graph. It blocks and
# continuously processes new files as they appear in the dropzone.
# ---------------------------------------------------------------------------
print("[EcoSim Auditor] ════════════════════════════════════════════")
print("[EcoSim Auditor] Pathway engine RUNNING — drop .txt files into ./dropzone/")
print("[EcoSim Auditor] Press Ctrl+C to stop")
print("[EcoSim Auditor] ════════════════════════════════════════════")

pw.run()
