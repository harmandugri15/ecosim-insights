import { useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";
import {
  Shield, Activity, Database, Cpu, Clock, AlertTriangle,
  CheckCircle, RefreshCw, Settings, Server, HardDrive, Gauge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import MetricCard from "@/components/MetricCard";

const COLORS = ["hsl(160, 84%, 39%)", "hsl(190, 80%, 45%)", "hsl(45, 93%, 58%)", "hsl(280, 65%, 60%)", "hsl(0, 72%, 51%)"];
const CHART_STYLE = { background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 };

const models = [
  {
    name: "CO₂ Impact Regressor",
    type: "XGBoost",
    version: "2.1.4",
    accuracy: 94.2,
    f1: 0.912,
    precision: 0.923,
    recall: 0.901,
    auc: 0.967,
    lastTrained: "2025-12-15",
    predictions: 12840,
    avgLatency: 23,
    status: "active",
    drift: 2.1,
  },
  {
    name: "E-Waste Risk Classifier",
    type: "Gradient Boosting",
    version: "1.8.2",
    accuracy: 89.5,
    f1: 0.873,
    precision: 0.891,
    recall: 0.856,
    auc: 0.942,
    lastTrained: "2025-12-10",
    predictions: 8920,
    avgLatency: 18,
    status: "active",
    drift: 3.4,
  },
  {
    name: "Greenwash NLP Detector",
    type: "DistilBERT",
    version: "3.0.1",
    accuracy: 92.1,
    f1: 0.905,
    precision: 0.918,
    recall: 0.892,
    auc: 0.958,
    lastTrained: "2025-12-20",
    predictions: 3450,
    avgLatency: 145,
    status: "active",
    drift: 1.8,
  },
  {
    name: "Degradation LSTM",
    type: "LSTM",
    version: "1.3.0",
    accuracy: 86.8,
    f1: 0.834,
    precision: 0.852,
    recall: 0.817,
    auc: 0.921,
    lastTrained: "2025-11-28",
    predictions: 5670,
    avgLatency: 89,
    status: "warning",
    drift: 5.2,
  },
];

const latencyHistory = [
  { time: "00:00", co2Model: 22, ewasteModel: 17, nlpModel: 140, lstmModel: 85 },
  { time: "04:00", co2Model: 24, ewasteModel: 19, nlpModel: 148, lstmModel: 92 },
  { time: "08:00", co2Model: 28, ewasteModel: 22, nlpModel: 165, lstmModel: 98 },
  { time: "12:00", co2Model: 32, ewasteModel: 25, nlpModel: 178, lstmModel: 110 },
  { time: "16:00", co2Model: 26, ewasteModel: 20, nlpModel: 155, lstmModel: 95 },
  { time: "20:00", co2Model: 23, ewasteModel: 18, nlpModel: 142, lstmModel: 88 },
];

const predictionVolume = [
  { date: "Mon", volume: 1240, errors: 12 },
  { date: "Tue", volume: 1380, errors: 8 },
  { date: "Wed", volume: 1560, errors: 15 },
  { date: "Thu", volume: 1420, errors: 10 },
  { date: "Fri", volume: 1680, errors: 18 },
  { date: "Sat", volume: 890, errors: 5 },
  { date: "Sun", volume: 720, errors: 3 },
];

const driftHistory = [
  { week: "W1", co2: 1.2, ewaste: 1.8, nlp: 0.9, lstm: 2.4 },
  { week: "W2", co2: 1.5, ewaste: 2.1, nlp: 1.1, lstm: 3.1 },
  { week: "W3", co2: 1.8, ewaste: 2.5, nlp: 1.4, lstm: 3.8 },
  { week: "W4", co2: 2.1, ewaste: 3.4, nlp: 1.8, lstm: 5.2 },
];

const systemHealth = [
  { name: "API Server", status: "healthy", uptime: 99.98, load: 34 },
  { name: "ML Inference Engine", status: "healthy", uptime: 99.95, load: 52 },
  { name: "Database (Cosmos DB)", status: "healthy", uptime: 99.99, load: 28 },
  { name: "Redis Cache", status: "healthy", uptime: 99.97, load: 41 },
  { name: "Blob Storage", status: "healthy", uptime: 100, load: 15 },
  { name: "Azure ML Endpoint", status: "degraded", uptime: 99.85, load: 78 },
];

const apiEndpoints = [
  { path: "POST /api/v1/simulate", calls: 12840, avgMs: 245, p99Ms: 890, errors: 0.12 },
  { path: "POST /api/v1/greenwash", calls: 3450, avgMs: 420, p99Ms: 1200, errors: 0.08 },
  { path: "GET /api/v1/compare", calls: 5230, avgMs: 180, p99Ms: 560, errors: 0.05 },
  { path: "POST /api/v1/ewaste", calls: 8920, avgMs: 195, p99Ms: 620, errors: 0.10 },
  { path: "GET /api/v1/analytics", calls: 2100, avgMs: 90, p99Ms: 280, errors: 0.02 },
  { path: "POST /api/v1/org/bulk", calls: 145, avgMs: 3200, p99Ms: 8500, errors: 0.34 },
];

export default function AdminPage() {
  const [retraining, setRetraining] = useState<string | null>(null);

  const handleRetrain = async (modelName: string) => {
    setRetraining(modelName);
    await new Promise((r) => setTimeout(r, 3000));
    setRetraining(null);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 eco-grid-bg">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Admin & Model <span className="text-gradient-eco">Monitoring</span>
            </h1>
          </div>
          <p className="text-muted-foreground mb-8">Model performance tracking, drift detection, system health, and API monitoring.</p>
        </motion.div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Predictions" value="30.9K" icon={<Activity className="h-4 w-4" />} color="green" />
          <MetricCard label="Avg Latency" value="69" unit="ms" icon={<Clock className="h-4 w-4" />} color="cyan" />
          <MetricCard label="Active Models" value={models.filter((m) => m.status === "active").length} icon={<Cpu className="h-4 w-4" />} color="purple" />
          <MetricCard label="Error Rate" value="0.12" unit="%" icon={<AlertTriangle className="h-4 w-4" />} color="amber" />
        </div>

        <Tabs defaultValue="models">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="models">Model Performance</TabsTrigger>
            <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            <TabsTrigger value="system">System Health</TabsTrigger>
            <TabsTrigger value="api">API Endpoints</TabsTrigger>
          </TabsList>

          {/* Models */}
          <TabsContent value="models" className="mt-6 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {models.map((m) => (
                <motion.div key={m.name} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-display text-lg font-semibold">{m.name}</h3>
                      <p className="text-xs text-muted-foreground">{m.type} v{m.version} | Last trained: {m.lastTrained}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      m.status === "active" ? "bg-primary/20 text-primary" : "bg-eco-amber/20 text-eco-amber"
                    }`}>
                      {m.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-2 rounded bg-secondary/50 text-center">
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                      <div className="font-bold text-primary">{m.accuracy}%</div>
                    </div>
                    <div className="p-2 rounded bg-secondary/50 text-center">
                      <div className="text-xs text-muted-foreground">F1 Score</div>
                      <div className="font-bold text-eco-cyan">{m.f1}</div>
                    </div>
                    <div className="p-2 rounded bg-secondary/50 text-center">
                      <div className="text-xs text-muted-foreground">AUC-ROC</div>
                      <div className="font-bold text-eco-amber">{m.auc}</div>
                    </div>
                    <div className="p-2 rounded bg-secondary/50 text-center">
                      <div className="text-xs text-muted-foreground">Drift</div>
                      <div className={`font-bold ${m.drift > 4 ? "text-destructive" : m.drift > 2.5 ? "text-eco-amber" : "text-primary"}`}>{m.drift}%</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                    <span>{m.predictions.toLocaleString()} predictions</span>
                    <span>Avg {m.avgLatency}ms</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleRetrain(m.name)}
                    disabled={retraining === m.name}
                  >
                    <RefreshCw className={`mr-2 h-3 w-3 ${retraining === m.name ? "animate-spin" : ""}`} />
                    {retraining === m.name ? "Retraining..." : "Trigger Retrain"}
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Confusion Matrix placeholder */}
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold mb-4">E-Waste Classifier - Confusion Matrix</h3>
              <div className="grid grid-cols-4 gap-1 max-w-md mx-auto text-center text-sm">
                <div />
                <div className="p-2 font-medium text-muted-foreground">Pred Low</div>
                <div className="p-2 font-medium text-muted-foreground">Pred Med</div>
                <div className="p-2 font-medium text-muted-foreground">Pred High</div>
                <div className="p-2 font-medium text-muted-foreground">True Low</div>
                <div className="p-3 rounded bg-primary/20 text-primary font-bold">847</div>
                <div className="p-3 rounded bg-destructive/10 text-muted-foreground">23</div>
                <div className="p-3 rounded bg-destructive/10 text-muted-foreground">5</div>
                <div className="p-2 font-medium text-muted-foreground">True Med</div>
                <div className="p-3 rounded bg-destructive/10 text-muted-foreground">31</div>
                <div className="p-3 rounded bg-primary/20 text-primary font-bold">692</div>
                <div className="p-3 rounded bg-destructive/10 text-muted-foreground">18</div>
                <div className="p-2 font-medium text-muted-foreground">True High</div>
                <div className="p-3 rounded bg-destructive/10 text-muted-foreground">8</div>
                <div className="p-3 rounded bg-destructive/10 text-muted-foreground">27</div>
                <div className="p-3 rounded bg-primary/20 text-primary font-bold">549</div>
              </div>
            </div>
          </TabsContent>

          {/* Monitoring */}
          <TabsContent value="monitoring" className="mt-6 space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Model Latency (24h)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={latencyHistory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                    <XAxis dataKey="time" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <Tooltip contentStyle={CHART_STYLE} />
                    <Legend />
                    <Line type="monotone" dataKey="co2Model" stroke={COLORS[0]} name="CO₂ Model" strokeWidth={2} />
                    <Line type="monotone" dataKey="ewasteModel" stroke={COLORS[1]} name="E-Waste Model" strokeWidth={2} />
                    <Line type="monotone" dataKey="nlpModel" stroke={COLORS[2]} name="NLP Model" strokeWidth={2} />
                    <Line type="monotone" dataKey="lstmModel" stroke={COLORS[3]} name="LSTM Model" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Prediction Volume (7d)</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={predictionVolume}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                    <XAxis dataKey="date" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <Tooltip contentStyle={CHART_STYLE} />
                    <Legend />
                    <Bar dataKey="volume" fill={COLORS[0]} name="Predictions" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="errors" fill={COLORS[4]} name="Errors" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Model Drift Detection</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={driftHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                  <XAxis dataKey="week" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} domain={[0, 8]} />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Legend />
                  <Area type="monotone" dataKey="co2" stroke={COLORS[0]} fill={COLORS[0]} fillOpacity={0.1} name="CO₂ Model" strokeWidth={2} />
                  <Area type="monotone" dataKey="ewaste" stroke={COLORS[1]} fill={COLORS[1]} fillOpacity={0.1} name="E-Waste Model" strokeWidth={2} />
                  <Area type="monotone" dataKey="nlp" stroke={COLORS[2]} fill={COLORS[2]} fillOpacity={0.1} name="NLP Model" strokeWidth={2} />
                  <Area type="monotone" dataKey="lstm" stroke={COLORS[3]} fill={COLORS[3]} fillOpacity={0.1} name="LSTM Model" strokeWidth={2} />
                  {/* Threshold line */}
                  <Line type="monotone" dataKey={() => 5} stroke="hsl(0, 72%, 51%)" strokeDasharray="5 5" name="Drift Threshold" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-2">Models exceeding 5% drift threshold require retraining. LSTM model approaching threshold.</p>
            </div>
          </TabsContent>

          {/* System Health */}
          <TabsContent value="system" className="mt-6 space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold mb-4 flex items-center gap-2">
                <Server className="h-5 w-5 text-primary" /> Infrastructure Status
              </h3>
              <div className="space-y-3">
                {systemHealth.map((s) => (
                  <div key={s.name} className="flex items-center gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className={`h-3 w-3 rounded-full ${s.status === "healthy" ? "bg-primary" : "bg-eco-amber"} animate-pulse`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{s.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          s.status === "healthy" ? "bg-primary/20 text-primary" : "bg-eco-amber/20 text-eco-amber"
                        }`}>
                          {s.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 mt-2 text-xs text-muted-foreground">
                        <span>Uptime: {s.uptime}%</span>
                        <span>Load: {s.load}%</span>
                        <div className="flex-1 max-w-[150px]">
                          <Progress value={s.load} className="h-1.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {[
                { icon: HardDrive, label: "Storage", used: "124 GB", total: "500 GB", pct: 24.8 },
                { icon: Gauge, label: "Memory", used: "12.4 GB", total: "32 GB", pct: 38.8 },
                { icon: Cpu, label: "CPU", used: "4.2 cores", total: "16 cores", pct: 26.3 },
              ].map((r) => (
                <div key={r.label} className="glass-card p-6 text-center">
                  <r.icon className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="font-display text-lg font-semibold mb-1">{r.label}</div>
                  <div className="text-sm text-muted-foreground mb-3">{r.used} / {r.total}</div>
                  <Progress value={r.pct} className="h-2 mb-1" />
                  <div className="text-xs text-muted-foreground">{r.pct}% utilized</div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* API */}
          <TabsContent value="api" className="mt-6">
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-border/50">
                <h3 className="font-display text-lg font-semibold">API Endpoint Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-secondary/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Endpoint</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Calls (24h)</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Avg (ms)</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">P99 (ms)</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Error %</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiEndpoints.map((ep) => (
                      <tr key={ep.path} className="border-b border-border/30 hover:bg-secondary/20">
                        <td className="p-3 font-mono text-xs">{ep.path}</td>
                        <td className="p-3 text-right">{ep.calls.toLocaleString()}</td>
                        <td className="p-3 text-right">{ep.avgMs}</td>
                        <td className="p-3 text-right">{ep.p99Ms}</td>
                        <td className="p-3 text-right">{ep.errors}%</td>
                        <td className="p-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            ep.errors < 0.1 ? "bg-primary/20 text-primary" :
                            ep.errors < 0.2 ? "bg-eco-amber/20 text-eco-amber" :
                            "bg-destructive/20 text-destructive"
                          }`}>
                            {ep.errors < 0.1 ? "healthy" : ep.errors < 0.2 ? "warning" : "attention"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
