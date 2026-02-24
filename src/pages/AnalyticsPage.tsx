import { motion } from "framer-motion";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { FileText, TrendingUp, Users, Activity } from "lucide-react";
import MetricCard from "@/components/MetricCard";

const monthlyData = [
  { month: "Jan", simulations: 124, co2Saved: 3200 },
  { month: "Feb", simulations: 156, co2Saved: 4100 },
  { month: "Mar", simulations: 198, co2Saved: 5400 },
  { month: "Apr", simulations: 243, co2Saved: 6800 },
  { month: "May", simulations: 287, co2Saved: 7900 },
  { month: "Jun", simulations: 342, co2Saved: 9200 },
];

const categoryDist = [
  { name: "Electronics", value: 42 },
  { name: "Transport", value: 28 },
  { name: "Clothing", value: 15 },
  { name: "Furniture", value: 10 },
  { name: "Other", value: 5 },
];

const modelPerf = [
  { model: "CO₂ Regressor", accuracy: 94, f1: 0.91 },
  { model: "E-Waste Classifier", accuracy: 89, f1: 0.87 },
  { model: "Greenwash NLP", accuracy: 92, f1: 0.90 },
  { model: "Degradation LSTM", accuracy: 86, f1: 0.83 },
];

const COLORS = ["hsl(160, 84%, 39%)", "hsl(190, 80%, 45%)", "hsl(45, 93%, 58%)", "hsl(280, 65%, 60%)", "hsl(0, 72%, 51%)"];

export default function AnalyticsPage() {
  return (
    <div className="min-h-screen pt-20 pb-12 eco-grid-bg">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">
            Analytics & <span className="text-gradient-eco">Reports</span>
          </h1>
          <p className="text-muted-foreground mb-8">Platform usage metrics and model performance monitoring.</p>
        </motion.div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total Simulations" value="1,350" icon={<Activity className="h-4 w-4" />} color="green" />
          <MetricCard label="CO₂ Insights" value="36.6K" unit="kg" icon={<TrendingUp className="h-4 w-4" />} color="cyan" />
          <MetricCard label="Active Users" value="284" icon={<Users className="h-4 w-4" />} color="purple" />
          <MetricCard label="Reports Generated" value="89" icon={<FileText className="h-4 w-4" />} color="amber" />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-8">
          {/* Monthly simulations */}
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Monthly Simulations</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="month" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 }} />
                <Bar dataKey="simulations" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} name="Simulations" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* CO₂ saved trend */}
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Cumulative CO₂ Insights</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="month" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="co2Saved" stroke="hsl(190, 80%, 45%)" strokeWidth={2} dot={{ fill: "hsl(190, 80%, 45%)" }} name="CO₂ (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category distribution */}
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Category Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryDist} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={55} paddingAngle={3} label={({ name, value }) => `${name} ${value}%`}>
                  {categoryDist.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Model performance */}
          <div className="glass-card p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Model Performance</h3>
            <div className="space-y-4">
              {modelPerf.map((m, i) => (
                <div key={m.model} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground font-medium">{m.model}</span>
                    <span className="text-muted-foreground">Accuracy: {m.accuracy}% | F1: {m.f1}</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.accuracy}%` }}
                      transition={{ delay: i * 0.2, duration: 0.8 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: COLORS[i] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
