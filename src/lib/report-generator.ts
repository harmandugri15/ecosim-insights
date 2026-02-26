// PDF Report Generation for EcoSim
import jsPDF from "jspdf";
import type { SimulationResult, SimulationInput } from "./simulation";

export function generatePDFReport(input: SimulationInput, result: SimulationResult): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  const addLine = (text: string, size = 11, style: "normal" | "bold" = "normal") => {
    doc.setFontSize(size);
    doc.setFont("helvetica", style);
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    if (y + lines.length * (size * 0.5) > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(lines, margin, y);
    y += lines.length * (size * 0.5) + 4;
  };

  const addSpacer = (h = 6) => { y += h; };

  // Header
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 0, pageWidth, 45, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("EcoSim Environmental Impact Report", margin, 22);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${new Date().toLocaleDateString()} | Confidence: ${result.confidenceScore}%`, margin, 34);
  y = 55;
  doc.setTextColor(30, 30, 30);

  // Executive Summary
  addLine("EXECUTIVE SUMMARY", 16, "bold");
  addSpacer(2);
  addLine(`Product Category: ${input.productCategory.charAt(0).toUpperCase() + input.productCategory.slice(1)}`);
  addLine(`Energy Source: ${input.energySource} | Lifespan: ${input.lifespanYears} years | Transport: ${input.transportDistance} km`);
  addLine(`Manufacturing: ${input.manufacturingCountry} → ${input.usageCountry} | Usage: ${input.usageFrequency}`);
  addSpacer();

  // Key Metrics
  addLine("KEY ENVIRONMENTAL METRICS", 16, "bold");
  addSpacer(2);
  addLine(`Total Lifecycle CO₂: ${result.totalCO2} kg CO₂e`, 12, "bold");
  addLine(`Water Footprint: ${result.waterFootprint} liters`);
  addLine(`Landfill Mass: ${result.landfillMass} kg`);
  addLine(`Resource Depletion Score: ${result.resourceDepletion}/100`);
  addLine(`Recycling Probability: ${result.recyclingProbability}%`);
  addLine(`E-Waste Risk: ${result.eWasteRisk} (Score: ${result.eWasteScore}/100)`);
  addSpacer();

  // Lifecycle Breakdown
  addLine("LIFECYCLE PHASE BREAKDOWN", 16, "bold");
  addSpacer(2);
  for (const phase of result.lifecyclePhases) {
    addLine(`${phase.phase}: ${phase.co2} kg CO₂e (${phase.percentage}%) | Water: ${phase.water}L | Toxic Risk: ${phase.toxicRisk}/100`);
  }
  addSpacer();

  // Annual Forecast
  addLine("ANNUAL EMISSIONS FORECAST", 16, "bold");
  addSpacer(2);
  for (const yr of result.annualBreakdown) {
    addLine(`Year ${yr.year}: ${yr.co2} kg CO₂e [CI: ${yr.ci_low}-${yr.ci_high}] | Water: ${yr.water}L | Waste: ${yr.waste} kg`);
  }
  addSpacer();

  // E-Waste Detail
  doc.addPage();
  y = 20;
  addLine("E-WASTE RISK ASSESSMENT", 16, "bold");
  addSpacer(2);
  addLine(`Risk Level: ${result.eWasteDetail.risk} | Score: ${result.eWasteDetail.score}/100 | Probability: ${(result.eWasteDetail.probability * 100).toFixed(1)}%`);
  addLine(`Repairability: ${result.eWasteDetail.repairabilityScore}/100`);
  addLine(`Software Support: ${result.eWasteDetail.softwareSupportYears} years`);
  addLine(`Obsolescence Rate: ${result.eWasteDetail.obsolescenceRate}%`);
  addLine(`Battery Risk: ${result.eWasteDetail.batteryRisk}`);
  if (result.eWasteDetail.toxicMaterials.length > 0) {
    addLine(`Toxic Materials: ${result.eWasteDetail.toxicMaterials.join(", ")}`);
  }
  addSpacer();

  // SHAP Values
  addLine("FEATURE IMPORTANCE (SHAP)", 16, "bold");
  addSpacer(2);
  for (const shap of result.shapValues) {
    addLine(`${shap.feature}: ${shap.importance} (${shap.direction === "positive" ? "↑ increases" : "↓ decreases"} impact) [${shap.value}]`);
  }
  addSpacer();

  // Model Metrics
  addLine("MODEL VALIDATION METRICS", 16, "bold");
  addSpacer(2);
  addLine(`Accuracy: ${(result.modelMetrics.accuracy * 100).toFixed(1)}% | F1: ${result.modelMetrics.f1} | Precision: ${result.modelMetrics.precision} | Recall: ${result.modelMetrics.recall}`);
  addLine(`AUC-ROC: ${result.modelMetrics.auc}`);
  addSpacer(2);
  addLine("Cross-Validation Results:", 12, "bold");
  for (const cv of result.crossValidation) {
    addLine(`Fold ${cv.fold}: RMSE=${cv.rmse} | R²=${cv.r2} | MAE=${cv.mae}`);
  }
  addSpacer();

  // Monte Carlo Summary
  addLine("MONTE CARLO SIMULATION SUMMARY", 16, "bold");
  addSpacer(2);
  const co2Values = result.monteCarlo.map((m) => m.co2).sort((a, b) => a - b);
  const p5 = co2Values[Math.floor(co2Values.length * 0.05)];
  const p50 = co2Values[Math.floor(co2Values.length * 0.5)];
  const p95 = co2Values[Math.floor(co2Values.length * 0.95)];
  addLine(`${result.monteCarlo.length} iterations performed`);
  addLine(`CO₂ Distribution: P5=${p5} kg | Median=${p50} kg | P95=${p95} kg`);
  addSpacer();

  // Footer
  addLine("ESG COMPLIANCE NOTE", 14, "bold");
  addSpacer(2);
  addLine("This report is generated using ML-based environmental modeling. Results should be validated against actual lifecycle assessment (LCA) data for regulatory compliance. Model predictions include confidence intervals and uncertainty quantification via Monte Carlo simulation.");
  addSpacer();
  addLine("Generated by EcoSim – Intelligent Environmental Impact & Lifecycle Simulation Platform");
  addLine("Azure ML Compatible | ISO 14040/14044 Framework Aligned");

  doc.save(`EcoSim_Report_${input.productCategory}_${new Date().toISOString().split("T")[0]}.pdf`);
}
