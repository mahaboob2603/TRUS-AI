import type { Request, Response, NextFunction } from "express";

import { appendAuditEntry, getAuditEntries, verifyChain } from "../services/auditService";
import type { AuditAction, AuditEntityType } from "../types/audit";

type AuditQuery = {
  entityType?: AuditEntityType;
  entityId?: string;
  action?: AuditAction;
  limit?: string;
};

const resolveActor = (req: Request): string => {
  return (req.header("x-actor-id") ?? "demo-actor").trim();
};

export const listAuditHandler = async (
  req: Request<Record<string, string>, unknown, unknown, AuditQuery>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { entityType, entityId, action, limit } = req.query;
    const numericLimit = Math.min(Number(limit ?? "50") || 50, 200);

    const entries = await getAuditEntries(
      {
        entityType,
        entityId,
        action,
      },
      numericLimit,
    );

    const verified = await verifyChain();

    await appendAuditEntry({
      entityType: "system",
      entityId: "audit-log",
      action: "AUDIT_VIEWED",
      performedBy: resolveActor(req),
      details: {
        filters: { entityType, entityId, action },
        limit: numericLimit,
      },
    });

    res.json({
      entries,
      integrity: {
        verified,
      },
    });
  } catch (error) {
    next(error);
  }
};


