import { useState } from "react";
import { motion } from "framer-motion";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, LineChart, Line,
} from "recharts";
import { GitCompare, Plus, Trash2, Download, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { runSimulation, type SimulationResult, PRODUCT_CATEGORIES, ENERGY_SOURCES } from "@/lib/simulation";

const COLORS = ["hsl(160, 84%, 39%)", "hsl(190, 80%, 45%)", "hsl(45, 93%, 58%)", "hsl(280, 65%, 60%)"];
const CHART_STYLE = { background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 };

const presets = [
  { label: "Smartphone (Solar)", category: "smartphone", energy: "solar", country: "Germany" },
  { label: "Smartphone (Coal)", category: "smartphone", energy: "coal", country: "China" },
  { label: "Laptop (Mixed)", category: "laptop", energy: "mixed", country: "China" },
  { label: "Laptop (Wind)", category: "laptop", energy: "wind", country: "Sweden" },
  { label: "EV (Solar)", category: "electric vehicle", energy: "solar", country: "Germany" },
  { label: "EV (Coal)", category: "electric vehicle", energy: "coal", country: "China" },
  { label: "Clothing (Mixed)", category: "clothing", energy: "mixed", country: "India" },
  { label: "Furniture (Nuclear)", category: "furniture", energy: "nuclear", country: "France" },
  { label: "Appliance (Hydro)", category: "appliance", energy: "hydro", country: "Norway" },
  { label: "Packaging (Gas)", category: "packaging", energy: "natural gas", country: "US" },
];

interface Scenario {
  id: number;
  preset: string;
  category: string;
  energy: string;
  result: SimulationResult;
}

export default function ComparisonPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedPreset, setSelectedPreset] = useState(presets[0].label);

  const addScenario = () => {
    if (scenarios.length >= 4) return;
    const p = presets.find((pr) => pr.label === selectedPreset) || presets[0];
    const result = runSimulation({
      productCategory: p.category,
      materials: [],
      manufacturingCountry: p.country,
      usageCountry: "US",
      energySource: p.energy,
      lifespanYears: 5,
      usageFrequency: "daily",
      transportDistance: 3000,
    });
    setScenarios([...scenarios, {
      id: Date.now(),
      preset: selectedPreset,
      category: p.category,
      energy: p.energy,
      result,
    }]);
  };

  const remove = (id: number) => setScenarios(scenarios.filter((s) => s.id !== id));

  const radarData = [
    { metric: "CO₂ Score" },
    { metric: "Water Score" },
    { metric: "Recycling" },
    { metric: "E-Waste Safety" },
    { metric: "Resource Eff." },
  ].map((d) => {
    const obj: any = { ...d };
    scenarios.forEach((s, i) => {
      const r = s.result;
      obj[`s${i}`] =
        d.metric === "CO₂ Score" ? Math.max(0, 100 - r.totalCO2 / 10)
        : d.metric === "Water Score" ? Math.max(0, 100 - r.waterFootprint / 50)
        : d.metric === "Recycling" ? r.recyclingProbability
        : d.metric === "E-Waste Safety" ? 100 - r.eWasteScore
        : 100 - r.resourceDepletion;
    });
    return obj;
  });

  const barData = scenarios.map((s) => ({
    name: s.preset,
    co2: s.result.totalCO2,
    water: Math.round(s.result.waterFootprint / 10),
    landfill: Math.round(s.result.landfillMass * 10),
    ewaste: s.result.eWasteScore,
  }));

  // Lifecycle comparison data
  const lifecycleComparison = ["Raw Materials", "Manufacturing", "Transportation", "Usage", "Disposal"].map((phase) => {
    const obj: any = { phase };
    scenarios.forEach((s, i) => {
      const p = s.result.lifecyclePhases.find((lp) => lp.phase === phase);
      obj[`s${i}`] = p?.co2 || 0;
    });
    return obj;
  });

  // Timeline comparison
  const maxYears = Math.max(...scenarios.map((s) => s.result.annualBreakdown.length), 0);
  const timelineData = Array.from({ length: maxYears }, (_, i) => {
    const obj: any = { year: i + 1 };
    scenarios.forEach((s, si) => {
      obj[`s${si}`] = s.result.annualBreakdown[i]?.co2 || 0;
    });
    return obj;
  });

  // Find best scenario
  const bestIdx = scenarios.length > 0
    ? scenarios.reduce((best, s, i) => s.result.totalCO2 < scenarios[best].result.totalCO2 ? i : best, 0)
    : -1;

  return (
    <div className="min-h-screen pt-20 pb-12 eco-grid-bg">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Scenario <span className="text-gradient-eco">Comparison</span>
          </h1>
          <p className="text-muted-foreground mb-8">Compare up to 4 product scenarios with side-by-side carbon, water, e-waste, and lifecycle analysis.</p>
        </motion.div>

        {/* Add scenario */}
        <div className="glass-card p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger className="flex-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {presets.map((p) => (
                  <SelectItem key={p.label} value={p.label}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addScenario} disabled={scenarios.length >= 4} className="bg-gradient-eco text-primary-foreground font-semibold shadow-glow hover:opacity-90">
              <Plus className="mr-2 h-4 w-4" /> Add Scenario
            </Button>
          </div>
        </div>

        {/* Scenario cards */}
        {scenarios.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {scenarios.map((s, i) => (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`glass-card p-4 border-t-2 ${bestIdx === i ? "ring-1 ring-primary/30" : ""}`}
                style={{ borderTopColor: COLORS[i] }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-sm font-semibold truncate block" style={{ color: COLORS[i] }}>{s.preset}</span>
                    {bestIdx === i && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">Best</span>
                    )}
                  </div>
                  <button onClick={() => remove(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">CO₂</span><span className="font-semibold">{s.result.totalCO2} kg</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Water</span><span className="font-semibold">{s.result.waterFootprint} L</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Landfill</span><span className="font-semibold">{s.result.landfillMass} kg</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">E-Waste</span>
                    <span className={`font-semibold ${s.result.eWasteRisk === "High" ? "text-destructive" : s.result.eWasteRisk === "Medium" ? "text-eco-amber" : "text-primary"}`}>
                      {s.result.eWasteRisk}
                    </span>
                  </div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Recycle</span><span className="font-semibold">{s.result.recyclingProbability}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Confidence</span><span className="font-semibold">{s.result.confidenceScore}%</span></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Charts */}
        {scenarios.length >= 2 && (
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="ewaste">E-Waste</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="glass-card p-6">
                  <h3 className="font-display text-lg font-semibold mb-4">Sustainability Radar</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="hsl(220, 14%, 18%)" />
                      <PolarAngleAxis dataKey="metric" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(220, 14%, 18%)" fontSize={10} />
                      {scenarios.map((_, i) => (
                        <Radar key={i} name={scenarios[i].preset} dataKey={`s${i}`} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.12} />
                      ))}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
                <div className="glass-card p-6">
                  <h3 className="font-display text-lg font-semibold mb-4">Impact Comparison</h3>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={barData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                      <XAxis dataKey="name" stroke="hsl(220, 10%, 55%)" fontSize={10} angle={-15} textAnchor="end" height={70} />
                      <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                      <Tooltip contentStyle={CHART_STYLE} />
                      <Legend />
                      <Bar dataKey="co2" fill="hsl(160, 84%, 39%)" name="CO₂ (kg)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="water" fill="hsl(190, 80%, 45%)" name="Water (×10L)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="landfill" fill="hsl(45, 93%, 58%)" name="Landfill (×10g)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="ewaste" fill="hsl(280, 65%, 60%)" name="E-Waste Score" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="lifecycle" className="mt-6">
              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Lifecycle Phase Comparison (CO₂ kg)</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={lifecycleComparison}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                    <XAxis dataKey="phase" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <Tooltip contentStyle={CHART_STYLE} />
                    <Legend />
                    {scenarios.map((s, i) => (
                      <Bar key={i} dataKey={`s${i}`} fill={COLORS[i]} name={s.preset} radius={[4, 4, 0, 0]} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-6">
              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Annual CO₂ Emission Timeline</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                    <XAxis dataKey="year" stroke="hsl(220, 10%, 55%)" fontSize={12} tickFormatter={(v) => `Y${v}`} />
                    <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <Tooltip contentStyle={CHART_STYLE} />
                    <Legend />
                    {scenarios.map((s, i) => (
                      <Line key={i} type="monotone" dataKey={`s${i}`} stroke={COLORS[i]} strokeWidth={2} name={s.preset} dot={{ r: 3 }} />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="ewaste" className="mt-6">
              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold mb-6">E-Waste Risk Comparison</h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {scenarios.map((s, i) => (
                    <div key={s.id} className="p-4 rounded-xl bg-secondary/50 border border-border/50" style={{ borderTopColor: COLORS[i], borderTopWidth: 2 }}>
                      <div className="text-sm font-semibold mb-3" style={{ color: COLORS[i] }}>{s.preset}</div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Risk</span>
                          <span className={`font-bold ${s.result.eWasteDetail.risk === "High" ? "text-destructive" : s.result.eWasteDetail.risk === "Medium" ? "text-eco-amber" : "text-primary"}`}>
                            {s.result.eWasteDetail.risk}
                          </span>
                        </div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Score</span><span className="font-bold">{s.result.eWasteDetail.score}/100</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Repairability</span><span className="font-bold">{s.result.eWasteDetail.repairabilityScore}/100</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Battery</span><span className="font-bold">{s.result.eWasteDetail.batteryRisk}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">SW Support</span><span className="font-bold">{s.result.eWasteDetail.softwareSupportYears}y</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Obsolescence</span><span className="font-bold">{s.result.eWasteDetail.obsolescenceRate}%</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        )}

        {scenarios.length === 0 && (
          <div className="glass-card p-12 text-center">
            <GitCompare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Add at least 2 scenarios to start comparing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
