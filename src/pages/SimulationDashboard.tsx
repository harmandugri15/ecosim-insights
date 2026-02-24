import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, Legend,
  PieChart, Pie, Cell,
} from "recharts";
import { Activity, Droplets, Trash2, Recycle, AlertTriangle, CheckCircle, Leaf, Factory, Truck, Plug, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import MetricCard from "@/components/MetricCard";
import { runSimulation, type SimulationInput, type SimulationResult } from "@/lib/simulation";

const categories = ["smartphone", "laptop", "electric vehicle", "clothing", "furniture", "appliance", "packaging"];
const energySources = ["coal", "natural gas", "mixed", "solar", "wind", "nuclear", "hydro"];
const frequencies = ["daily", "weekly", "monthly"];

const phaseIcons: Record<string, any> = {
  "Raw Materials": Package,
  Manufacturing: Factory,
  Transportation: Truck,
  Usage: Plug,
  Disposal: Trash2,
};

const COLORS = ["hsl(160, 84%, 39%)", "hsl(190, 80%, 45%)", "hsl(45, 93%, 58%)", "hsl(280, 65%, 60%)", "hsl(0, 72%, 51%)"];

export default function SimulationDashboard() {
  const [category, setCategory] = useState("smartphone");
  const [energy, setEnergy] = useState("mixed");
  const [lifespan, setLifespan] = useState([5]);
  const [frequency, setFrequency] = useState("daily");
  const [transport, setTransport] = useState([2000]);
  const [hasRun, setHasRun] = useState(false);

  const result: SimulationResult | null = useMemo(() => {
    if (!hasRun) return null;
    const input: SimulationInput = {
      productCategory: category,
      materials: [{ name: "Mixed", percentage: 100 }],
      manufacturingCountry: "China",
      usageCountry: "US",
      energySource: energy,
      lifespanYears: lifespan[0],
      usageFrequency: frequency,
      transportDistance: transport[0],
    };
    return runSimulation(input);
  }, [hasRun, category, energy, lifespan, frequency, transport]);

  return (
    <div className="min-h-screen pt-20 pb-12 eco-grid-bg">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Impact <span className="text-gradient-eco">Simulator</span>
          </h1>
          <p className="text-muted-foreground mb-8">Configure parameters and run ML-powered lifecycle analysis.</p>
        </motion.div>

        {/* Input Panel */}
        <div className="glass-card p-6 mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Product Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Energy Source</label>
              <Select value={energy} onValueChange={setEnergy}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {energySources.map((e) => (
                    <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Usage Frequency</label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {frequencies.map((f) => (
                    <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Lifespan: {lifespan[0]} years
              </label>
              <Slider value={lifespan} onValueChange={setLifespan} min={1} max={15} step={1} className="mt-3" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">
                Transport Distance: {transport[0]} km
              </label>
              <Slider value={transport} onValueChange={setTransport} min={100} max={20000} step={100} className="mt-3" />
            </div>
            <div className="flex items-end">
              <Button
                onClick={() => setHasRun(true)}
                className="w-full bg-gradient-eco text-primary-foreground font-semibold shadow-glow hover:opacity-90"
              >
                <Activity className="mr-2 h-4 w-4" />
                Run Simulation
              </Button>
            </div>
          </div>
        </div>

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {/* Confidence badge */}
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                Model confidence: <span className="text-primary font-semibold">{result.confidenceScore}%</span>
              </span>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard label="Total CO₂" value={result.totalCO2} unit="kg CO₂e" icon={<Leaf className="h-4 w-4" />} color="green" />
              <MetricCard label="Water Footprint" value={result.waterFootprint} unit="liters" icon={<Droplets className="h-4 w-4" />} color="cyan" />
              <MetricCard label="Landfill Mass" value={result.landfillMass} unit="kg" icon={<Trash2 className="h-4 w-4" />} color="amber" />
              <MetricCard label="E-Waste Risk" value={result.eWasteRisk} icon={<AlertTriangle className="h-4 w-4" />} color={result.eWasteRisk === "High" ? "red" : result.eWasteRisk === "Medium" ? "amber" : "green"} />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard label="Recycling Probability" value={result.recyclingProbability} unit="%" icon={<Recycle className="h-4 w-4" />} color="green" />
              <MetricCard label="Resource Depletion" value={result.resourceDepletion} unit="/100" icon={<Activity className="h-4 w-4" />} color="purple" />
              <MetricCard label="E-Waste Score" value={result.eWasteScore} unit="/100" icon={<AlertTriangle className="h-4 w-4" />} color="amber" />
              <MetricCard label="Confidence" value={result.confidenceScore} unit="%" icon={<CheckCircle className="h-4 w-4" />} color="cyan" />
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              {/* Annual emissions */}
              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Annual Emissions Forecast</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={result.annualBreakdown}>
                    <defs>
                      <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                    <XAxis dataKey="year" stroke="hsl(220, 10%, 55%)" fontSize={12} tickFormatter={(v) => `Y${v}`} />
                    <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 }} />
                    <Area type="monotone" dataKey="co2" stroke="hsl(160, 84%, 39%)" fill="url(#co2Grad)" name="CO₂ (kg)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Lifecycle phases pie */}
              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Lifecycle Phase Breakdown</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={result.lifecyclePhases}
                      dataKey="co2"
                      nameKey="phase"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      label={({ phase, percentage }) => `${phase} ${percentage}%`}
                    >
                      {result.lifecyclePhases.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Water usage bar chart */}
              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Water Usage by Year</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={result.annualBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                    <XAxis dataKey="year" stroke="hsl(220, 10%, 55%)" fontSize={12} tickFormatter={(v) => `Y${v}`} />
                    <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 }} />
                    <Bar dataKey="water" fill="hsl(190, 80%, 45%)" radius={[4, 4, 0, 0]} name="Water (L)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Feature importance (SHAP mock) */}
              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Feature Importance (SHAP)</h3>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart
                    layout="vertical"
                    data={[
                      { feature: "Energy Source", importance: 0.32 },
                      { feature: "Product Category", importance: 0.25 },
                      { feature: "Transport Distance", importance: 0.18 },
                      { feature: "Usage Frequency", importance: 0.14 },
                      { feature: "Lifespan", importance: 0.11 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                    <XAxis type="number" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <YAxis dataKey="feature" type="category" stroke="hsl(220, 10%, 55%)" fontSize={12} width={120} />
                    <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 }} />
                    <Bar dataKey="importance" fill="hsl(280, 65%, 60%)" radius={[0, 4, 4, 0]} name="SHAP Value" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Lifecycle phase details */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Lifecycle Phase Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {result.lifecyclePhases.map((p, i) => {
                  const Icon = phaseIcons[p.phase] || Leaf;
                  return (
                    <div key={p.phase} className="text-center p-4 rounded-xl bg-secondary/50 border border-border/50">
                      <Icon className="h-6 w-6 mx-auto mb-2" style={{ color: COLORS[i] }} />
                      <div className="text-xs text-muted-foreground mb-1">{p.phase}</div>
                      <div className="font-display text-lg font-bold" style={{ color: COLORS[i] }}>{p.co2}</div>
                      <div className="text-xs text-muted-foreground">kg CO₂e</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
