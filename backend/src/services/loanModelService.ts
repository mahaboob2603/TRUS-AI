import fs from "node:fs/promises";
import path from "node:path";

import type { FeatureImpact, LoanDecisionStatus, LoanScoreResult } from "../types/loan";

type NumericFeatureSpec = {
  mean: number;
  std: number;
  weight: number;
  description?: string;
};

type CategoricalFeatureSpec = {
  weights: Record<string, number>;
  description?: string;
};

type ThresholdSpec = {
  approved: number;
  manualReview?: number;
};

type LoanModelArtifact = {
  version: string;
  bias: number;
  numeric: Record<string, NumericFeatureSpec>;
  categorical: Record<string, CategoricalFeatureSpec>;
  thresholds: ThresholdSpec;
  metadata?: Record<string, unknown>;
};

type ScoreContext = {
  rawValue: unknown;
  resolvedValue: number;
  normalizedValue: number;
  contribution: number;
  isDefault: boolean;
  displayValue?: string;
};

let cachedModel: LoanModelArtifact | null = null;

const DEFAULT_MODEL_RELATIVE_PATH = "../data/artifacts/loan_model.json";

const resolveModelPath = (): string => {
  const explicit = process.env.LOAN_MODEL_PATH;
  if (explicit && explicit.trim().length > 0) {
    return path.resolve(explicit);
  }
  return path.resolve(process.cwd(), DEFAULT_MODEL_RELATIVE_PATH);
};

const parseArtifact = (raw: string): LoanModelArtifact => {
  const parsed = JSON.parse(raw) as LoanModelArtifact;
  if (
    !parsed ||
    typeof parsed.version !== "string" ||
    typeof parsed.bias !== "number" ||
    typeof parsed.numeric !== "object" ||
    typeof parsed.categorical !== "object" ||
    typeof parsed.thresholds !== "object"
  ) {
    throw new Error("Invalid loan model artifact structure");
  }

  return parsed;
};

const loadModel = async (): Promise<LoanModelArtifact> => {
  if (cachedModel) {
    return cachedModel;
  }

  const artifactPath = resolveModelPath();
  const file = await fs.readFile(artifactPath, "utf8");
  cachedModel = parseArtifact(file);
  return cachedModel;
};

const sanitizeNumericInput = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.length === 0) {
      return null;
    }

    if (/^\d+\+$/.test(trimmed)) {
      // Handles cases like "3+"
      return Number.parseInt(trimmed.replace("+", ""), 10);
    }

    const sanitized = trimmed.replace(/[^\d.-]/g, "");
    if (sanitized.length === 0) {
      return null;
    }

    const parsed = Number(sanitized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const computeNumericContribution = (
  feature: string,
  spec: NumericFeatureSpec,
  value: unknown,
): ScoreContext => {
  const parsedValue = sanitizeNumericInput(value);
  const resolvedValue = parsedValue ?? spec.mean;
  const normalizedValue =
    spec.std && spec.std !== 0 ? (resolvedValue - spec.mean) / spec.std : resolvedValue - spec.mean;
  const contribution = normalizedValue * spec.weight;

  return {
    rawValue: value,
    resolvedValue,
    normalizedValue,
    contribution,
    isDefault: parsedValue === null,
  };
};

const computeCategoricalContribution = (
  feature: string,
  spec: CategoricalFeatureSpec,
  value: unknown,
): ScoreContext => {
  const resolved = typeof value === "string" ? value.trim() : value ?? "unknown";
  const label = String(resolved);
  const weight = spec.weights[label] ?? 0;

  return {
    rawValue: value,
    resolvedValue: weight !== 0 ? 1 : 0,
    normalizedValue: weight,
    contribution: weight,
    isDefault: !(label in spec.weights),
    displayValue: label,
  };
};

const logistic = (x: number): number => {
  return 1 / (1 + Math.exp(-x));
};

const determineDecision = (
  score: number,
  thresholds: ThresholdSpec,
): LoanDecisionStatus => {
  const manualReviewThreshold =
    typeof thresholds.manualReview === "number" ? thresholds.manualReview : thresholds.approved;

  if (score >= thresholds.approved) {
    return "approved";
  }

  if (score >= manualReviewThreshold) {
    return "manual_review";
  }

  return "denied";
};

const formatImpact = (feature: string, context: ScoreContext): FeatureImpact => {
  const direction = context.contribution >= 0 ? "positive" : "negative";
  return {
    feature,
    value: Number.isFinite(context.resolvedValue) ? context.resolvedValue : 0,
    weight: Number(context.contribution),
    direction,
    displayValue: context.displayValue,
    normalizedValue: Number.isFinite(context.normalizedValue) ? context.normalizedValue : 0,
    isDefault: context.isDefault,
  };
};

export const resetLoanModelCache = (): void => {
  cachedModel = null;
};

export const scoreLoanApplication = async (
  features: Record<string, unknown>,
): Promise<LoanScoreResult> => {
  const model = await loadModel();

  const impacts: FeatureImpact[] = [];
  let logit = model.bias;

  for (const [feature, spec] of Object.entries(model.numeric)) {
    const context = computeNumericContribution(feature, spec, features[feature]);
    logit += context.contribution;
    impacts.push(formatImpact(feature, context));
  }

  for (const [feature, spec] of Object.entries(model.categorical)) {
    const context = computeCategoricalContribution(feature, spec, features[feature]);
    logit += context.contribution;
    impacts.push(formatImpact(feature, context));
  }

  const probability = logistic(logit);
  const decision = determineDecision(probability, model.thresholds);

  const sortedImpacts = impacts
    .map((impact) => ({
      ...impact,
      weight: Number(impact.weight.toFixed(6)),
      normalizedValue:
        impact.normalizedValue !== undefined && Number.isFinite(impact.normalizedValue)
          ? Number(impact.normalizedValue.toFixed(6))
          : impact.normalizedValue,
    }))
    .sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight));

  return {
    score: Number(probability.toFixed(6)),
    decision,
    featureImpacts: sortedImpacts,
    modelVersion: model.version,
  };
};

