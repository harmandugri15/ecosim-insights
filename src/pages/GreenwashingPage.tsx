import { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { analyzeGreenwashing, type GreenwashResult } from "@/lib/simulation";

const sampleTexts = [
  "Our product is 100% sustainable and eco-friendly. We use natural materials and are completely carbon neutral with zero emissions.",
  "This product achieves a 23% reduction in CO₂ emissions compared to our 2020 baseline, verified by ISO 14064-1 certification. Manufacturing uses 45% recycled aluminum sourced from certified suppliers.",
];

export default function GreenwashingPage() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<GreenwashResult | null>(null);

  const analyze = () => {
    if (!text.trim()) return;
    setResult(analyzeGreenwashing(text));
  };

  const riskColor = result?.riskLevel === "High" ? "text-destructive" : result?.riskLevel === "Medium" ? "text-eco-amber" : "text-primary";

  return (
    <div className="min-h-screen pt-20 pb-12 eco-grid-bg">
      <div className="container max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Greenwash <span className="text-gradient-eco">Detector</span>
          </h1>
          <p className="text-muted-foreground mb-8">NLP-powered analysis of sustainability claims. Paste advertisement or ESG report text below.</p>
        </motion.div>

        <div className="glass-card p-6 mb-6">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste product advertisement, ESG report text, or sustainability claims here..."
            className="min-h-[150px] bg-secondary/50 border-border/50 mb-4"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={analyze} disabled={!text.trim()} className="bg-gradient-eco text-primary-foreground font-semibold shadow-glow hover:opacity-90">
              <Search className="mr-2 h-4 w-4" /> Analyze Text
            </Button>
            <div className="flex gap-2">
              {sampleTexts.map((s, i) => (
                <Button key={i} variant="outline" size="sm" onClick={() => setText(s)} className="text-xs">
                  Sample {i + 1}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Score cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="glass-card p-5 text-center">
                <div className="text-sm text-muted-foreground mb-2">Trust Score</div>
                <div className={`font-display text-4xl font-bold ${riskColor}`}>{result.trustScore}</div>
                <div className="text-xs text-muted-foreground mt-1">out of 100</div>
              </div>
              <div className="glass-card p-5 text-center">
                <div className="text-sm text-muted-foreground mb-2">Risk Level</div>
                <div className={`font-display text-2xl font-bold ${riskColor} flex items-center justify-center gap-2`}>
                  {result.riskLevel === "High" ? <AlertTriangle className="h-6 w-6" /> : result.riskLevel === "Medium" ? <AlertTriangle className="h-6 w-6" /> : <CheckCircle className="h-6 w-6" />}
                  {result.riskLevel}
                </div>
              </div>
              <div className="glass-card p-5 text-center">
                <div className="text-sm text-muted-foreground mb-2">Flags Found</div>
                <div className="font-display text-4xl font-bold text-eco-amber">{result.suspiciousPhrases.length}</div>
              </div>
            </div>

            {/* Summary */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" /> Analysis Summary
              </h3>
              <p className="text-muted-foreground">{result.summary}</p>
            </div>

            {/* Suspicious phrases */}
            {result.suspiciousPhrases.length > 0 && (
              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Flagged Phrases</h3>
                <div className="space-y-3">
                  {result.suspiciousPhrases.map((sp, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50">
                      <AlertTriangle className="h-4 w-4 text-eco-amber mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold text-foreground">"{sp.text}"</span>
                        <p className="text-sm text-muted-foreground mt-1">{sp.reason}</p>
                        <div className="mt-1">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-eco-amber/10 text-eco-amber border border-eco-amber/20">
                            Severity: {Math.round(sp.severity * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
