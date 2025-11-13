import { Schema, model, type Document } from "mongoose";

import type { FeatureImpact, LoanDecisionStatus } from "../types/loan";

export interface LoanApplicationDocument extends Document {
  applicationId: string;
  customerId: string;
  rawFeatures: Record<string, unknown>;
  score: number;
  decision: LoanDecisionStatus;
  explanationSummary?: string;
  featureImpacts?: FeatureImpact[];
  modelVersion: string;
  createdAt: Date;
  updatedAt: Date;
}

const featureImpactSchema = new Schema<FeatureImpact>(
  {
    feature: { type: String, required: true },
    value: { type: Number, required: true },
    weight: { type: Number, required: true },
    direction: {
      type: String,
      enum: ["positive", "negative"],
      required: true,
    },
    displayValue: { type: String },
    normalizedValue: { type: Number },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false },
);

const loanApplicationSchema = new Schema<LoanApplicationDocument>(
  {
    applicationId: { type: String, required: true, unique: true, index: true },
    customerId: { type: String, required: true, index: true },
    rawFeatures: { type: Schema.Types.Mixed, required: true },
    score: { type: Number, required: true },
    decision: {
      type: String,
      enum: ["approved", "denied", "manual_review"],
      required: true,
    },
    explanationSummary: { type: String },
    featureImpacts: { type: [featureImpactSchema], default: void 0 },
    modelVersion: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: "loan_applications",
  },
);

export const LoanApplicationModel = model<LoanApplicationDocument>(
  "LoanApplication",
  loanApplicationSchema,
);


