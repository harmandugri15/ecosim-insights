import { motion } from "framer-motion";
import { ArrowRight, Leaf, Zap, Shield, GitCompare, BarChart3, Brain } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: BarChart3,
    title: "Lifecycle Simulation",
    desc: "Monte Carlo simulation across extraction, manufacturing, transport, usage & disposal phases.",
  },
  {
    icon: Brain,
    title: "ML-Powered Predictions",
    desc: "XGBoost & LSTM models predict CO₂ emissions, e-waste risk, and degradation timelines.",
  },
  {
    icon: Shield,
    title: "Greenwash Detection",
    desc: "NLP-based classifier detects misleading sustainability claims with trust scoring.",
  },
  {
    icon: GitCompare,
    title: "Scenario Comparison",
    desc: "Side-by-side comparison of products, materials, and energy configurations.",
  },
  {
    icon: Zap,
    title: "Real-Time Analytics",
    desc: "Interactive dashboards with confidence intervals, SHAP explainability & feature importance.",
  },
  {
    icon: Leaf,
    title: "ESG-Ready Reports",
    desc: "Export Scope 1/2/3 reports, lifecycle summaries, and Power BI-compatible datasets.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: "easeOut" as const },
  }),
};

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-24 eco-grid-bg">
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-10 right-1/4 w-72 h-72 rounded-full bg-accent/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

        <div className="container relative">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium">
              <Zap className="h-3.5 w-3.5" />
              ML-Powered Environmental Intelligence
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
              Simulate Your
              <br />
              <span className="text-gradient-eco">Environmental Impact</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              EcoSim uses machine learning to predict lifecycle carbon emissions, e-waste risk,
              and detect greenwashing — empowering data-driven sustainability decisions.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/simulate">
                <Button size="lg" className="bg-gradient-eco text-primary-foreground font-semibold px-8 shadow-glow hover:opacity-90 transition-opacity">
                  Start Simulation
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/compare">
                <Button size="lg" variant="outline" className="border-border hover:bg-secondary">
                  Compare Scenarios
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              { value: "6", label: "ML Models" },
              { value: "12+", label: "Impact Metrics" },
              { value: "5", label: "Lifecycle Phases" },
              { value: "Azure", label: "Cloud Ready" },
            ].map((s) => (
              <div key={s.label} className="glass-card p-4 text-center">
                <div className="font-display text-2xl font-bold text-gradient-eco">{s.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Comprehensive <span className="text-gradient-eco">Impact Analysis</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From raw material extraction to disposal — every phase modeled with ML precision.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="glass-card p-6 group hover:glow-border transition-all duration-300"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-24 border-t border-border/50">
        <div className="container">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto glass-card p-8 md:p-12"
          >
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6 text-center">
              Azure-Ready <span className="text-gradient-eco">Architecture</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              {[
                { label: "Frontend", items: ["React + TailwindCSS", "Recharts Dashboards", "Framer Motion"] },
                { label: "ML Layer", items: ["XGBoost Regressor", "LSTM Degradation", "DistilBERT NLP"] },
                { label: "Cloud", items: ["Azure App Service", "Azure ML Studio", "Cosmos DB / PostgreSQL"] },
              ].map((col) => (
                <div key={col.label} className="space-y-3">
                  <div className="text-primary font-display font-semibold text-lg">{col.label}</div>
                  {col.items.map((item) => (
                    <div key={item} className="text-sm text-muted-foreground bg-secondary/50 rounded-lg py-2 px-3">
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Leaf className="h-4 w-4 text-primary" />
            <span className="font-display font-semibold text-foreground">EcoSim</span>
            <span>— Intelligent Environmental Simulation</span>
          </div>
          <div>Built for Microsoft Hackathon 2025</div>
        </div>
      </footer>
    </div>
  );
}
