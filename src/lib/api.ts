/**
 * =============================================================================
 * EcoSim — API Client Layer
 * =============================================================================
 * Centralized Axios-based API client for communicating with the FastAPI backend.
 * All API functions are grouped under the `ecoApi` namespace for clean imports.
 *
 * The backend serves live ESG audit data produced by the Pathway engine.
 * =============================================================================
 */

import axios from "axios";

// ---------------------------------------------------------------------------
// AXIOS INSTANCE — configured to talk to the FastAPI backend
// ---------------------------------------------------------------------------
const api = axios.create({
  baseURL: "http://localhost:8000",   // FastAPI default (uvicorn)
  timeout: 5000,                      // 5s timeout — audits should be instant
  headers: { "Content-Type": "application/json" },
});


// ---------------------------------------------------------------------------
// TYPE DEFINITIONS — LiveAuditPayload
// ---------------------------------------------------------------------------
// Mirrors the JSON structure produced by the Pathway DistilBERT UDF.
// Each object represents one audited ESG document.
// ---------------------------------------------------------------------------

/** Individual score mapping for all candidate labels */
export interface AllScores {
  greenwashing: number;
  "verified sustainability metrics": number;
  "vague marketing": number;
}

/** A single audited ESG document returned by the Pathway pipeline */
export interface LiveAuditPayload {
  /** First ~60 chars of the document text (preview) */
  filename_hint: string;
  /** The top predicted label from DistilBERT zero-shot classification */
  primary_classification: string;
  /** Confidence score (0–1) for the primary classification */
  model_confidence: number;
  /** "High" for greenwashing/vague marketing, "Low" for verified metrics */
  risk_level: "High" | "Low" | "Unknown";
  /** Full label → confidence score breakdown */
  all_scores: AllScores;
  /** ISO-8601 timestamp of when the Pathway UDF processed this document */
  audited_at: string;
}

/** API response envelope from GET /api/live-audits */
export interface LiveAuditsResponse {
  audits: LiveAuditPayload[];
  total_count: number;
  pipeline_active: boolean;
}


// ---------------------------------------------------------------------------
// API FUNCTIONS
// ---------------------------------------------------------------------------

export const ecoApi = {
  /**
   * GET /api/live-audits
   *
   * Fetches the latest ESG audit results from the Pathway pipeline.
   * The React dashboard polls this endpoint every 1 second to display
   * a continuously updating feed of audited documents.
   *
   * Returns the full list of audits (latest first), total count,
   * and whether the Pathway pipeline output file exists.
   */
  getLiveAudits: async (): Promise<LiveAuditsResponse> => {
    const { data } = await api.get<LiveAuditsResponse>("/api/live-audits");
    return data;
  },

  /**
   * GET /api/health
   *
   * Simple health check to verify the FastAPI server is running
   * and the Pathway output file is accessible.
   */
  getHealth: async (): Promise<{ status: string; pathway_output_exists: boolean }> => {
    const { data } = await api.get("/api/health");
    return data;
  },
};

export default ecoApi;
