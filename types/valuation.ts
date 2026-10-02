export type ValuationDirection =
  | "positive"
  | "negative"
  | "neutral";

export type ValuationConfidence =
  | "low"
  | "medium"
  | "high";

export type ValuationFactor = {
  label: string;
  explanation: string;
  impactPercent: number;
  direction: ValuationDirection;
};

export type PropertyValuation = {
  estimatedValuePkr: number;
  estimatedMinPkr: number;
  estimatedMaxPkr: number;

  baselineRatePerMarla: number;
  areaInMarla: number;

  totalAdjustmentPercent: number;

  confidence: ValuationConfidence;

  factors: ValuationFactor[];
};