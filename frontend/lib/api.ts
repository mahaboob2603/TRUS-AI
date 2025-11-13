import { API_BASE_URL } from "./config";
import type {
  AuditResponse,
  ConsentMap,
  ConsentResponse,
  LoanScoreResponse
} from "./types";

const ACTOR_HEADER = { "x-actor-id": "demo-actor" };

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Request failed");
  }

  return response.json() as Promise<T>;
};

export type ScoreLoanPayload = {
  customerId: string;
  applicationId?: string;
  features: Record<string, unknown>;
};

export const scoreLoanApplication = async (
  payload: ScoreLoanPayload
): Promise<LoanScoreResponse> => {
  const response = await fetch(`${API_BASE_URL}/loans/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...ACTOR_HEADER
    },
    body: JSON.stringify(payload)
  });

  return handleResponse<LoanScoreResponse>(response);
};

export const fetchConsent = async (customerId: string): Promise<ConsentResponse> => {
  const response = await fetch(`${API_BASE_URL}/consent/${customerId}`, {
    headers: ACTOR_HEADER
  });
  return handleResponse<ConsentResponse>(response);
};

export const updateConsent = async (
  customerId: string,
  consent: Partial<ConsentMap>
): Promise<ConsentResponse> => {
  const response = await fetch(`${API_BASE_URL}/consent/${customerId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...ACTOR_HEADER
    },
    body: JSON.stringify({ consent })
  });
  return handleResponse<ConsentResponse>(response);
};

export type AuditFilters = {
  entityType?: string;
  entityId?: string;
  action?: string;
  limit?: number;
};

export const fetchAuditLog = async (filters: AuditFilters): Promise<AuditResponse> => {
  const searchParams = new URLSearchParams();
  if (filters.entityType) searchParams.set("entityType", filters.entityType);
  if (filters.entityId) searchParams.set("entityId", filters.entityId);
  if (filters.action) searchParams.set("action", filters.action);
  if (filters.limit) searchParams.set("limit", filters.limit.toString());

  const url = `${API_BASE_URL}/audit${searchParams.toString() ? `?${searchParams}` : ""}`;
  const response = await fetch(url, {
    headers: ACTOR_HEADER
  });
  return handleResponse<AuditResponse>(response);
};

