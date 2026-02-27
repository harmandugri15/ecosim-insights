"""
=============================================================================
EcoSim — FastAPI Backend Server
=============================================================================
Serves the React frontend with live ESG audit data produced by the Pathway
engine (live_auditor.py). The Pathway engine writes results to a JSONL file;
this API reads and serves them in real-time.

Endpoints:
  GET /api/live-audits  — Returns processed ESG audit results (latest first)
  GET /api/health       — Health check endpoint

Hackathon: Hack For Green Bharat 🌱
=============================================================================
"""

import json
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# ---------------------------------------------------------------------------
# APP INITIALIZATION
# ---------------------------------------------------------------------------
app = FastAPI(
    title="EcoSim API",
    description="Autonomous Continuous ESG Auditing — Powered by Pathway & DistilBERT",
    version="1.0.0",
)

# Enable CORS so the React frontend (Vite dev server on :8080) can call us
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # In production, lock this down to your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to the JSONL file that the Pathway engine writes to
AUDIT_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "live_audits.jsonl")


# ---------------------------------------------------------------------------
# HEALTH CHECK
# ---------------------------------------------------------------------------
@app.get("/api/health")
def health_check():
    """Simple health check endpoint for monitoring and uptime verification."""
    return {
        "status": "healthy",
        "service": "ecosim-api",
        "pathway_output_exists": os.path.exists(AUDIT_FILE),
    }


# ---------------------------------------------------------------------------
# LIVE AUDITS ENDPOINT
# ---------------------------------------------------------------------------
@app.get("/api/live-audits")
def get_live_audits():
    """
    Reads the live_audits.jsonl file produced by the Pathway engine and
    returns all processed ESG audit results, ordered latest-first.

    The JSONL file contains one JSON object per line. Each line is the
    output of the Pathway UDF (DistilBERT classification result).

    Returns:
        {
            "audits": [ ... ],      // List of audit result objects
            "total_count": int,     // Total number of audited documents
            "pipeline_active": bool // Whether the Pathway output file exists
        }
    """
    # If the Pathway engine hasn't produced any output yet, return empty
    if not os.path.exists(AUDIT_FILE):
        return {
            "audits": [],
            "total_count": 0,
            "pipeline_active": False,
        }

    audits = []

    # ---------------------------------------------------------------------------
    # SAFE JSONL PARSING — Pathway Output Format
    # ---------------------------------------------------------------------------
    # Pathway's jsonlines writer outputs each row with TWO extra metadata fields:
    #   {"audit_result": "<json string>", "diff": 1, "time": 1707987230734}
    #
    # CRITICAL: "diff" indicates the row operation:
    #   diff=1  → insertion (new audit result — we KEEP these)
    #   diff=-1 → deletion/retraction (Pathway retracting a result — we SKIP)
    #
    # The "audit_result" value is our UDF's JSON string output, which we
    # double-parse to extract the structured audit payload.
    # ---------------------------------------------------------------------------
    try:
        with open(AUDIT_FILE, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    # Parse the Pathway JSONL row
                    row = json.loads(line)

                    # FILTER: Only include insertions (diff=1), skip retractions
                    # This is critical for Pathway's streaming semantics —
                    # without this filter, retracted rows appear as phantom audits
                    if row.get("diff", 1) != 1:
                        continue

                    # Extract the inner audit payload from our UDF output
                    inner = row.get("audit_result", row)

                    # If the inner value is a JSON string, parse it
                    if isinstance(inner, str):
                        audit_data = json.loads(inner)
                    else:
                        audit_data = inner

                    audits.append(audit_data)

                except (json.JSONDecodeError, TypeError, KeyError):
                    # Skip malformed lines — don't crash the API
                    continue

    except IOError:
        # File read error — return empty gracefully
        return {
            "audits": [],
            "total_count": 0,
            "pipeline_active": False,
        }

    # Return results in reverse order (latest audit first) so the
    # React dashboard shows the most recent document at the top
    audits.reverse()

    return {
        "audits": audits,
        "total_count": len(audits),
        "pipeline_active": True,
    }
