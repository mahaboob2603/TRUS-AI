import { randomUUID } from "node:crypto";

import type { Request, Response, NextFunction } from "express";

import { LoanApplicationModel } from "../models/LoanApplication";
import { appendAuditEntry } from "../services/auditService";
import { generateLoanExplanation } from "../services/explanationService";
import { scoreLoanApplication } from "../services/loanModelService";

type ScoreLoanBody = {
  customerId: string;
  applicationId?: string;
  features: Record<string, unknown>;
};

const resolveActor = (req: Request): string => {
  return (req.header("x-actor-id") ?? "demo-actor").trim();
};

export const scoreLoanHandler = async (
  req: Request<Record<string, string>, unknown, ScoreLoanBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { customerId, applicationId: providedId, features } = req.body;

    if (!customerId || !features) {
      res.status(400).json({
        error: "customerId and features are required",
      });
      return;
    }

    const applicationId = providedId ?? randomUUID();

    const { score, decision, featureImpacts, modelVersion } = await scoreLoanApplication(features);

    const explanationSummary = await generateLoanExplanation({
      customerId,
      decision,
      score,
      featureImpacts,
      rawFeatures: features,
      modelVersion,
    });

    await LoanApplicationModel.findOneAndUpdate(
      { applicationId },
      {
        applicationId,
        customerId,
        rawFeatures: features,
        score,
        decision,
        explanationSummary,
        featureImpacts,
        modelVersion,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await appendAuditEntry({
      entityType: "loan_application",
      entityId: applicationId,
      action: "LOAN_SCORED",
      performedBy: resolveActor(req),
      details: {
        customerId,
        score,
        decision,
        modelVersion,
      },
    });

    res.status(200).json({
      applicationId,
      customerId,
      score,
      decision,
      explanationSummary,
      featureImpacts,
      modelVersion,
    });
  } catch (error) {
    next(error);
  }
};
