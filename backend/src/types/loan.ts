export type LoanDecisionStatus = "approved" | "denied" | "manual_review";

export type FeatureImpact = {
  feature: string;
  value: number;
  weight: number;
  direction: "positive" | "negative";
  displayValue?: string;
  normalizedValue?: number;
  isDefault?: boolean;
};

export interface LoanScoreResult {
  score: number;
  decision: LoanDecisionStatus;
  featureImpacts: FeatureImpact[];
  modelVersion: string;
}


