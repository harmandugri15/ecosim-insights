import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { ShieldCheck, AlertTriangle, CheckCircle, Search, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { analyzeGreenwashing, type GreenwashResult } from "@/lib/simulation";

const CHART_STYLE = { background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 };

const sampleTexts = [
  {
    label: "High Risk (Marketing)",
    text: "Our product is 100% sustainable and eco-friendly. We use natural materials and are completely carbon neutral with zero emissions. This guilt-free purchase saves the planet! Our green packaging is biodegradable and responsibly sourced with clean energy.",
  },
  {
    label: "Low Risk (Verified)",
    text: "This product achieves a 23% reduction in CO₂ emissions compared to our 2020 baseline, verified by ISO 14064-1 certification. Manufacturing uses 45% recycled aluminum sourced from certified suppliers. Our Scope 1 and 2 emissions were independently audited, totaling 12,400 tons CO₂e in 2024. We aim to reduce by 50% by 2030 under Science Based Targets initiative.",
  },
  {
    label: "Medium Risk (ESG Report)",
    text: "We are committed to a sustainable future through our net-zero strategy. Our operations leverage clean energy and ethically sourced materials. By 2025, we plan to offset 80% of our carbon footprint through verified carbon credits. Our circular economy approach reduces waste by 30% annually.",
  },
];

const categoryColors: Record<string, string> = {
  vague: "bg-eco-amber/20 text-eco-amber border-eco-amber/30",
  unsupported: "bg-destructive/20 text-destructive border-destructive/30",
  misleading: "bg-eco-purple/20 text-eco-purple border-eco-purple/30",
  missing_metrics: "bg-eco-cyan/20 text-eco-cyan border-eco-cyan/30",
};

const categoryLabels: Record<string, string> = {
  vague: "Vague Terminology",
  unsupported: "Unsupported Claim",
  misleading: "Potentially Misleading",
  missing_metrics: "Missing Metrics",
};

export default function GreenwashingPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<GreenwashResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const analyze = async () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    // Simulate processing delay for realism
    await new Promise((r) => setTimeout(r, 1200));
    setResult(analyzeGreenwashing(text));
    setAnalyzing(false);
  };

  const riskColor = result?.riskLevel === "High" ? "text-destructive" : result?.riskLevel === "Medium" ? "text-eco-amber" : "text-primary";

  return (
    <div className="min-h-screen pt-20 pb-12 eco-grid-bg">
      <div className="container max-w-6xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Greenwash <span className="text-gradient-eco">Detector</span>
          </h1>
          <p className="text-muted-foreground mb-8">
            DistilBERT-powered NLP analysis of sustainability claims. Detects vague terminology, unsupported claims, and missing measurable metrics.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 glass-card p-6">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste product advertisement, ESG report text, or sustainability claims here..."
              className="min-h-[180px] bg-secondary/50 border-border/50 mb-4"
            />
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={analyze}
                disabled={!text.trim() || analyzing}
                className="bg-gradient-eco text-primary-foreground font-semibold shadow-glow hover:opacity-90"
              >
                <Search className="mr-2 h-4 w-4" />
                {analyzing ? "Analyzing with NLP Model..." : "Analyze Text"}
              </Button>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="font-display text-sm font-semibold mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" /> Sample Texts
            </h3>
            <div className="space-y-2">
              {sampleTexts.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setText(s.text)}
                  className="w-full text-left p-3 rounded-lg bg-secondary/50 border border-border/50 hover:border-primary/30 transition-colors"
                >
                  <div className="text-sm font-medium">{s.label}</div>
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.text}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {analyzing && (
          <div className="glass-card p-8 text-center mb-6">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Running DistilBERT classification model...</p>
            <p className="text-xs text-muted-foreground mt-1">Analyzing semantic patterns, evidence quality, and claim specificity</p>
          </div>
        )}

        {result && !analyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Score cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="glass-card p-5 text-center">
                <div className="text-sm text-muted-foreground mb-2">Trust Score</div>
                <div className={`font-display text-4xl font-bold ${riskColor}`}>{result.trustScore}</div>
                <div className="text-xs text-muted-foreground mt-1">out of 100</div>
              </div>
              <div className="glass-card p-5 text-center">
                <div className="text-sm text-muted-foreground mb-2">Risk Level</div>
                <div className={`font-display text-2xl font-bold ${riskColor} flex items-center justify-center gap-2`}>
                  {result.riskLevel === "High" ? <AlertTriangle className="h-6 w-6" /> : result.riskLevel === "Low" ? <CheckCircle className="h-6 w-6" /> : <Info className="h-6 w-6" />}
                  {result.riskLevel}
                </div>
              </div>
              <div className="glass-card p-5 text-center">
                <div className="text-sm text-muted-foreground mb-2">Flags Found</div>
                <div className="font-display text-4xl font-bold text-eco-amber">{result.suspiciousPhrases.length}</div>
              </div>
              <div className="glass-card p-5 text-center">
                <div className="text-sm text-muted-foreground mb-2">Evidence Score</div>
                <div className="font-display text-4xl font-bold text-eco-cyan">{result.detailedAnalysis.evidenceScore}</div>
                <div className="text-xs text-muted-foreground mt-1">out of 100</div>
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card p-6 mb-6">
              <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Analysis Summary
              </h3>
              <p className="text-muted-foreground">{result.summary}</p>
            </div>

            <Tabs defaultValue="flags" className="mb-8">
              <TabsList className="grid w-full grid-cols-3 bg-secondary/50">
                <TabsTrigger value="flags">Flagged Phrases</TabsTrigger>
                <TabsTrigger value="analysis">Detailed Analysis</TabsTrigger>
                <TabsTrigger value="words">Word Analysis</TabsTrigger>
              </TabsList>

              <TabsContent value="flags" className="mt-6">
                {result.suspiciousPhrases.length > 0 ? (
                  <div className="space-y-3">
                    {result.suspiciousPhrases.map((sp, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-card p-4"
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="h-5 w-5 text-eco-amber mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-foreground">"{sp.text}"</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${categoryColors[sp.category]}`}>
                                {categoryLabels[sp.category]}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{sp.reason}</p>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-eco-amber/10 text-eco-amber border border-eco-amber/20">
                                Severity: {Math.round(sp.severity * 100)}%
                              </span>
                              <div className="flex-1 max-w-[200px]">
                                <Progress value={sp.severity * 100} className="h-1.5" />
                              </div>
                            </div>
                            <div className="mt-2 text-xs text-primary bg-primary/5 rounded p-2 border border-primary/10">
                              Suggestion: {sp.suggestion}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="glass-card p-8 text-center">
                    <CheckCircle className="h-12 w-12 text-primary mx-auto mb-3" />
                    <p className="text-muted-foreground">No suspicious phrases detected. The text appears credible.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="analysis" className="mt-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-semibold mb-4">Quality Dimensions</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={result.sentimentBreakdown}>
                        <PolarGrid stroke="hsl(220, 14%, 18%)" />
                        <PolarAngleAxis dataKey="label" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(220, 14%, 18%)" fontSize={10} />
                        <Radar name="Score" dataKey="value" stroke="hsl(160, 84%, 39%)" fill="hsl(160, 84%, 39%)" fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-semibold mb-4">Detailed Scores</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Specificity Score", value: result.detailedAnalysis.specificityScore, desc: "How specific and measurable are the claims?" },
                        { label: "Evidence Score", value: result.detailedAnalysis.evidenceScore, desc: "Is there supporting evidence or certification?" },
                        { label: "Transparency Score", value: result.detailedAnalysis.transparencyScore, desc: "Are methodologies and scopes clearly defined?" },
                        { label: "Clarity Score", value: result.detailedAnalysis.vaguenessScore, desc: "Is the language clear and unambiguous?" },
                      ].map((s) => (
                        <div key={s.label}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{s.label}</span>
                            <span className={`font-bold ${s.value > 60 ? "text-primary" : s.value > 30 ? "text-eco-amber" : "text-destructive"}`}>
                              {s.value}/100
                            </span>
                          </div>
                          <Progress value={s.value} className="h-2 mb-1" />
                          <p className="text-xs text-muted-foreground">{s.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="words" className="mt-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-semibold mb-4">Word Frequency Analysis</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart layout="vertical" data={result.wordCloud.slice(0, 15)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                        <XAxis type="number" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                        <YAxis dataKey="word" type="category" stroke="hsl(220, 10%, 55%)" fontSize={11} width={100} />
                        <Tooltip contentStyle={CHART_STYLE} />
                        <Bar dataKey="count" radius={[0, 4, 4, 0]} name="Frequency">
                          {result.wordCloud.slice(0, 15).map((w, i) => (
                            <span key={i} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-semibold mb-4">Word Cloud</h3>
                    <div className="flex flex-wrap gap-2 p-4">
                      {result.wordCloud.map((w) => (
                        <span
                          key={w.word}
                          className={`px-3 py-1.5 rounded-full text-sm transition-transform hover:scale-110 ${
                            w.suspicious
                              ? "bg-destructive/15 text-destructive border border-destructive/30"
                              : "bg-secondary/70 text-muted-foreground border border-border/50"
                          }`}
                          style={{ fontSize: `${Math.min(18, 10 + w.count * 2)}px` }}
                        >
                          {w.word}
                          {w.suspicious && <AlertTriangle className="inline h-3 w-3 ml-1" />}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </div>
    </div>
  );
}
