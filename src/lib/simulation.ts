// Simulated ML prediction utilities for EcoSim MVP
// In production, these would call Azure ML endpoints

export interface SimulationInput {
  productCategory: string;
  materials: { name: string; percentage: number }[];
  manufacturingCountry: string;
  usageCountry: string;
  energySource: string;
  lifespanYears: number;
  usageFrequency: string;
  transportDistance: number;
}

export interface SimulationResult {
  totalCO2: number;
  annualBreakdown: { year: number; co2: number; water: number; waste: number }[];
  waterFootprint: number;
  resourceDepletion: number;
  landfillMass: number;
  recyclingProbability: number;
  eWasteRisk: "Low" | "Medium" | "High";
  eWasteScore: number;
  confidenceScore: number;
  lifecyclePhases: { phase: string; co2: number; water: number; percentage: number }[];
}

export interface GreenwashResult {
  trustScore: number;
  riskLevel: "Low" | "Medium" | "High";
  suspiciousPhrases: { text: string; reason: string; severity: number }[];
  summary: string;
}

// Seeded random for deterministic-ish results
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

const energyMultiplier: Record<string, number> = {
  coal: 1.8,
  "natural gas": 1.2,
  mixed: 1.0,
  solar: 0.3,
  wind: 0.25,
  nuclear: 0.35,
  hydro: 0.28,
};

const categoryBaseCO2: Record<string, number> = {
  smartphone: 70,
  laptop: 350,
  "electric vehicle": 8000,
  clothing: 25,
  furniture: 200,
  appliance: 500,
  packaging: 5,
  building: 15000,
};

export function runSimulation(input: SimulationInput): SimulationResult {
  const seed = input.productCategory.length * 1000 + input.lifespanYears * 100 + input.transportDistance;
  const rng = seededRandom(seed);

  const baseCO2 = categoryBaseCO2[input.productCategory] || 150;
  const eMult = energyMultiplier[input.energySource] || 1.0;
  const transportCO2 = input.transportDistance * 0.05;
  const freqMult = input.usageFrequency === "daily" ? 1.5 : input.usageFrequency === "weekly" ? 1.0 : 0.6;

  const totalCO2 = Math.round((baseCO2 * eMult + transportCO2) * freqMult * (1 + rng() * 0.2));

  const phases = [
    { phase: "Raw Materials", pct: 0.15 + rng() * 0.05 },
    { phase: "Manufacturing", pct: 0.35 + rng() * 0.1 },
    { phase: "Transportation", pct: 0.05 + rng() * 0.05 },
    { phase: "Usage", pct: 0.30 + rng() * 0.1 },
    { phase: "Disposal", pct: 0 },
  ];
  const sumPct = phases.slice(0, 4).reduce((a, p) => a + p.pct, 0);
  phases[4].pct = 1 - sumPct;

  const lifecyclePhases = phases.map((p) => ({
    phase: p.phase,
    co2: Math.round(totalCO2 * p.pct),
    water: Math.round(totalCO2 * p.pct * (2 + rng() * 3)),
    percentage: Math.round(p.pct * 100),
  }));

  const annualBreakdown = Array.from({ length: input.lifespanYears }, (_, i) => {
    const degradation = 1 + i * 0.08 * (1 + rng() * 0.3);
    return {
      year: i + 1,
      co2: Math.round((totalCO2 / input.lifespanYears) * degradation),
      water: Math.round((totalCO2 / input.lifespanYears) * degradation * 2.5),
      waste: Math.round(rng() * 5 + i * 2),
    };
  });

  const eWasteScore = Math.round((rng() * 40 + (input.productCategory === "smartphone" ? 50 : input.productCategory === "laptop" ? 40 : 20)));
  const eWasteRisk: "Low" | "Medium" | "High" = eWasteScore > 65 ? "High" : eWasteScore > 35 ? "Medium" : "Low";

  return {
    totalCO2,
    annualBreakdown,
    waterFootprint: Math.round(totalCO2 * 3.2),
    resourceDepletion: Math.round(rng() * 40 + 30),
    landfillMass: Math.round(totalCO2 * 0.02 * 10) / 10,
    recyclingProbability: Math.round(rng() * 50 + 25),
    eWasteRisk,
    eWasteScore,
    confidenceScore: Math.round(82 + rng() * 15),
    lifecyclePhases,
  };
}

const suspiciousPatterns = [
  { pattern: /100% sustainable/i, reason: "Absolute sustainability claim without evidence", severity: 0.9 },
  { pattern: /eco-friendly/i, reason: "Vague terminology without measurable metrics", severity: 0.6 },
  { pattern: /carbon neutral/i, reason: "May rely on unverified offsets", severity: 0.7 },
  { pattern: /green/i, reason: "Generic 'green' claim without specifics", severity: 0.4 },
  { pattern: /natural/i, reason: "'Natural' does not equal sustainable", severity: 0.5 },
  { pattern: /zero emissions?/i, reason: "Zero emission claim requires full lifecycle verification", severity: 0.85 },
  { pattern: /biodegradable/i, reason: "Biodegradability depends on conditions not specified", severity: 0.55 },
  { pattern: /clean energy/i, reason: "Clean energy claim needs source verification", severity: 0.5 },
  { pattern: /planet-friendly/i, reason: "Unsubstantiated broad claim", severity: 0.65 },
  { pattern: /responsibly sourced/i, reason: "No certification or audit referenced", severity: 0.6 },
];

export function analyzeGreenwashing(text: string): GreenwashResult {
  const found: GreenwashResult["suspiciousPhrases"] = [];

  for (const sp of suspiciousPatterns) {
    const match = text.match(sp.pattern);
    if (match) {
      found.push({ text: match[0], reason: sp.reason, severity: sp.severity });
    }
  }

  const avgSeverity = found.length > 0 ? found.reduce((a, f) => a + f.severity, 0) / found.length : 0;
  const trustScore = Math.round(Math.max(10, 100 - avgSeverity * 80 - found.length * 8));
  const riskLevel: "Low" | "Medium" | "High" = trustScore > 70 ? "Low" : trustScore > 40 ? "Medium" : "High";

  return {
    trustScore,
    riskLevel,
    suspiciousPhrases: found,
    summary:
      found.length === 0
        ? "No significant greenwashing indicators detected. Claims appear measured and specific."
        : `Detected ${found.length} potentially misleading claim(s). Review flagged phrases for unsupported or vague environmental language.`,
  };
}
