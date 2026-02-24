import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  color?: "green" | "cyan" | "amber" | "purple" | "red";
}

const colorMap = {
  green: "text-eco-green bg-eco-green/10 border-eco-green/20",
  cyan: "text-eco-cyan bg-eco-cyan/10 border-eco-cyan/20",
  amber: "text-eco-amber bg-eco-amber/10 border-eco-amber/20",
  purple: "text-eco-purple bg-eco-purple/10 border-eco-purple/20",
  red: "text-destructive bg-destructive/10 border-destructive/20",
};

export default function MetricCard({ label, value, unit, icon, color = "green" }: MetricCardProps) {
  const c = colorMap[color];
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card p-5 border ${c.split(" ").slice(2).join(" ")}`}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className={`p-2 rounded-lg ${c.split(" ").slice(1, 2).join(" ")}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span className={`font-display text-3xl font-bold ${c.split(" ")[0]}`}>{value}</span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
    </motion.div>
  );
}
