import { useState } from "react";
import { motion } from "framer-motion";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { GitCompare, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { runSimulation, type SimulationResult } from "@/lib/simulation";

const presets = [
  { label: "Smartphone (Solar)", category: "smartphone", energy: "solar" },
  { label: "Smartphone (Coal)", category: "smartphone", energy: "coal" },
  { label: "Laptop (Mixed)", category: "laptop", energy: "mixed" },
  { label: "Laptop (Wind)", category: "laptop", energy: "wind" },
  { label: "EV (Solar)", category: "electric vehicle", energy: "solar" },
  { label: "EV (Coal)", category: "electric vehicle", energy: "coal" },
  { label: "Clothing (Mixed)", category: "clothing", energy: "mixed" },
  { label: "Furniture (Nuclear)", category: "furniture", energy: "nuclear" },
];

const COLORS = ["hsl(160, 84%, 39%)", "hsl(190, 80%, 45%)", "hsl(45, 93%, 58%)", "hsl(280, 65%, 60%)"];

interface Scenario {
  id: number;
  preset: string;
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
      materials: [{ name: "Mixed", percentage: 100 }],
      manufacturingCountry: "China",
      usageCountry: "US",
      energySource: p.energy,
      lifespanYears: 5,
      usageFrequency: "daily",
      transportDistance: 3000,
    });
    setScenarios([...scenarios, { id: Date.now(), preset: selectedPreset, result }]);
  };

  const remove = (id: number) => setScenarios(scenarios.filter((s) => s.id !== id));

  const radarData = [
    { metric: "CO₂ Score" },
    { metric: "Water Score" },
    { metric: "Recycling" },
    { metric: "E-Waste" },
    { metric: "Resource" },
  ].map((d) => {
    const obj: any = { ...d };
    scenarios.forEach((s, i) => {
      const r = s.result;
      obj[`s${i}`] =
        d.metric === "CO₂ Score" ? Math.max(0, 100 - r.totalCO2 / 10)
        : d.metric === "Water Score" ? Math.max(0, 100 - r.waterFootprint / 50)
        : d.metric === "Recycling" ? r.recyclingProbability
        : d.metric === "E-Waste" ? 100 - r.eWasteScore
        : 100 - r.resourceDepletion;
    });
    return obj;
  });

  const barData = scenarios.map((s, i) => ({
    name: s.preset,
    co2: s.result.totalCO2,
    water: Math.round(s.result.waterFootprint / 10),
    landfill: s.result.landfillMass * 10,
  }));

  return (
    <div className="min-h-screen pt-20 pb-12 eco-grid-bg">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Scenario <span className="text-gradient-eco">Comparison</span>
          </h1>
          <p className="text-muted-foreground mb-8">Compare up to 4 product scenarios side-by-side.</p>
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
              <motion.div key={s.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-4 border-t-2" style={{ borderTopColor: COLORS[i] }}>
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-semibold truncate" style={{ color: COLORS[i] }}>{s.preset}</span>
                  <button onClick={() => remove(s.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">CO₂</span><span className="font-semibold">{s.result.totalCO2} kg</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Water</span><span className="font-semibold">{s.result.waterFootprint} L</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">E-Waste</span><span className="font-semibold">{s.result.eWasteRisk}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Recycle</span><span className="font-semibold">{s.result.recyclingProbability}%</span></div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Charts */}
        {scenarios.length >= 2 && (
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Sustainability Radar</h3>
              <ResponsiveContainer width="100%" height={320}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(220, 14%, 18%)" />
                  <PolarAngleAxis dataKey="metric" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(220, 14%, 18%)" fontSize={10} />
                  {scenarios.map((_, i) => (
                    <Radar key={i} name={scenarios[i].preset} dataKey={`s${i}`} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.15} />
                  ))}
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Impact Comparison</h3>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                  <XAxis dataKey="name" stroke="hsl(220, 10%, 55%)" fontSize={11} angle={-15} textAnchor="end" height={60} />
                  <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                  <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 }} />
                  <Legend />
                  <Bar dataKey="co2" fill="hsl(160, 84%, 39%)" name="CO₂ (kg)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="water" fill="hsl(190, 80%, 45%)" name="Water (×10L)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="landfill" fill="hsl(45, 93%, 58%)" name="Landfill (×10g)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
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
