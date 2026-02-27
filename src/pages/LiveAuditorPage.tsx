/**
 * =============================================================================
 * EcoSim — Live ESG Auditor Dashboard
 * =============================================================================
 * Enterprise-grade real-time compliance monitoring dashboard.
 *
 * This component auto-polls the FastAPI backend every 1 second to display
 * a continuously updating feed of ESG documents audited by the Pathway
 * engine + DistilBERT zero-shot classification model.
 *
 * Architecture Flow:
 *   ./dropzone/*.txt → Pathway → DistilBERT UDF → live_audits.jsonl
 *                                                        ↓
 *                              FastAPI GET /api/live-audits → React (this page)
 *
 * Hackathon: Hack For Green Bharat 🌱
 * USP: Autonomous Continuous ESG Auditing via Pathway LiveAI
 * =============================================================================
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  FolderSearch,
  FileWarning,
  FileBadge,
  Clock,
  Zap,
  BarChart3,
  Eye,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Radio,
  TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ecoApi, type LiveAuditPayload } from "@/lib/api";


// ---------------------------------------------------------------------------
// HELPER: Format ISO timestamp to a human-readable relative/absolute string
// ---------------------------------------------------------------------------
function formatTimestamp(iso: string): string {
  try {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 5) return "Just now";
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    // Fallback to absolute time
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  } catch {
    return "—";
  }
}


// ---------------------------------------------------------------------------
// HELPER: Map classification label to a clean display name
// ---------------------------------------------------------------------------
function classificationLabel(raw: string): string {
  const map: Record<string, string> = {
    greenwashing: "Greenwashing Detected",
    "verified sustainability metrics": "Verified Metrics",
    "vague marketing": "Vague Marketing",
    unknown: "Unclassified",
  };
  return map[raw] ?? raw;
}


// ---------------------------------------------------------------------------
// SUB-COMPONENT: Live Pulse Indicator
// ---------------------------------------------------------------------------
function PulseIndicator({ active }: { active: boolean }) {
  return (
    <span className="relative flex h-3 w-3">
      {active && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      )}
      <span
        className={`relative inline-flex h-3 w-3 rounded-full ${
          active ? "bg-emerald-500" : "bg-muted-foreground/40"
        }`}
      />
    </span>
  );
}


// ---------------------------------------------------------------------------
// SUB-COMPONENT: Stat Card (top metrics row)
// ---------------------------------------------------------------------------
function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <Card className="glass-card border-border/30">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-display font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


// ---------------------------------------------------------------------------
// SUB-COMPONENT: Single Audit Card in the feed
// ---------------------------------------------------------------------------
function AuditCard({ audit, index }: { audit: LiveAuditPayload; index: number }) {
  const isHigh = audit.risk_level === "High";
  const isLow = audit.risk_level === "Low";
  const confidencePct = Math.round(audit.model_confidence * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      layout
    >
      <Card
        className={`glass-card transition-all duration-300 hover:shadow-lg ${
          isHigh
            ? "border-destructive/40 hover:border-destructive/60 shadow-destructive/5"
            : isLow
              ? "border-emerald-500/40 hover:border-emerald-500/60 shadow-emerald-500/5"
              : "border-border/30"
        }`}
      >
        <CardContent className="p-5">
          {/* -------- Row 1: Status + Classification + Timestamp -------- */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              {/* Risk icon */}
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  isHigh
                    ? "bg-destructive/15 text-destructive"
                    : isLow
                      ? "bg-emerald-500/15 text-emerald-500"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isHigh ? (
                  <ShieldAlert className="h-6 w-6" />
                ) : isLow ? (
                  <ShieldCheck className="h-6 w-6" />
                ) : (
                  <Eye className="h-6 w-6" />
                )}
              </div>

              <div>
                <h3 className="font-display font-semibold text-sm">
                  {classificationLabel(audit.primary_classification)}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant={isHigh ? "destructive" : "default"}
                    className={
                      isLow
                        ? "bg-emerald-500/15 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/25"
                        : isHigh
                          ? ""
                          : "bg-muted text-muted-foreground"
                    }
                  >
                    {isHigh && <AlertTriangle className="mr-1 h-3 w-3" />}
                    {isLow && <CheckCircle2 className="mr-1 h-3 w-3" />}
                    {audit.risk_level} Risk
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimestamp(audit.audited_at)}
                  </span>
                </div>
              </div>
            </div>

            {/* Confidence gauge */}
            <div className="text-right shrink-0">
              <div
                className={`text-2xl font-display font-bold ${
                  isHigh ? "text-destructive" : isLow ? "text-emerald-500" : "text-muted-foreground"
                }`}
              >
                {confidencePct}%
              </div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Confidence</p>
            </div>
          </div>

          {/* -------- Row 2: Document preview -------- */}
          <div className="rounded-lg bg-secondary/40 border border-border/30 p-3 mb-4">
            <div className="flex items-center gap-2 mb-1.5">
              <FileWarning className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Document Preview
              </span>
            </div>
            <p className="text-sm text-foreground/80 font-mono leading-relaxed">
              "{audit.filename_hint}"
            </p>
          </div>

          {/* -------- Row 3: Score breakdown bars -------- */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Model Score Breakdown
              </span>
            </div>

            {audit.all_scores &&
              Object.entries(audit.all_scores).map(([label, score]) => {
                const pct = Math.round(score * 100);
                const isGreenwash = label === "greenwashing";
                const isVague = label === "vague marketing";
                const isVerified = label === "verified sustainability metrics";

                return (
                  <div key={label} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        {isGreenwash && <XCircle className="h-3 w-3 text-destructive" />}
                        {isVague && <AlertTriangle className="h-3 w-3 text-eco-amber" />}
                        {isVerified && <CheckCircle2 className="h-3 w-3 text-emerald-500" />}
                        {classificationLabel(label)}
                      </span>
                      <span
                        className={`font-bold font-mono ${
                          isGreenwash
                            ? "text-destructive"
                            : isVague
                              ? "text-eco-amber"
                              : "text-emerald-500"
                        }`}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-secondary/60 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                          isGreenwash
                            ? "bg-destructive"
                            : isVague
                              ? "bg-eco-amber"
                              : "bg-emerald-500"
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}


// ---------------------------------------------------------------------------
// MAIN COMPONENT: LiveAuditorPage
// ---------------------------------------------------------------------------
export default function LiveAuditorPage() {
  const [audits, setAudits] = useState<LiveAuditPayload[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pipelineActive, setPipelineActive] = useState(false);
  const [lastPoll, setLastPoll] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // -----------------------------------------------------------------------
  // POLLING FUNCTION — Fetches latest audits from the FastAPI backend
  // -----------------------------------------------------------------------
  const fetchAudits = useCallback(async () => {
    try {
      const response = await ecoApi.getLiveAudits();
      setAudits(response.audits);
      setTotalCount(response.total_count);
      setPipelineActive(response.pipeline_active);
      setLastPoll(new Date());
      setError(null);
    } catch (err) {
      // Don't clear existing data on transient errors — keep showing last good state
      setError("Backend offline — retrying...");
    }
  }, []);

  // -----------------------------------------------------------------------
  // AUTO-POLLING — useEffect with setInterval at 1000ms (1 second)
  // -----------------------------------------------------------------------
  useEffect(() => {
    // Initial fetch immediately on mount
    fetchAudits();

    // Set up continuous polling every 1 second
    const interval = setInterval(fetchAudits, 1000);

    // Cleanup on unmount — prevents memory leaks
    return () => clearInterval(interval);
  }, [fetchAudits]);

  // -----------------------------------------------------------------------
  // COMPUTED METRICS for the stats row
  // -----------------------------------------------------------------------
  const highRiskCount = audits.filter((a) => a.risk_level === "High").length;
  const lowRiskCount = audits.filter((a) => a.risk_level === "Low").length;
  const avgConfidence =
    audits.length > 0
      ? Math.round((audits.reduce((sum, a) => sum + a.model_confidence, 0) / audits.length) * 100)
      : 0;

  // -----------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------
  return (
    <div className="min-h-screen pt-20 pb-12 eco-grid-bg">
      <div className="container max-w-6xl">
        {/* ============================================================== */}
        {/* HEADER — Title + Live Status Indicator                         */}
        {/* ============================================================== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Live ESG <span className="text-gradient-eco">Auditor</span>
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Autonomous continuous ESG compliance monitoring powered by{" "}
                <span className="text-primary font-semibold">Pathway LiveAI</span> &{" "}
                <span className="text-eco-cyan font-semibold">DistilBERT</span> zero-shot classification.
                Drop ESG reports into <code className="text-xs bg-secondary/60 px-1.5 py-0.5 rounded">/dropzone</code> for
                instant AI auditing.
              </p>
            </div>
          </div>

          {/* ------ Live Status Bar ------ */}
          <div className="glass-card p-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              {/* Left: Status */}
              <div className="flex items-center gap-3">
                <PulseIndicator active={pipelineActive} />
                <div>
                  <p className="text-sm font-semibold flex items-center gap-2">
                    <Radio className="h-3.5 w-3.5 text-primary" />
                    {pipelineActive ? "Pipeline Active" : "Waiting for Pipeline"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {pipelineActive
                      ? "Listening to /dropzone — files are auto-audited in real-time"
                      : "Start live_auditor.py to begin continuous monitoring"}
                  </p>
                </div>
              </div>

              {/* Right: Poll status + error */}
              <div className="flex items-center gap-4">
                {error && (
                  <span className="text-xs text-destructive flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> {error}
                  </span>
                )}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="h-3.5 w-3.5 text-eco-cyan" />
                  Polling every 1s
                  {lastPoll && (
                    <span className="text-[10px] opacity-60">
                      · last: {lastPoll.toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Zap className="h-3 w-3" />
                  Pathway LiveAI
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ============================================================== */}
        {/* STATS ROW — Key metrics at a glance                            */}
        {/* ============================================================== */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            icon={FolderSearch}
            label="Documents Audited"
            value={totalCount}
            color="bg-primary/15 text-primary"
          />
          <StatCard
            icon={ShieldAlert}
            label="High Risk"
            value={highRiskCount}
            color="bg-destructive/15 text-destructive"
          />
          <StatCard
            icon={FileBadge}
            label="Verified / Low Risk"
            value={lowRiskCount}
            color="bg-emerald-500/15 text-emerald-500"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg. Confidence"
            value={`${avgConfidence}%`}
            color="bg-eco-cyan/15 text-eco-cyan"
          />
        </motion.div>

        {/* ============================================================== */}
        {/* AUDIT FEED — Live-updating list of processed documents          */}
        {/* ============================================================== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-primary" />
            <h2 className="font-display text-lg font-semibold">Audit Feed</h2>
            <span className="text-xs text-muted-foreground">(latest first)</span>
          </div>

          {audits.length === 0 ? (
            /* ---------- Empty State ---------- */
            <Card className="glass-card border-border/30">
              <CardContent className="py-16 text-center">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                >
                  <FolderSearch className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                </motion.div>
                <h3 className="font-display text-lg font-semibold mb-2 text-muted-foreground">
                  No Documents Audited Yet
                </h3>
                <p className="text-sm text-muted-foreground/70 max-w-md mx-auto mb-6">
                  The Pathway engine is listening for new files. Drop a <code className="bg-secondary/60 px-1 py-0.5 rounded text-xs">.txt</code> ESG
                  report into the <code className="bg-secondary/60 px-1 py-0.5 rounded text-xs">/backend/dropzone/</code> folder to trigger
                  an instant AI audit.
                </p>
                <div className="inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full bg-secondary/50 text-muted-foreground border border-border/30">
                  <div className="h-2 w-2 rounded-full bg-eco-amber animate-pulse" />
                  Waiting for incoming documents...
                </div>
              </CardContent>
            </Card>
          ) : (
            /* ---------- Audit Cards ---------- */
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {audits.map((audit, idx) => (
                  <AuditCard
                    key={`${audit.audited_at}-${idx}`}
                    audit={audit}
                    index={idx}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>

        {/* ============================================================== */}
        {/* FOOTER — Architecture note for hackathon judges                */}
        {/* ============================================================== */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-12 glass-card p-5"
        >
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-eco-amber mt-0.5 shrink-0" />
            <div>
              <h3 className="font-display text-sm font-semibold mb-1">How It Works — Pathway LiveAI Architecture</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>1.</strong> ESG report (.txt) is dropped into <code className="bg-secondary/60 px-1 rounded">/dropzone</code>{" "}
                → <strong>2.</strong> Pathway <code className="bg-secondary/60 px-1 rounded">pw.io.fs.read</code> instantly
                ingests the file as a reactive stream{" "}
                → <strong>3.</strong> A <code className="bg-secondary/60 px-1 rounded">@pw.udf</code> runs DistilBERT
                zero-shot classification (greenwashing / verified / vague){" "}
                → <strong>4.</strong> Results are written to{" "}
                <code className="bg-secondary/60 px-1 rounded">live_audits.jsonl</code> via{" "}
                <code className="bg-secondary/60 px-1 rounded">pw.io.jsonlines.write</code>{" "}
                → <strong>5.</strong> FastAPI serves the JSONL{" "}
                → <strong>6.</strong> React auto-polls every 1s and renders this live dashboard.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
