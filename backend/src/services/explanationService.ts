import axios from "axios";

import { env } from "../config/env";
import type { FeatureImpact, LoanDecisionStatus } from "../types/loan";

type ExplanationParams = {
  customerId: string;
  decision: LoanDecisionStatus;
  score: number;
  featureImpacts: FeatureImpact[];
  rawFeatures: Record<string, unknown>;
  modelVersion: string;
};

type HuggingFaceResponse =
  | Array<{ summary_text?: string; generated_text?: string }>
  | { generated_text?: string; summary_text?: string };

const DEFAULT_TOP_FEATURES = 3;

const formatImpactLine = (impact: FeatureImpact): string => {
  const contribution = impact.weight;
  const directionWord = contribution >= 0 ? "supporting approval" : "increasing risk";
  const display = impact.displayValue ?? impact.value;
  return `${impact.feature}: ${display} (${directionWord}, impact ${contribution.toFixed(2)})`;
};

const buildPrompt = (
  params: ExplanationParams,
  topImpacts: FeatureImpact[],
): string => {
  const impactLines = topImpacts.map((impact, index) => `${index + 1}. ${formatImpactLine(impact)}`);

  return [
    "You are an assistant for a banking transparency portal. Produce a concise, customer-friendly explanation of an AI loan decision.",
    "",
    `Decision: ${params.decision}`,
    `Approval probability: ${(params.score * 100).toFixed(1)}%`,
    `Customer ID: ${params.customerId}`,
    `Model version: ${params.modelVersion}`,
    "",
    "Key factors:",
    ...impactLines,
    "",
    "Guidelines:",
    "- Be clear, empathetic, and avoid technical jargon.",
    "- Reference the factors above in plain language.",
    "- Provide guidance on what could improve the outcome if the decision was negative.",
    "- Limit the response to 3 sentences.",
  ].join("\n");
};

const formatFallbackExplanation = (
  params: ExplanationParams,
  topImpacts: FeatureImpact[],
): string => {
  if (topImpacts.length === 0) {
    return (
      "The decision was based on the information provided in your application. " +
      "If anything looks incorrect, please update your details and we will review it again."
    );
  }

  const positiveImpacts = topImpacts.filter((impact) => impact.weight >= 0);
  const negativeImpacts = topImpacts.filter((impact) => impact.weight < 0);

  const directionPhrase =
    params.decision === "approved"
      ? "helped approve"
      : params.decision === "manual_review"
        ? "triggered a manual review because"
        : "led to the denial because";

  const negativeSummary =
    negativeImpacts.length > 0
      ? `Key items that ${directionPhrase} ${negativeImpacts
          .map((impact) => {
            const display = impact.displayValue ?? impact.value;
            return `${impact.feature} (${display})`;
          })
          .join(", ")}.`
      : "";

  const positiveSummary =
    positiveImpacts.length > 0
      ? `Strengths in your application included ${positiveImpacts
          .map((impact) => {
            const display = impact.displayValue ?? impact.value;
            return `${impact.feature} (${display})`;
          })
          .join(", ")}.`
      : "";

  const guidance =
    params.decision === "approved"
      ? "No further action is required—we will keep you informed about the next steps."
      : "You may improve your chances by adding more reliable credit history, lowering the requested loan amount, or updating your income information if it has changed.";

  return [negativeSummary, positiveSummary, guidance]
    .filter((segment) => segment.trim().length > 0)
    .join(" ");
};

const extractSummaryText = (payload: HuggingFaceResponse): string | null => {
  if (Array.isArray(payload) && payload.length > 0) {
    const candidate = payload[0];
    return candidate.summary_text ?? candidate.generated_text ?? null;
  }

  if (!Array.isArray(payload) && typeof payload === "object") {
    return payload.summary_text ?? payload.generated_text ?? null;
  }

  return null;
};

const shouldBypassHuggingFace = (): boolean => {
  if (!env.huggingFace.token || env.huggingFace.token === "demo-token") {
    return true;
  }

  return false;
};

export const generateLoanExplanation = async (
  params: ExplanationParams,
): Promise<string> => {
  const topImpacts = params.featureImpacts
    .filter((impact) => Number.isFinite(impact.weight))
    .slice(0, DEFAULT_TOP_FEATURES);

  const fallback = formatFallbackExplanation(params, topImpacts);

  if (shouldBypassHuggingFace()) {
    return fallback;
  }

  try {
    const prompt = buildPrompt(params, topImpacts);
    const response = await axios.post<HuggingFaceResponse>(
      env.huggingFace.apiUrl,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${env.huggingFace.token}`,
          "Content-Type": "application/json",
        },
        timeout: 15_000,
      },
    );

    const summary = extractSummaryText(response.data);
    if (summary && summary.trim().length > 0) {
      return summary.trim();
    }

    return fallback;
  } catch (error) {
    return fallback;
  }
};

