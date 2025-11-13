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

export type LoanScoreResponse = {
  applicationId: string;
  customerId: string;
  score: number;
  decision: LoanDecisionStatus;
  explanationSummary: string;
  featureImpacts: FeatureImpact[];
  modelVersion: string;
};

export type ConsentCategory =
  | "credit_history"
  | "income_data"
  | "employment_data"
  | "transaction_monitoring";

export type ConsentMap = Record<ConsentCategory, boolean>;

export type ConsentResponse = {
  customerId: string;
  consent: ConsentMap;
};

export type AuditAction =
  | "LOAN_SCORED"
  | "CONSENT_VIEWED"
  | "CONSENT_UPDATED"
  | "AUDIT_VIEWED";

export type AuditEntityType = "customer" | "loan_application" | "system";

export type AuditEntry = {
  _id: string;
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  performedBy: string;
  details?: Record<string, unknown>;
  hash: string;
  prevHash: string | null;
  createdAt: string;
};

export type AuditResponse = {
  entries: AuditEntry[];
  integrity: {
    verified: boolean;
  };
};

