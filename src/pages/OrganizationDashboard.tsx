import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";
import {
  Building2, Upload, FileSpreadsheet, TrendingDown, Leaf, Factory,
  Truck, Zap, BarChart3, Download, CheckCircle, AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import MetricCard from "@/components/MetricCard";

const COLORS = ["hsl(160, 84%, 39%)", "hsl(190, 80%, 45%)", "hsl(45, 93%, 58%)", "hsl(280, 65%, 60%)", "hsl(0, 72%, 51%)"];
const CHART_STYLE = { background: "hsl(220, 18%, 10%)", border: "1px solid hsl(220, 14%, 18%)", borderRadius: 8 };

// Simulated organization data
const orgProducts = [
  { id: 1, name: "ProBook X1 Laptop", category: "laptop", co2: 420, water: 1470, ewaste: "Medium", recycling: 62, status: "analyzed" },
  { id: 2, name: "SmartWatch S3", category: "smartphone", co2: 85, water: 272, ewaste: "High", recycling: 38, status: "analyzed" },
  { id: 3, name: "GreenPack Box (L)", category: "packaging", co2: 8, water: 12, ewaste: "Low", recycling: 85, status: "analyzed" },
  { id: 4, name: "EcoDesk Standing", category: "furniture", co2: 245, water: 686, ewaste: "Low", recycling: 71, status: "analyzed" },
  { id: 5, name: "PowerWash Appliance", category: "appliance", co2: 610, water: 1952, ewaste: "Medium", recycling: 55, status: "analyzed" },
  { id: 6, name: "CloudServer Rack", category: "appliance", co2: 890, water: 2848, ewaste: "High", recycling: 42, status: "pending" },
  { id: 7, name: "BioFiber T-Shirt", category: "clothing", co2: 32, water: 272, ewaste: "Low", recycling: 60, status: "analyzed" },
  { id: 8, name: "EV Fleet Model Y", category: "electric vehicle", co2: 9200, water: 38640, ewaste: "High", recycling: 28, status: "analyzed" },
];

const scopeData = {
  scope1: { value: 4250, label: "Scope 1 (Direct)", desc: "Direct emissions from owned/controlled sources", color: COLORS[0] },
  scope2: { value: 8900, label: "Scope 2 (Indirect Energy)", desc: "Indirect emissions from purchased electricity", color: COLORS[1] },
  scope3: { value: 22400, label: "Scope 3 (Value Chain)", desc: "All other indirect emissions", color: COLORS[2] },
};

const monthlyScope = [
  { month: "Jul", scope1: 650, scope2: 1400, scope3: 3500 },
  { month: "Aug", scope1: 620, scope2: 1380, scope3: 3450 },
  { month: "Sep", scope1: 580, scope2: 1350, scope3: 3800 },
  { month: "Oct", scope1: 560, scope2: 1300, scope3: 3600 },
  { month: "Nov", scope1: 530, scope2: 1250, scope3: 3400 },
  { month: "Dec", scope1: 510, scope2: 1220, scope3: 3650 },
];

const categoryBreakdown = [
  { name: "Electronics", co2: 1395, products: 3, percentage: 40 },
  { name: "Transport", co2: 9200, products: 1, percentage: 26 },
  { name: "Appliances", co2: 1500, products: 2, percentage: 17 },
  { name: "Furniture", co2: 245, products: 1, percentage: 7 },
  { name: "Packaging", co2: 8, products: 1, percentage: 5 },
  { name: "Clothing", co2: 32, products: 1, percentage: 5 },
];

const totalScope = scopeData.scope1.value + scopeData.scope2.value + scopeData.scope3.value;

export default function OrganizationDashboard() {
  const [uploadStatus, setUploadStatus] = useState<"idle" | "uploading" | "done">("idle");

  const handleBulkUpload = async () => {
    setUploadStatus("uploading");
    await new Promise((r) => setTimeout(r, 2000));
    setUploadStatus("done");
    setTimeout(() => setUploadStatus("idle"), 3000);
  };

  return (
    <div className="min-h-screen pt-20 pb-12 eco-grid-bg">
      <div className="container">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3 mb-2">
            <Building2 className="h-8 w-8 text-primary" />
            <h1 className="font-display text-3xl md:text-4xl font-bold">
              Organization <span className="text-gradient-eco">Dashboard</span>
            </h1>
          </div>
          <p className="text-muted-foreground mb-8">B2B ESG reporting with Scope 1/2/3 estimation, bulk product analysis, and compliance tracking.</p>
        </motion.div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Total CO₂e" value={`${(totalScope / 1000).toFixed(1)}K`} unit="tons" icon={<Leaf className="h-4 w-4" />} color="green" />
          <MetricCard label="Products Tracked" value={orgProducts.length} icon={<BarChart3 className="h-4 w-4" />} color="cyan" />
          <MetricCard label="Avg Recycling" value={Math.round(orgProducts.reduce((a, p) => a + p.recycling, 0) / orgProducts.length)} unit="%" icon={<TrendingDown className="h-4 w-4" />} color="amber" />
          <MetricCard label="High Risk Items" value={orgProducts.filter((p) => p.ewaste === "High").length} icon={<AlertTriangle className="h-4 w-4" />} color="red" />
        </div>

        <Tabs defaultValue="esg">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="esg">ESG Summary</TabsTrigger>
            <TabsTrigger value="products">Product Portfolio</TabsTrigger>
            <TabsTrigger value="scope">Scope Analysis</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          </TabsList>

          {/* ESG Summary */}
          <TabsContent value="esg" className="mt-6 space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {Object.entries(scopeData).map(([key, scope]) => (
                <div key={key} className="glass-card p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {key === "scope1" ? <Factory className="h-5 w-5" style={{ color: scope.color }} /> :
                     key === "scope2" ? <Zap className="h-5 w-5" style={{ color: scope.color }} /> :
                     <Truck className="h-5 w-5" style={{ color: scope.color }} />}
                    <h3 className="font-display text-sm font-semibold">{scope.label}</h3>
                  </div>
                  <div className="font-display text-3xl font-bold mb-1" style={{ color: scope.color }}>
                    {scope.value.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground mb-3">tons CO₂e</div>
                  <Progress value={(scope.value / totalScope) * 100} className="h-2 mb-2" />
                  <div className="text-xs text-muted-foreground">{scope.desc}</div>
                  <div className="text-xs font-medium mt-1">{Math.round((scope.value / totalScope) * 100)}% of total emissions</div>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Emission Scope Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(scopeData).map(([_, s]) => ({ name: s.label, value: s.value }))}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      label={({ name, value }) => `${name.split(" ")[0]} ${name.split(" ")[1]}: ${(value / 1000).toFixed(1)}K`}
                    >
                      {Object.values(scopeData).map((s, i) => (
                        <Cell key={i} fill={s.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CHART_STYLE} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="glass-card p-6">
                <h3 className="font-display text-lg font-semibold mb-4">Category CO₂ Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={categoryBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                    <XAxis dataKey="name" stroke="hsl(220, 10%, 55%)" fontSize={11} />
                    <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <Tooltip contentStyle={CHART_STYLE} />
                    <Bar dataKey="co2" fill="hsl(160, 84%, 39%)" radius={[4, 4, 0, 0]} name="CO₂ (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-semibold">ESG Compliance Summary</h3>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Export ESG Report
                </Button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "GHG Protocol", status: "Aligned", ok: true },
                  { label: "ISO 14040/14044", status: "Framework Applied", ok: true },
                  { label: "Science Based Targets", status: "Pending Review", ok: false },
                  { label: "CDP Disclosure", status: "Data Ready", ok: true },
                ].map((c) => (
                  <div key={c.label} className="p-4 rounded-lg bg-secondary/50 border border-border/50">
                    <div className="flex items-center gap-2 mb-1">
                      {c.ok ? <CheckCircle className="h-4 w-4 text-primary" /> : <AlertTriangle className="h-4 w-4 text-eco-amber" />}
                      <span className="text-sm font-medium">{c.label}</span>
                    </div>
                    <span className={`text-xs ${c.ok ? "text-primary" : "text-eco-amber"}`}>{c.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Products */}
          <TabsContent value="products" className="mt-6">
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold">Product Portfolio ({orgProducts.length} products)</h3>
                <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Export CSV</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50 bg-secondary/30">
                      <th className="text-left p-3 font-medium text-muted-foreground">Product</th>
                      <th className="text-left p-3 font-medium text-muted-foreground">Category</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">CO₂ (kg)</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Water (L)</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">E-Waste Risk</th>
                      <th className="text-right p-3 font-medium text-muted-foreground">Recycling %</th>
                      <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgProducts.map((p) => (
                      <tr key={p.id} className="border-b border-border/30 hover:bg-secondary/20 transition-colors">
                        <td className="p-3 font-medium">{p.name}</td>
                        <td className="p-3 text-muted-foreground capitalize">{p.category}</td>
                        <td className="p-3 text-right">{p.co2.toLocaleString()}</td>
                        <td className="p-3 text-right">{p.water.toLocaleString()}</td>
                        <td className="p-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            p.ewaste === "High" ? "bg-destructive/20 text-destructive" :
                            p.ewaste === "Medium" ? "bg-eco-amber/20 text-eco-amber" :
                            "bg-primary/20 text-primary"
                          }`}>
                            {p.ewaste}
                          </span>
                        </td>
                        <td className="p-3 text-right">{p.recycling}%</td>
                        <td className="p-3 text-center">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            p.status === "analyzed" ? "bg-primary/20 text-primary" : "bg-eco-amber/20 text-eco-amber"
                          }`}>
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* Scope Analysis */}
          <TabsContent value="scope" className="mt-6 space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Monthly Scope Emissions Trend</h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={monthlyScope}>
                  <defs>
                    <linearGradient id="s1Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[0]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS[0]} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="s2Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[1]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS[1]} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="s3Grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS[2]} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS[2]} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                  <XAxis dataKey="month" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                  <Tooltip contentStyle={CHART_STYLE} />
                  <Legend />
                  <Area type="monotone" dataKey="scope1" stroke={COLORS[0]} fill="url(#s1Grad)" name="Scope 1" strokeWidth={2} />
                  <Area type="monotone" dataKey="scope2" stroke={COLORS[1]} fill="url(#s2Grad)" name="Scope 2" strokeWidth={2} />
                  <Area type="monotone" dataKey="scope3" stroke={COLORS[2]} fill="url(#s3Grad)" name="Scope 3" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-6">
              <h3 className="font-display text-lg font-semibold mb-4">Reduction Targets vs Actual</h3>
              <div className="space-y-4">
                {[
                  { scope: "Scope 1", target: 30, actual: 22, year: "2030" },
                  { scope: "Scope 2", target: 50, actual: 35, year: "2030" },
                  { scope: "Scope 3", target: 25, actual: 12, year: "2035" },
                ].map((t) => (
                  <div key={t.scope} className="p-4 rounded-lg bg-secondary/50">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-medium">{t.scope} Reduction Target ({t.year})</span>
                      <span className="text-muted-foreground">{t.actual}% / {t.target}%</span>
                    </div>
                    <div className="relative h-3 rounded-full bg-secondary overflow-hidden">
                      <div className="absolute inset-y-0 left-0 bg-primary/30 rounded-full" style={{ width: `${t.target}%` }} />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${t.actual}%` }}
                        transition={{ duration: 1 }}
                        className="absolute inset-y-0 left-0 bg-primary rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Bulk Upload */}
          <TabsContent value="bulk" className="mt-6">
            <div className="glass-card p-8 text-center">
              <Upload className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">Bulk Product Upload</h3>
              <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
                Upload a CSV file with your product portfolio for batch environmental impact analysis.
                Required columns: product_name, category, manufacturing_country, energy_source.
              </p>
              <div className="flex flex-col items-center gap-4">
                <Button
                  onClick={handleBulkUpload}
                  disabled={uploadStatus === "uploading"}
                  className="bg-gradient-eco text-primary-foreground font-semibold shadow-glow hover:opacity-90"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  {uploadStatus === "uploading" ? "Processing..." : uploadStatus === "done" ? "Upload Complete!" : "Upload CSV File"}
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" /> Download Template
                </Button>
              </div>
              {uploadStatus === "uploading" && (
                <div className="mt-6 max-w-md mx-auto">
                  <Progress value={65} className="h-2 mb-2" />
                  <p className="text-xs text-muted-foreground">Analyzing products with ML models...</p>
                </div>
              )}
              {uploadStatus === "done" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6">
                  <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-primary font-medium">8 products analyzed successfully</p>
                </motion.div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
