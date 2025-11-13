import { Schema, model, type Document } from "mongoose";

import type { AuditAction, AuditEntityType } from "../types/audit";

export interface AuditLogDocument extends Document {
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  performedBy: string;
  details?: Record<string, unknown>;
  hash: string;
  prevHash: string | null;
  createdAt: Date;
}

const auditLogSchema = new Schema<AuditLogDocument>(
  {
    entityType: {
      type: String,
      enum: ["customer", "loan_application", "system"],
      required: true,
    },
    entityId: { type: String, required: true, index: true },
    action: {
      type: String,
      enum: ["LOAN_SCORED", "CONSENT_VIEWED", "CONSENT_UPDATED", "AUDIT_VIEWED"],
      required: true,
    },
    performedBy: { type: String, required: true },
    details: { type: Schema.Types.Mixed },
    hash: { type: String, required: true },
    prevHash: { type: String, default: null },
  },
  {
    collection: "audit_log",
    timestamps: { createdAt: true, updatedAt: false },
  },
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLogModel = model<AuditLogDocument>("AuditLog", auditLogSchema);


