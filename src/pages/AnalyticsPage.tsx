import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { FileText, TrendingUp, Users, Activity, Download, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MetricCard from "@/components/MetricCard";

const COLORS = ["hsl(160, 84%, 39%)", "hsl(190, 80%, 45%)", "hsl(45, 93%, 58%)", "hsl(280, 65%, 60%)", "hsl(0, 72%, 51%)"];
const CHART_STYLE = { background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 };

const monthlyData = [
  { month: "Jul", simulations: 124, co2Saved: 3200, users: 42, reports: 8 },
  { month: "Aug", simulations: 156, co2Saved: 4100, users: 58, reports: 12 },
  { month: "Sep", simulations: 198, co2Saved: 5400, users: 76, reports: 15 },
  { month: "Oct", simulations: 243, co2Saved: 6800, users: 112, reports: 21 },
  { month: "Nov", simulations: 287, co2Saved: 7900, users: 168, reports: 18 },
  { month: "Dec", simulations: 342, co2Saved: 9200, users: 210, reports: 26 },
  { month: "Jan", simulations: 398, co2Saved: 10800, users: 256, reports: 32 },
  { month: "Feb", simulations: 451, co2Saved: 12400, users: 284, reports: 38 },
];

const categoryDist = [
  { name: "Electronics", value: 42, co2: 18200 },
  { name: "Transport", value: 28, co2: 34600 },
  { name: "Clothing", value: 15, co2: 4200 },
  { name: "Furniture", value: 10, co2: 3100 },
  { name: "Other", value: 5, co2: 1500 },
];

const modelPerf = [
  { model: "CO₂ Regressor", type: "XGBoost", accuracy: 94, f1: 0.91, precision: 0.92, recall: 0.90, trainTime: "4.2h" },
  { model: "E-Waste Classifier", type: "Gradient Boosting", accuracy: 89, f1: 0.87, precision: 0.89, recall: 0.86, trainTime: "2.8h" },
  { model: "Greenwash NLP", type: "DistilBERT", accuracy: 92, f1: 0.90, precision: 0.92, recall: 0.89, trainTime: "6.5h" },
  { model: "Degradation LSTM", type: "LSTM", accuracy: 86, f1: 0.83, precision: 0.85, recall: 0.82, trainTime: "8.1h" },
];

const esgMetrics = [
  { category: "Environmental", score: 82, items: ["Carbon tracking", "Water footprint", "E-waste monitoring", "Lifecycle analysis"] },
  { category: "Social", score: 71, items: ["Supply chain transparency", "Worker safety", "Community impact", "Fair trade compliance"] },
  { category: "Governance", score: 88, items: ["Data privacy", "Ethical AI", "Compliance reporting", "Audit trails"] },
];

const impactByRegion = [
  { region: "North America", co2: 12400, water: 38600, products: 423 },
  { region: "Europe", co2: 8900, water: 28200, products: 312 },
  { region: "Asia Pacific", co2: 18200, water: 52400, products: 567 },
  { region: "Latin America", co2: 3200, water: 9800, products: 89 },
];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen pt-20 pb-12 eco-grid-bg">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-2">
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Analytics & <span className="text-gradient-eco">Reports</span>
            </h1>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="mr-2 h-4 w-4" /> Power BI
              </Button>
            </div>
          </div>
          <p className="text-muted-foreground mb-8">Platform usage metrics, model performance, and ESG reporting.</p>
        </motion.div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Simulations" value="2,199" icon={<Activity className="h-4 w-4" />} color="green" />
          <MetricCard label="CO₂ Insights" value="59.9K" unit="kg" icon={<TrendingUp className="h-4 w-4" />} color="cyan" />
          <MetricCard label="Active Users" value="284" icon={<Users className="h-4 w-4" />} color="purple" />
          <MetricCard label="Reports Generated" value="170" icon={<FileText className="h-4 w-4" />} color="amber" />
        </div>

        <Tabs defaultValue="overview">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="models">Model Performance</TabsTrigger>
            <TabsTrigger value="esg">ESG Report</TabsTrigger>
            <TabsTrigger value="regional">Regional Impact</TabsTrigger>
          </TabsList>

          {/* Overview */}
          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Monthly Simulations</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                    <XAxis dataKey="month" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <Tooltip contentStyle={CHART_STYLE} />
                    <Bar dataKey="simulations" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} name="Simulations" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Cumulative CO₂ Insights</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={monthlyData}>
                    <defs>
                      <linearGradient id="co2AnalyticsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(190, 80%, 45%)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(190, 80%, 45%)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                    <XAxis dataKey="month" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <Tooltip contentStyle={CHART_STYLE} />
                    <Area type="monotone" dataKey="co2Saved" stroke="hsl(190, 80%, 45%)" fill="url(#co2AnalyticsGrad)" name="CO₂ (kg)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Category Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={categoryDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={3} label={({ name, value }) => `${name} ${value}%`}>
                      {categoryDist.map((_, idx) => (
                        <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">User Growth</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                    <XAxis dataKey="month" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <Tooltip contentStyle={CHART_STYLE} />
                    <Legend />
                    <Line type="monotone" dataKey="users" stroke="hsl(280, 65%, 60%)" strokeWidth={2} name="Users" dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="reports" stroke="hsl(45, 93%, 58%)" strokeWidth={2} name="Reports" dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </TabsContent>

          {/* Model Performance */}
          <TabsContent value="models" className="mt-6 space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Model Performance Overview</h3>
              <div className="space-y-4">
                {modelPerf.map((m, i) => (
                  <div key={m.model} className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="font-medium">{m.model}</span>
                        <span className="text-xs text-muted-foreground ml-2">({m.type})</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-muted-foreground">Train: {m.trainTime}</span>
                        <span className="text-primary font-medium">{m.accuracy}% accuracy</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-secondary overflow-hidden mb-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.accuracy}%` }}
                        transition={{ delay: i * 0.2, duration: 0.8 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: COLORS[i] }}
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div className="text-center p-1.5 rounded bg-secondary/80">
                        <span className="text-muted-foreground">F1:</span> <span className="font-bold">{m.f1}</span>
                      </div>
                      <div className="text-center p-1.5 rounded bg-secondary/80">
                        <span className="text-muted-foreground">Prec:</span> <span className="font-bold">{m.precision}</span>
                      </div>
                      <div className="text-center p-1.5 rounded bg-secondary/80">
                        <span className="text-muted-foreground">Recall:</span> <span className="font-bold">{m.recall}</span>
                      </div>
                      <div className="text-center p-1.5 rounded bg-secondary/80">
                        <span className="text-muted-foreground">Acc:</span> <span className="font-bold">{m.accuracy}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ESG Report */}
          <TabsContent value="esg" className="mt-6 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-lg font-semibold">ESG Readiness Summary</h3>
              <Button className="bg-gradient-eco text-primary-foreground font-semibold shadow-glow hover:opacity-90" size="sm">
                <Download className="mr-2 h-4 w-4" /> Export ESG Report
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {esgMetrics.map((e, i) => (
                <div key={e.category} className="glass-card p-6">
                  <div className="text-center mb-4">
                    <div className="font-display text-4xl font-bold" style={{ color: COLORS[i] }}>{e.score}</div>
                    <div className="text-sm text-muted-foreground">{e.category} Score</div>
                  </div>
                  <div className="mb-4">
                    <div className="h-2 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${e.score}%` }}
                        transition={{ duration: 1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: COLORS[i] }}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    {e.items.map((item) => (
                      <div key={item} className="text-xs text-muted-foreground flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Regional */}
          <TabsContent value="regional" className="mt-6 space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Impact by Region</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={impactByRegion}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                  <XAxis dataKey="region" stroke="hsl(220, 10%, 55%)" fontSize={11} />
                  <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Legend />
                  <Bar dataKey="co2" fill={COLORS[0]} name="CO₂ (kg)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="water" fill={COLORS[1]} name="Water (L)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="products" fill={COLORS[2]} name="Products" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
