"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

import { fetchAuditLog } from "../../lib/api";
import { DEMO_CUSTOMERS } from "../../lib/config";
import type { AuditAction, AuditEntityType } from "../../lib/types";

const actionLabels: Record<AuditAction, string> = {
  LOAN_SCORED: "Loan Scored",
  CONSENT_VIEWED: "Consent Viewed",
  CONSENT_UPDATED: "Consent Updated",
  AUDIT_VIEWED: "Audit Log Viewed"
};

const entityLabels: Record<AuditEntityType, string> = {
  loan_application: "Loan Application",
  customer: "Customer",
  system: "System"
};

const AuditPage = (): JSX.Element => {
  const [entityType, setEntityType] = useState<AuditEntityType | "">("");
  const [entityId, setEntityId] = useState("");
  const [action, setAction] = useState<AuditAction | "">("");
  const [limit, setLimit] = useState(50);

  const query = useQuery({
    queryKey: ["audit-log", entityType, entityId, action, limit],
    queryFn: () =>
      fetchAuditLog({
        entityType: entityType || undefined,
        entityId: entityId || undefined,
        action: action || undefined,
        limit
      }),
    refetchOnWindowFocus: false
  });

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">Immutable Audit Trail</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Every action touching customer data or AI scoring is chained with SHA-256 hashes. Use this
          view to demonstrate regulatory oversight and real-time model governance.
        </p>
      </section>

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <label className="text-xs font-medium uppercase tracking-wide text-slate-600">
              Entity Type
              <select
                value={entityType}
                onChange={(event) => setEntityType(event.target.value as AuditEntityType | "")}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">All</option>
                {Object.entries(entityLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-medium uppercase tracking-wide text-slate-600">
              Entity ID
              <input
                value={entityId}
                onChange={(event) => setEntityId(event.target.value)}
                placeholder="Optional filter"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-[11px] text-slate-400">
                Try {DEMO_CUSTOMERS[0].id} or an application ID shown in the decision view.
              </p>
            </label>

            <label className="text-xs font-medium uppercase tracking-wide text-slate-600">
              Action
              <select
                value={action}
                onChange={(event) => setAction(event.target.value as AuditAction | "")}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">All</option>
                {Object.entries(actionLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-medium uppercase tracking-wide text-slate-600">
              Limit
              <select
                value={limit}
                onChange={(event) => setLimit(Number(event.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                {[25, 50, 100, 150, 200].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => query.refetch()}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Refresh
            </button>
            <div
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                query.data?.integrity.verified
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {query.data?.integrity.verified ? "Chain verified" : "Integrity issue detected"}
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Timestamp
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Entity
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Details
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Hash
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {query.isLoading && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                    Loading audit entries...
                  </td>
                </tr>
              )}
              {!query.isLoading && query.data?.entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-sm text-slate-500">
                    No audit entries found for the selected filters.
                  </td>
                </tr>
              )}
              {query.data?.entries.map((entry) => (
                <tr key={entry._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {dayjs(entry.createdAt).format("YYYY-MM-DD HH:mm:ss")}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    <div className="font-medium">{entityLabels[entry.entityType]}</div>
                    <div className="text-xs text-slate-500">{entry.entityId}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">{actionLabels[entry.action]}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    <pre className="whitespace-pre-wrap rounded bg-slate-100 p-2">
                      {JSON.stringify(entry.details ?? {}, null, 2)}
                    </pre>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    <div className="truncate font-mono text-[11px]">{entry.hash}</div>
                    <div className="truncate font-mono text-[10px] text-slate-400">
                      prev {entry.prevHash ?? "null"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AuditPage;

