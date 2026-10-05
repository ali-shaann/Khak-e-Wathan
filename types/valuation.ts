export type ValuationDirection =
  | "positive"
  | "negative"
  | "neutral";

export type ValuationDataCompleteness =
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

  dataCompleteness:
    ValuationDataCompleteness;

  factors: ValuationFactor[];
};