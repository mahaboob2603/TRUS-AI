"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { fetchConsent, updateConsent } from "../../lib/api";
import { DEFAULT_CUSTOMER_ID, DEMO_CUSTOMERS } from "../../lib/config";
import type { ConsentCategory, ConsentMap } from "../../lib/types";

const consentDescriptions: Record<ConsentCategory, string> = {
  credit_history: "Access credit bureau history and repayment records.",
  income_data: "Use income statements and verified salary deposits.",
  employment_data: "Verify employment tenure and employer information.",
  transaction_monitoring: "Monitor banking transactions for risk and fraud."
};

const ConsentToggle = ({
  label,
  description,
  checked,
  disabled,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}): JSX.Element => (
  <label className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:shadow-md">
    <div>
      <p className="text-sm font-semibold text-slate-800">{label}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        disabled={disabled}
        className={`${
          checked ? "bg-primary" : "bg-slate-200"
        } relative inline-flex h-6 w-10 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition duration-200 ease-in-out disabled:cursor-not-allowed disabled:opacity-60`}
      >
        <span
          className={`${
            checked ? "translate-x-4" : "translate-x-0"
          } inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out`}
        />
      </button>
    </div>
  </label>
);

const ConsentPage = (): JSX.Element => {
  const [customerId, setCustomerId] = useState(DEFAULT_CUSTOMER_ID);
  const queryClient = useQueryClient();

  const consentQuery = useQuery({
    queryKey: ["consent", customerId],
    queryFn: () => fetchConsent(customerId)
  });

  const mutation = useMutation({
    mutationFn: (consent: Partial<ConsentMap>) => updateConsent(customerId, consent),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["consent", customerId] });
    }
  });

  const consent = consentQuery.data?.consent;

  const toggleEntries: Array<[ConsentCategory, boolean]> = consent
    ? (Object.entries(consent) as Array<[ConsentCategory, boolean]>)
    : [];

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">Dynamic Consent Center</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Empower customers to decide how their data fuels the AI. Every change emits an audit trail,
          keeping regulators and customers in sync.
        </p>
      </section>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-64">
          <label className="block text-sm font-medium text-slate-700">
            Customer
            <select
              value={customerId}
              onChange={(event) => setCustomerId(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
            >
              {DEMO_CUSTOMERS.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.label}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs text-amber-800">
            <p>
              Tip: demonstrate a consent change and then view the audit log to show the hash-chain
              record.
            </p>
          </div>
        </aside>

        <section className="flex-1 space-y-4">
          {consentQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading consent preferences...</p>
          ) : (
            toggleEntries.map(([key, value]) => (
              <ConsentToggle
                key={key}
                label={key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())}
                description={consentDescriptions[key]}
                checked={Boolean(value)}
                disabled={mutation.isPending}
                onChange={(next) => mutation.mutate({ [key]: next })}
              />
            ))
          )}

          {mutation.isPending && (
            <p className="text-xs text-slate-500">Saving preference and appending audit entry...</p>
          )}

          {mutation.isSuccess && (
            <p className="text-xs text-emerald-600">Consent updated successfully.</p>
          )}
          {mutation.isError && (
            <p className="text-xs text-rose-600">
              {(mutation.error as Error)?.message ?? "Failed to update consent"}
            </p>
          )}
        </section>
      </div>
    </div>
  );
};

export default ConsentPage;

