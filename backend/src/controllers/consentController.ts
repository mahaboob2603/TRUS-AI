import type { Request, Response, NextFunction } from "express";

import { CustomerModel } from "../models/Customer";
import { appendAuditEntry } from "../services/auditService";
import type { ConsentCategory, ConsentMap } from "../types/consent";

type ConsentParams = {
  customerId: string;
};

type UpdateConsentBody = {
  consent: Partial<ConsentMap>;
};

const CONSENT_KEYS: ConsentCategory[] = [
  "credit_history",
  "income_data",
  "employment_data",
  "transaction_monitoring",
];

const resolveActor = (req: Request): string => {
  return (req.header("x-actor-id") ?? "demo-actor").trim();
};

const normalizeConsentPayload = (payload: Partial<ConsentMap>): ConsentMap => {
  const normalized: ConsentMap = {
    credit_history: true,
    income_data: true,
    employment_data: true,
    transaction_monitoring: true,
  };

  for (const key of CONSENT_KEYS) {
    if (typeof payload[key] === "boolean") {
      normalized[key] = payload[key] as boolean;
    }
  }

  return normalized;
};

export const getConsentHandler = async (
  req: Request<ConsentParams>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { customerId } = req.params;

    if (!customerId) {
      res.status(400).json({ error: "customerId is required" });
      return;
    }

    const customer =
      (await CustomerModel.findOne({ customerId }).lean()) ??
      (await CustomerModel.create({
        customerId,
        fullName: "Demo User",
        email: `${customerId}@demo.local`,
      }));

    await appendAuditEntry({
      entityType: "customer",
      entityId: customerId,
      action: "CONSENT_VIEWED",
      performedBy: resolveActor(req),
    });

    res.json({ customerId, consent: customer.consent });
  } catch (error) {
    next(error);
  }
};

export const updateConsentHandler = async (
  req: Request<ConsentParams, unknown, UpdateConsentBody>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { customerId } = req.params;
    const { consent } = req.body;

    if (!customerId || !consent) {
      res.status(400).json({ error: "customerId and consent payload are required" });
      return;
    }

    const normalized = normalizeConsentPayload(consent);

    const customer = await CustomerModel.findOneAndUpdate(
      { customerId },
      { $set: { consent: normalized } },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    ).lean();

    await appendAuditEntry({
      entityType: "customer",
      entityId: customerId,
      action: "CONSENT_UPDATED",
      performedBy: resolveActor(req),
      details: { consent: normalized },
    });

    res.json({ customerId, consent: customer?.consent ?? normalized });
  } catch (error) {
    next(error);
  }
};


