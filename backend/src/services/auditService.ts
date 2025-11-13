import { AuditLogModel, type AuditLogDocument } from "../models/AuditLog";
import type { AuditPayload } from "../types/audit";
import { computeHash } from "../utils/hash";

const serializePayload = (payload: AuditPayload, prevHash: string | null): string => {
  return JSON.stringify({
    ...payload,
    prevHash,
  });
};

export const appendAuditEntry = async (
  payload: AuditPayload,
): Promise<AuditLogDocument> => {
  const latestEntry = await AuditLogModel.findOne().sort({ createdAt: -1 }).lean();
  const prevHash = latestEntry?.hash ?? null;
  const serialized = serializePayload(payload, prevHash);
  const hash = computeHash(serialized);

  const entry = await AuditLogModel.create({
    ...payload,
    details: payload.details ?? {},
    prevHash,
    hash,
  });

  return entry;
};

export const getAuditEntries = async (
  filter: Partial<Pick<AuditPayload, "entityType" | "entityId" | "action">>,
  limit = 50,
): Promise<AuditLogDocument[]> => {
  return AuditLogModel.find(filter).sort({ createdAt: -1 }).limit(limit).exec();
};

export const verifyChain = async (): Promise<boolean> => {
  const cursor = AuditLogModel.find().sort({ createdAt: 1 }).cursor();
  let prevHash: string | null = null;

  for await (const doc of cursor) {
    const serialized = serializePayload(
      {
        entityType: doc.entityType,
        entityId: doc.entityId,
        action: doc.action,
        performedBy: doc.performedBy,
        details: doc.details,
      },
      prevHash,
    );
    const computedHash = computeHash(serialized);
    if (computedHash !== doc.hash || doc.prevHash !== prevHash) {
      await cursor.close();
      return false;
    }
    prevHash = doc.hash;
  }

  return true;
};


