import { describe, it, expect } from "vitest";
import {
  runSimulation,
  analyzeGreenwashing,
  getCategoryMaterials,
  PRODUCT_CATEGORIES,
  ENERGY_SOURCES,
  COUNTRIES,
  type SimulationInput,
} from "@/lib/simulation";

const defaultInput: SimulationInput = {
  productCategory: "smartphone",
  materials: [],
  manufacturingCountry: "China",
  usageCountry: "US",
  energySource: "mixed",
  lifespanYears: 5,
  usageFrequency: "daily",
  transportDistance: 2000,
};

describe("Simulation Engine", () => {
  it("should return a valid result with all required fields", () => {
    const result = runSimulation(defaultInput);

    expect(result.totalCO2).toBeGreaterThan(0);
    expect(result.waterFootprint).toBeGreaterThan(0);
    expect(result.landfillMass).toBeGreaterThanOrEqual(0);
    expect(result.resourceDepletion).toBeGreaterThan(0);
    expect(result.recyclingProbability).toBeGreaterThan(0);
    expect(result.recyclingProbability).toBeLessThanOrEqual(100);
    expect(result.confidenceScore).toBeGreaterThan(0);
    expect(result.confidenceScore).toBeLessThanOrEqual(100);
    expect(["Low", "Medium", "High"]).toContain(result.eWasteRisk);
    expect(result.eWasteScore).toBeGreaterThanOrEqual(0);
  });

  it("should produce annual breakdown matching lifespan years", () => {
    const result = runSimulation({ ...defaultInput, lifespanYears: 7 });
    expect(result.annualBreakdown).toHaveLength(7);
    result.annualBreakdown.forEach((yr, i) => {
      expect(yr.year).toBe(i + 1);
      expect(yr.co2).toBeGreaterThan(0);
      expect(yr.water).toBeGreaterThan(0);
      expect(yr.ci_low).toBeLessThanOrEqual(yr.co2);
      expect(yr.ci_high).toBeGreaterThanOrEqual(yr.co2);
    });
  });

  it("should have 5 lifecycle phases summing to ~100%", () => {
    const result = runSimulation(defaultInput);
    expect(result.lifecyclePhases).toHaveLength(5);
    const totalPct = result.lifecyclePhases.reduce((sum, p) => sum + p.percentage, 0);
    expect(totalPct).toBeGreaterThanOrEqual(95);
    expect(totalPct).toBeLessThanOrEqual(105);
  });

  it("should include Monte Carlo results", () => {
    const result = runSimulation(defaultInput);
    expect(result.monteCarlo.length).toBe(200);
    result.monteCarlo.forEach((m) => {
      expect(m.co2).toBeGreaterThanOrEqual(0);
      expect(m.water).toBeGreaterThanOrEqual(0);
    });
  });

  it("should include SHAP values sorted by importance", () => {
    const result = runSimulation(defaultInput);
    expect(result.shapValues.length).toBeGreaterThan(0);
    for (let i = 1; i < result.shapValues.length; i++) {
      expect(result.shapValues[i - 1].importance).toBeGreaterThanOrEqual(result.shapValues[i].importance);
    }
    result.shapValues.forEach((s) => {
      expect(["positive", "negative"]).toContain(s.direction);
      expect(s.importance).toBeGreaterThan(0);
    });
  });

  it("should include degradation timeline", () => {
    const result = runSimulation(defaultInput);
    expect(result.degradationTimeline.length).toBeGreaterThan(0);
    const first = result.degradationTimeline[0];
    expect(first.efficiency).toBeGreaterThan(50);
    expect(first.materialIntegrity).toBeGreaterThan(50);
  });

  it("should include cross-validation with 5 folds", () => {
    const result = runSimulation(defaultInput);
    expect(result.crossValidation).toHaveLength(5);
    result.crossValidation.forEach((cv) => {
      expect(cv.r2).toBeGreaterThan(0);
      expect(cv.r2).toBeLessThanOrEqual(1);
      expect(cv.rmse).toBeGreaterThan(0);
    });
  });

  it("should include model metrics", () => {
    const result = runSimulation(defaultInput);
    expect(result.modelMetrics.accuracy).toBeGreaterThan(0.5);
    expect(result.modelMetrics.f1).toBeGreaterThan(0.5);
    expect(result.modelMetrics.auc).toBeGreaterThan(0.5);
  });

  it("should include e-waste detail", () => {
    const result = runSimulation(defaultInput);
    expect(result.eWasteDetail).toBeDefined();
    expect(result.eWasteDetail.repairabilityScore).toBeGreaterThan(0);
    expect(result.eWasteDetail.softwareSupportYears).toBeGreaterThan(0);
    expect(result.eWasteDetail.probability).toBeGreaterThan(0);
    expect(result.eWasteDetail.probability).toBeLessThanOrEqual(1);
    expect(["None", "Moderate", "High"]).toContain(result.eWasteDetail.batteryRisk);
  });

  it("should produce higher CO2 for coal vs solar energy", () => {
    const coal = runSimulation({ ...defaultInput, energySource: "coal" });
    const solar = runSimulation({ ...defaultInput, energySource: "solar" });
    expect(coal.totalCO2).toBeGreaterThan(solar.totalCO2);
  });

  it("should produce deterministic results for same input", () => {
    const r1 = runSimulation(defaultInput);
    const r2 = runSimulation(defaultInput);
    expect(r1.totalCO2).toBe(r2.totalCO2);
    expect(r1.waterFootprint).toBe(r2.waterFootprint);
  });

  it("should work for all product categories", () => {
    PRODUCT_CATEGORIES.forEach((cat) => {
      const result = runSimulation({ ...defaultInput, productCategory: cat });
      expect(result.totalCO2).toBeGreaterThan(0);
    });
  });

  it("should work for all energy sources", () => {
    ENERGY_SOURCES.forEach((src) => {
      const result = runSimulation({ ...defaultInput, energySource: src });
      expect(result.totalCO2).toBeGreaterThan(0);
    });
  });
});

describe("getCategoryMaterials", () => {
  it("should return materials for known categories", () => {
    const materials = getCategoryMaterials("smartphone");
    expect(materials.length).toBeGreaterThan(0);
    const totalPct = materials.reduce((s, m) => s + m.percentage, 0);
    expect(totalPct).toBe(100);
  });

  it("should return default materials for unknown category", () => {
    const materials = getCategoryMaterials("unknown");
    expect(materials.length).toBe(1);
    expect(materials[0].name).toBe("Mixed");
  });
});

describe("Greenwashing Analysis", () => {
  it("should detect suspicious phrases in greenwash text", () => {
    const result = analyzeGreenwashing("Our product is 100% sustainable and eco-friendly with zero emissions.");
    expect(result.suspiciousPhrases.length).toBeGreaterThan(0);
    expect(result.trustScore).toBeLessThan(50);
    expect(result.riskLevel).toBe("High");
  });

  it("should give higher trust to evidence-based text", () => {
    const result = analyzeGreenwashing(
      "Our ISO 14064-1 certified process reduces CO₂ by 23% versus 2020 baseline. Scope 1 emissions: 12,400 tons CO₂e."
    );
    expect(result.trustScore).toBeGreaterThan(50);
    expect(result.detailedAnalysis.evidenceScore).toBeGreaterThan(30);
  });

  it("should categorize suspicious phrases", () => {
    const result = analyzeGreenwashing("We are carbon neutral and eco-friendly with natural biodegradable materials.");
    result.suspiciousPhrases.forEach((sp) => {
      expect(["vague", "unsupported", "misleading", "missing_metrics"]).toContain(sp.category);
      expect(sp.suggestion.length).toBeGreaterThan(0);
    });
  });

  it("should include detailed analysis scores", () => {
    const result = analyzeGreenwashing("Some text about sustainability.");
    expect(result.detailedAnalysis.vaguenessScore).toBeDefined();
    expect(result.detailedAnalysis.evidenceScore).toBeDefined();
    expect(result.detailedAnalysis.specificityScore).toBeDefined();
    expect(result.detailedAnalysis.transparencyScore).toBeDefined();
  });

  it("should include word cloud", () => {
    const result = analyzeGreenwashing("Our sustainable green eco-friendly product uses natural materials for a clean planet-friendly solution.");
    expect(result.wordCloud.length).toBeGreaterThan(0);
    const suspicious = result.wordCloud.filter((w) => w.suspicious);
    expect(suspicious.length).toBeGreaterThan(0);
  });

  it("should include sentiment breakdown", () => {
    const result = analyzeGreenwashing("Test text for analysis.");
    expect(result.sentimentBreakdown.length).toBe(5);
    result.sentimentBreakdown.forEach((s) => {
      expect(s.value).toBeGreaterThanOrEqual(0);
      expect(s.value).toBeLessThanOrEqual(100);
    });
  });
});

describe("Constants", () => {
  it("should export valid product categories", () => {
    expect(PRODUCT_CATEGORIES.length).toBeGreaterThan(0);
    expect(PRODUCT_CATEGORIES).toContain("smartphone");
    expect(PRODUCT_CATEGORIES).toContain("laptop");
  });

  it("should export valid energy sources", () => {
    expect(ENERGY_SOURCES.length).toBeGreaterThan(0);
    expect(ENERGY_SOURCES).toContain("solar");
    expect(ENERGY_SOURCES).toContain("coal");
  });

  it("should export valid countries", () => {
    expect(COUNTRIES.length).toBeGreaterThan(0);
    expect(COUNTRIES).toContain("US");
    expect(COUNTRIES).toContain("China");
  });
});
