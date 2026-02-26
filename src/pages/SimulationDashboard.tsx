import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from "recharts";
import {
  Activity, Droplets, Trash2, Recycle, AlertTriangle, CheckCircle, Leaf,
  Factory, Truck, Plug, Package, Download, ChevronDown, ChevronUp, Beaker,
  ShieldAlert, Wrench, Battery, Cpu, TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import MetricCard from "@/components/MetricCard";
import {
  runSimulation, getCategoryMaterials,
  PRODUCT_CATEGORIES, ENERGY_SOURCES, COUNTRIES, FREQUENCIES,
  type SimulationInput, type SimulationResult,
} from "@/lib/simulation";
import { generatePDFReport } from "@/lib/report-generator";

const phaseIcons: Record<string, any> = {
  "Raw Materials": Package, Manufacturing: Factory, Transportation: Truck, Usage: Plug, Disposal: Trash2,
};

const COLORS = ["hsl(160, 84%, 39%)", "hsl(190, 80%, 45%)", "hsl(45, 93%, 58%)", "hsl(280, 65%, 60%)", "hsl(0, 72%, 51%)"];
const CHART_STYLE = { background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 };

export default function SimulationDashboard() {
  const [category, setCategory] = useState("smartphone");
  const [energy, setEnergy] = useState("mixed");
  const [lifespan, setLifespan] = useState([5]);
  const [frequency, setFrequency] = useState("daily");
  const [transport, setTransport] = useState([2000]);
  const [mfgCountry, setMfgCountry] = useState("China");
  const [usageCountry, setUsageCountry] = useState("US");
  const [hasRun, setHasRun] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [simYears, setSimYears] = useState<3 | 5 | 10>(5);

  const materials = useMemo(() => getCategoryMaterials(category), [category]);

  const input: SimulationInput = useMemo(() => ({
    productCategory: category,
    materials,
    manufacturingCountry: mfgCountry,
    usageCountry,
    energySource: energy,
    lifespanYears: lifespan[0],
    usageFrequency: frequency,
    transportDistance: transport[0],
  }), [category, materials, mfgCountry, usageCountry, energy, lifespan, frequency, transport]);

  const result: SimulationResult | null = useMemo(() => {
    if (!hasRun) return null;
    return runSimulation({ ...input, lifespanYears: simYears });
  }, [hasRun, input, simYears]);

  const handleDownloadPDF = () => {
    if (result) generatePDFReport({ ...input, lifespanYears: simYears }, result);
  };

  // Monte Carlo histogram
  const histogram = useMemo(() => {
    if (!result) return [];
    const values = result.monteCarlo.map((m) => m.co2);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const buckets = 20;
    const step = (max - min) / buckets;
    const bins = Array.from({ length: buckets }, (_, i) => ({
      range: `${Math.round(min + i * step)}`,
      count: 0,
      label: `${Math.round(min + i * step)}-${Math.round(min + (i + 1) * step)}`,
    }));
    for (const v of values) {
      const idx = Math.min(buckets - 1, Math.floor((v - min) / step));
      bins[idx].count++;
    }
    return bins;
  }, [result]);

  return (
    <div className="min-h-screen pt-20 pb-12 eco-grid-bg">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Impact <span className="text-gradient-eco">Simulator</span>
          </h1>
          <p className="text-muted-foreground mb-8">Configure parameters and run ML-powered lifecycle analysis with Monte Carlo uncertainty modeling.</p>
        </motion.div>

        {/* Input Panel */}
        <div className="glass-card p-6 mb-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Product Category</label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRODUCT_CATEGORIES.map((c) => (
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
                  {ENERGY_SOURCES.map((e) => (
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
                  {FREQUENCIES.map((f) => (
                    <SelectItem key={f} value={f} className="capitalize">{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Manufacturing Country</label>
              <Select value={mfgCountry} onValueChange={setMfgCountry}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Usage Country</label>
              <Select value={usageCountry} onValueChange={setUsageCountry}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
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
                Transport Distance: {transport[0].toLocaleString()} km
              </label>
              <Slider value={transport} onValueChange={setTransport} min={100} max={20000} step={100} className="mt-3" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Simulation Period</label>
              <div className="flex gap-2">
                {([3, 5, 10] as const).map((y) => (
                  <Button
                    key={y}
                    variant={simYears === y ? "default" : "outline"}
                    size="sm"
                    className={simYears === y ? "bg-gradient-eco text-primary-foreground" : ""}
                    onClick={() => setSimYears(y)}
                  >
                    {y} Years
                  </Button>
                ))}
              </div>
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

          {/* Material Composition */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="mt-4 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAdvanced ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Material Composition ({materials.length} materials)
          </button>
          {showAdvanced && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {materials.map((m) => (
                <div key={m.name} className="p-3 rounded-lg bg-secondary/50 border border-border/50">
                  <div className="text-sm font-medium">{m.name}</div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{m.percentage}%</span>
                    <span>Toxic: {Math.round(m.toxicity * 100)}%</span>
                  </div>
                  <Progress value={m.percentage} className="mt-2 h-1.5" />
                </div>
              ))}
            </motion.div>
          )}
        </div>

        {/* Results */}
        {result && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            {/* Top bar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Model confidence: <span className="text-primary font-semibold">{result.confidenceScore}%</span>
                  {" | "}Accuracy: <span className="text-eco-cyan font-semibold">{(result.modelMetrics.accuracy * 100).toFixed(1)}%</span>
                  {" | "}F1: <span className="text-eco-amber font-semibold">{result.modelMetrics.f1}</span>
                </span>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="mr-2 h-4 w-4" /> Download PDF Report
              </Button>
            </div>

            {/* Metric cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <MetricCard label="Total CO₂" value={result.totalCO2} unit="kg CO₂e" icon={<Leaf className="h-4 w-4" />} color="green" />
              <MetricCard label="Water Footprint" value={result.waterFootprint} unit="liters" icon={<Droplets className="h-4 w-4" />} color="cyan" />
              <MetricCard label="Landfill Mass" value={result.landfillMass} unit="kg" icon={<Trash2 className="h-4 w-4" />} color="amber" />
              <MetricCard label="E-Waste Risk" value={result.eWasteRisk} icon={<AlertTriangle className="h-4 w-4" />} color={result.eWasteRisk === "High" ? "red" : result.eWasteRisk === "Medium" ? "amber" : "green"} />
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <MetricCard label="Recycling Probability" value={result.recyclingProbability} unit="%" icon={<Recycle className="h-4 w-4" />} color="green" />
              <MetricCard label="Resource Depletion" value={result.resourceDepletion} unit="/100" icon={<Activity className="h-4 w-4" />} color="purple" />
              <MetricCard label="E-Waste Score" value={result.eWasteScore} unit="/100" icon={<ShieldAlert className="h-4 w-4" />} color="amber" />
              <MetricCard label="Confidence" value={result.confidenceScore} unit="%" icon={<CheckCircle className="h-4 w-4" />} color="cyan" />
            </div>

            {/* Tabbed analysis */}
            <Tabs defaultValue="lifecycle" className="mb-8">
              <TabsList className="grid w-full grid-cols-5 bg-secondary/50">
                <TabsTrigger value="lifecycle">Lifecycle</TabsTrigger>
                <TabsTrigger value="montecarlo">Monte Carlo</TabsTrigger>
                <TabsTrigger value="ewaste">E-Waste</TabsTrigger>
                <TabsTrigger value="shap">SHAP</TabsTrigger>
                <TabsTrigger value="degradation">Degradation</TabsTrigger>
              </TabsList>

              {/* Lifecycle Tab */}
              <TabsContent value="lifecycle" className="space-y-6 mt-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-semibold mb-4">Annual Emissions with Confidence Intervals</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={result.annualBreakdown}>
                        <defs>
                          <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="ciGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.1} />
                            <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                        <XAxis dataKey="year" stroke="hsl(220, 10%, 55%)" fontSize={12} tickFormatter={(v) => `Y${v}`} />
                        <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                        <Tooltip contentStyle={CHART_STYLE} />
                        <Area type="monotone" dataKey="ci_high" stroke="none" fill="url(#ciGrad)" name="CI Upper" />
                        <Area type="monotone" dataKey="ci_low" stroke="none" fill="transparent" name="CI Lower" />
                        <Area type="monotone" dataKey="co2" stroke="hsl(160, 84%, 39%)" fill="url(#co2Grad)" name="CO₂ (kg)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-semibold mb-4">Lifecycle Phase Breakdown</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie data={result.lifecyclePhases} dataKey="co2" nameKey="phase" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3}
                          label={({ phase, percentage }) => `${phase} ${percentage}%`}>
                          {result.lifecyclePhases.map((_, idx) => (
                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={CHART_STYLE} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-semibold mb-4">Water & Waste by Year</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={result.annualBreakdown}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                        <XAxis dataKey="year" stroke="hsl(220, 10%, 55%)" fontSize={12} tickFormatter={(v) => `Y${v}`} />
                        <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                        <Tooltip contentStyle={CHART_STYLE} />
                        <Legend />
                        <Bar dataKey="water" fill="hsl(190, 80%, 45%)" radius={[4, 4, 0, 0]} name="Water (L)" />
                        <Bar dataKey="waste" fill="hsl(45, 93%, 58%)" radius={[4, 4, 0, 0]} name="Waste (kg)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-semibold mb-4">Toxic Risk by Phase</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={result.lifecyclePhases.map((p) => ({ phase: p.phase, toxicRisk: p.toxicRisk, co2: Math.round(p.co2 / result.totalCO2 * 100) }))}>
                        <PolarGrid stroke="hsl(220, 14%, 18%)" />
                        <PolarAngleAxis dataKey="phase" stroke="hsl(220, 10%, 55%)" fontSize={11} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(220, 14%, 18%)" fontSize={10} />
                        <Radar name="Toxic Risk" dataKey="toxicRisk" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%)" fillOpacity={0.2} />
                        <Radar name="CO₂ %" dataKey="co2" stroke="hsl(160, 84%, 39%)" fill="hsl(160, 84%, 39%)" fillOpacity={0.15} />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Phase details */}
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
                          <div className="text-xs text-muted-foreground mt-1">Water: {p.water}L</div>
                          <div className="text-xs mt-1">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${p.toxicRisk > 50 ? "bg-destructive/20 text-destructive" : "bg-primary/20 text-primary"}`}>
                              Toxic: {p.toxicRisk}%
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </TabsContent>

              {/* Monte Carlo Tab */}
              <TabsContent value="montecarlo" className="space-y-6 mt-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-semibold mb-2">CO₂ Distribution ({result.monteCarlo.length} iterations)</h3>
                    <p className="text-xs text-muted-foreground mb-4">Monte Carlo simulation showing uncertainty in CO₂ predictions</p>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={histogram}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                        <XAxis dataKey="range" stroke="hsl(220, 10%, 55%)" fontSize={10} angle={-45} textAnchor="end" height={60} />
                        <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                        <Tooltip contentStyle={CHART_STYLE} formatter={(v: number) => [`${v} iterations`, "Frequency"]} />
                        <Bar dataKey="count" fill="hsl(160, 84%, 39%)" radius={[2, 2, 0, 0]} name="Frequency" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-semibold mb-2">CO₂ vs Water Scatter</h3>
                    <p className="text-xs text-muted-foreground mb-4">Correlation between CO₂ and water footprint across simulations</p>
                    <ResponsiveContainer width="100%" height={300}>
                      <ScatterChart>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                        <XAxis dataKey="co2" name="CO₂" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                        <YAxis dataKey="water" name="Water" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                        <Tooltip contentStyle={CHART_STYLE} />
                        <Scatter data={result.monteCarlo.slice(0, 100)} fill="hsl(190, 80%, 45%)" fillOpacity={0.6} />
                      </ScatterChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Statistics */}
                <div className="glass-card p-6">
                  <h3 className="font-display text-lg font-semibold mb-4">Statistical Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    {(() => {
                      const co2s = result.monteCarlo.map((m) => m.co2).sort((a, b) => a - b);
                      const mean = Math.round(co2s.reduce((a, b) => a + b, 0) / co2s.length);
                      const std = Math.round(Math.sqrt(co2s.reduce((sum, v) => sum + (v - mean) ** 2, 0) / co2s.length));
                      return [
                        { label: "Mean CO₂", value: `${mean} kg`, color: "green" },
                        { label: "Std Dev", value: `±${std} kg`, color: "cyan" },
                        { label: "P5 (5th percentile)", value: `${co2s[Math.floor(co2s.length * 0.05)]} kg`, color: "green" },
                        { label: "Median (P50)", value: `${co2s[Math.floor(co2s.length * 0.5)]} kg`, color: "amber" },
                        { label: "P95 (95th percentile)", value: `${co2s[Math.floor(co2s.length * 0.95)]} kg`, color: "red" },
                      ].map((s) => (
                        <div key={s.label} className="text-center p-4 rounded-xl bg-secondary/50 border border-border/50">
                          <div className="text-xs text-muted-foreground mb-1">{s.label}</div>
                          <div className={`font-display text-lg font-bold text-eco-${s.color}`}>{s.value}</div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </TabsContent>

              {/* E-Waste Tab */}
              <TabsContent value="ewaste" className="space-y-6 mt-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                      <ShieldAlert className="h-5 w-5 text-eco-amber" /> E-Waste Risk Assessment
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                        <span className="text-muted-foreground">Risk Level</span>
                        <span className={`font-bold text-lg ${result.eWasteDetail.risk === "High" ? "text-destructive" : result.eWasteDetail.risk === "Medium" ? "text-eco-amber" : "text-primary"}`}>
                          {result.eWasteDetail.risk}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                        <span className="text-muted-foreground flex items-center gap-2"><Beaker className="h-4 w-4" />Score</span>
                        <span className="font-bold">{result.eWasteDetail.score}/100</span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                        <span className="text-muted-foreground">Probability</span>
                        <span className="font-bold">{(result.eWasteDetail.probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                        <span className="text-muted-foreground flex items-center gap-2"><Wrench className="h-4 w-4" />Repairability</span>
                        <span className="font-bold">{result.eWasteDetail.repairabilityScore}/100</span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                        <span className="text-muted-foreground flex items-center gap-2"><Cpu className="h-4 w-4" />Software Support</span>
                        <span className="font-bold">{result.eWasteDetail.softwareSupportYears} years</span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                        <span className="text-muted-foreground flex items-center gap-2"><TrendingUp className="h-4 w-4" />Obsolescence Rate</span>
                        <span className="font-bold">{result.eWasteDetail.obsolescenceRate}%</span>
                      </div>
                      <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                        <span className="text-muted-foreground flex items-center gap-2"><Battery className="h-4 w-4" />Battery Risk</span>
                        <span className={`font-bold ${result.eWasteDetail.batteryRisk === "High" ? "text-destructive" : result.eWasteDetail.batteryRisk === "Moderate" ? "text-eco-amber" : "text-primary"}`}>
                          {result.eWasteDetail.batteryRisk}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-semibold mb-4">E-Waste Factor Analysis</h3>
                    <ResponsiveContainer width="100%" height={350}>
                      <RadarChart data={[
                        { factor: "Repairability", value: result.eWasteDetail.repairabilityScore },
                        { factor: "Software Support", value: result.eWasteDetail.softwareSupportYears * 10 },
                        { factor: "Recyclability", value: result.recyclingProbability },
                        { factor: "Material Safety", value: 100 - result.eWasteDetail.score },
                        { factor: "Longevity", value: Math.min(100, lifespan[0] * 10) },
                      ]}>
                        <PolarGrid stroke="hsl(220, 14%, 18%)" />
                        <PolarAngleAxis dataKey="factor" stroke="hsl(220, 10%, 55%)" fontSize={11} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="hsl(220, 14%, 18%)" fontSize={10} />
                        <Radar name="Score" dataKey="value" stroke="hsl(190, 80%, 45%)" fill="hsl(190, 80%, 45%)" fillOpacity={0.2} />
                      </RadarChart>
                    </ResponsiveContainer>
                    {result.eWasteDetail.toxicMaterials.length > 0 && (
                      <div className="mt-4">
                        <div className="text-sm font-medium mb-2">Toxic Materials Identified:</div>
                        <div className="flex flex-wrap gap-2">
                          {result.eWasteDetail.toxicMaterials.map((m) => (
                            <span key={m} className="text-xs px-2 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20">
                              {m}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* SHAP Tab */}
              <TabsContent value="shap" className="space-y-6 mt-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-semibold mb-2">Feature Importance (SHAP Values)</h3>
                    <p className="text-xs text-muted-foreground mb-4">How each feature contributes to the prediction</p>
                    <ResponsiveContainer width="100%" height={360}>
                      <BarChart layout="vertical" data={result.shapValues}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                        <XAxis type="number" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                        <YAxis dataKey="feature" type="category" stroke="hsl(220, 10%, 55%)" fontSize={11} width={140} />
                        <Tooltip contentStyle={CHART_STYLE} formatter={(v: number, _: string, p: any) => [`${v} (${p.payload.direction === "positive" ? "↑ increases" : "↓ decreases"} impact)`, "SHAP Value"]} />
                        <Bar dataKey="importance" radius={[0, 4, 4, 0]} name="SHAP Value">
                          {result.shapValues.map((s, i) => (
                            <Cell key={i} fill={s.direction === "positive" ? "hsl(0, 72%, 51%)" : "hsl(160, 84%, 39%)"} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-semibold mb-4">Cross-Validation Results</h3>
                    <div className="space-y-3 mb-6">
                      {result.crossValidation.map((cv) => (
                        <div key={cv.fold} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                          <span className="text-sm font-medium w-16">Fold {cv.fold}</span>
                          <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                            <div><span className="text-muted-foreground">RMSE: </span><span className="text-primary font-medium">{cv.rmse}</span></div>
                            <div><span className="text-muted-foreground">R²: </span><span className="text-eco-cyan font-medium">{cv.r2}</span></div>
                            <div><span className="text-muted-foreground">MAE: </span><span className="text-eco-amber font-medium">{cv.mae}</span></div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                      <div className="text-sm font-medium mb-2">Model Performance Summary</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Accuracy: <span className="font-bold text-primary">{(result.modelMetrics.accuracy * 100).toFixed(1)}%</span></div>
                        <div>F1 Score: <span className="font-bold text-eco-cyan">{result.modelMetrics.f1}</span></div>
                        <div>Precision: <span className="font-bold text-eco-amber">{result.modelMetrics.precision}</span></div>
                        <div>Recall: <span className="font-bold text-eco-purple">{result.modelMetrics.recall}</span></div>
                        <div className="col-span-2">AUC-ROC: <span className="font-bold text-primary">{result.modelMetrics.auc}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Degradation Tab */}
              <TabsContent value="degradation" className="space-y-6 mt-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-semibold mb-2">Degradation Timeline (LSTM Model)</h3>
                    <p className="text-xs text-muted-foreground mb-4">Product efficiency and material integrity over time</p>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={result.degradationTimeline}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                        <XAxis dataKey="year" stroke="hsl(220, 10%, 55%)" fontSize={12} tickFormatter={(v) => `Y${v}`} />
                        <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} domain={[0, 100]} />
                        <Tooltip contentStyle={CHART_STYLE} />
                        <Legend />
                        <Line type="monotone" dataKey="efficiency" stroke="hsl(160, 84%, 39%)" strokeWidth={2} name="Efficiency %" dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="materialIntegrity" stroke="hsl(190, 80%, 45%)" strokeWidth={2} name="Material Integrity %" dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="toxicLeach" stroke="hsl(0, 72%, 51%)" strokeWidth={2} name="Toxic Leaching %" dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="glass-card p-6">
                    <h3 className="font-display text-lg font-semibold mb-2">Cumulative CO₂ Projection</h3>
                    <p className="text-xs text-muted-foreground mb-4">Total environmental debt over product lifecycle</p>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={result.degradationTimeline}>
                        <defs>
                          <linearGradient id="cumGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(45, 93%, 58%)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="hsl(45, 93%, 58%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                        <XAxis dataKey="year" stroke="hsl(220, 10%, 55%)" fontSize={12} tickFormatter={(v) => `Y${v}`} />
                        <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                        <Tooltip contentStyle={CHART_STYLE} />
                        <Area type="monotone" dataKey="co2Cumulative" stroke="hsl(45, 93%, 58%)" fill="url(#cumGrad)" name="Cumulative CO₂ (kg)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
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
