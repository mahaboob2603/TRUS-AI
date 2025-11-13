export type AuditAction =
  | "LOAN_SCORED"
  | "CONSENT_VIEWED"
  | "CONSENT_UPDATED"
  | "AUDIT_VIEWED";

export type AuditEntityType = "customer" | "loan_application" | "system";

export interface AuditPayload<TDetails = Record<string, unknown>> {
  entityType: AuditEntityType;
  entityId: string;
  action: AuditAction;
  performedBy: string;
  details?: TDetails;
}


