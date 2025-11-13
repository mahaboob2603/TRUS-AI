"use client";

import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { clsx } from "clsx";

import { scoreLoanApplication } from "../../lib/api";
import { DEFAULT_CUSTOMER_ID, DEMO_CUSTOMERS } from "../../lib/config";
import { DEFAULT_LOAN_FEATURES, SAMPLE_APPLICATIONS } from "../../lib/sampleData";
import type { LoanScoreResponse } from "../../lib/types";

type LoanFormState = Record<string, string>;

const featureFields: Array<{
  key: keyof LoanFormState;
  label: string;
  type: "select" | "number" | "text";
  options?: string[];
  helper?: string;
}> = [
  { key: "Gender", label: "Gender", type: "select", options: ["Male", "Female"] },
  { key: "Married", label: "Married", type: "select", options: ["Yes", "No"] },
  { key: "Dependents", label: "Dependents", type: "select", options: ["0", "1", "2", "3+"] },
  { key: "Education", label: "Education", type: "select", options: ["Graduate", "Not Graduate"] },
  { key: "Self_Employed", label: "Self Employed", type: "select", options: ["Yes", "No"] },
  {
    key: "ApplicantIncome",
    label: "Applicant Income",
    type: "number",
    helper: "Monthly income in USD equivalent"
  },
  {
    key: "CoapplicantIncome",
    label: "Co-applicant Income",
    type: "number",
    helper: "Monthly income in USD equivalent"
  },
  {
    key: "LoanAmount",
    label: "Loan Amount",
    type: "number",
    helper: "Principal requested (thousands)"
  },
  {
    key: "Loan_Amount_Term",
    label: "Loan Term (months)",
    type: "number"
  },
  {
    key: "Credit_History",
    label: "Credit History",
    type: "select",
    options: ["1", "0"],
    helper: "1 = clean history, 0 = limited / defaults"
  },
  {
    key: "Property_Area",
    label: "Property Area",
    type: "select",
    options: ["Urban", "Semiurban", "Rural"]
  }
];

const DecisionBadge = ({ decision }: { decision: LoanScoreResponse["decision"] }): JSX.Element => {
  const styles = {
    approved: "bg-emerald-100 text-emerald-700",
    denied: "bg-rose-100 text-rose-700",
    manual_review: "bg-amber-100 text-amber-700"
  } as const;

  const label = {
    approved: "Approved",
    denied: "Denied",
    manual_review: "Manual Review"
  }[decision];

  return (
    <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", styles[decision])}>
      {label}
    </span>
  );
};

const ApplicationsPage = (): JSX.Element => {
  const [customerId, setCustomerId] = useState(DEFAULT_CUSTOMER_ID);
  const [features, setFeatures] = useState<LoanFormState>(DEFAULT_LOAN_FEATURES);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (): Promise<LoanScoreResponse> =>
      scoreLoanApplication({
        customerId,
        features
      })
  });

  const topImpacts = useMemo(() => {
    if (!mutation.data) return [];
    return mutation.data.featureImpacts.slice(0, 5);
  }, [mutation.data]);

  const handleFieldChange = (key: keyof LoanFormState, value: string): void => {
    setFeatures((prev) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleTemplateSelect = (templateLabel: string): void => {
    const template = SAMPLE_APPLICATIONS.find((item) => item.label === templateLabel);
    if (!template) return;
    setSelectedTemplate(templateLabel);
    setCustomerId(template.customerId);
    setFeatures(template.features);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    mutation.mutate();
  };

  const resetForm = (): void => {
    setFeatures(DEFAULT_LOAN_FEATURES);
    setSelectedTemplate(null);
    setCustomerId(DEFAULT_CUSTOMER_ID);
    mutation.reset();
  };

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">Loan Decision Studio</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Submit a loan profile to generate a transparent decision. This demo uses the Kaggle loan
          dataset with a lightweight model and summarizes the top drivers using our TRUS.AI
          explanation engine.
        </p>
      </section>

      <div className="grid gap-6 lg:grid-cols-[420px,1fr]">
        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <header className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Applicant Profile</h2>
            <p className="text-sm text-slate-500">
              Choose a sample scenario or edit the fields manually to explore different outcomes.
            </p>
          </header>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-slate-700">
              Demo Scenario
              <select
                value={selectedTemplate ?? ""}
                onChange={(event) => handleTemplateSelect(event.target.value)}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
              >
                <option value="">Custom input</option>
                {SAMPLE_APPLICATIONS.map((item) => (
                  <option key={item.label} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

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
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {featureFields.map((field) => (
              <label key={field.key as string} className="space-y-1 text-sm">
                <span className="font-medium text-slate-700">{field.label}</span>
                {field.type === "select" ? (
                  <select
                    value={features[field.key] ?? ""}
                    onChange={(event) => handleFieldChange(field.key, event.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    required
                  >
                    {(field.options ?? []).map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    value={features[field.key] ?? ""}
                    onChange={(event) => handleFieldChange(field.key, event.target.value)}
                    type="text"
                    inputMode={field.type === "number" ? "decimal" : "text"}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    placeholder={field.type === "number" ? "0" : ""}
                    required
                  />
                )}
                {field.helper && <p className="text-xs text-slate-500">{field.helper}</p>}
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-slate-300"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Scoring..." : "Score Application"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
            >
              Reset
            </button>
            {mutation.isError && (
              <p className="text-sm text-rose-600">Error: {(mutation.error as Error).message}</p>
            )}
          </div>
        </form>

        <section className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Decision Summary</h2>
            {mutation.data ? (
              <div className="mt-4 space-y-4">
                <div className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm text-slate-500">Decision</p>
                    <div className="mt-1 flex items-center gap-3">
                      <DecisionBadge decision={mutation.data.decision} />
                      <span className="text-sm font-medium text-slate-700">
                        Probability {Math.round(mutation.data.score * 100)}%
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Model Version</p>
                    <p className="text-sm font-medium text-slate-700">{mutation.data.modelVersion}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-slate-100 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-800">Plain-language rationale</p>
                  <p className="mt-2 text-sm text-slate-600">{mutation.data.explanationSummary}</p>
                </div>
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Submit a scenario to view the AI&apos;s decision, probability score, and explanation.
              </p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Top drivers</h2>
              <p className="text-xs text-slate-500">
                Impact values combine model weight and feature normalization.
              </p>
            </div>

            {mutation.data ? (
              <div className="mt-4 divide-y divide-slate-100">
                {topImpacts.map((impact) => (
                  <div key={impact.feature} className="flex flex-col gap-2 py-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{impact.feature}</p>
                      <p className="text-xs text-slate-500">
                        Value {impact.displayValue ?? impact.value} ·{" "}
                        {impact.direction === "positive" ? "Supports approval" : "Raises risk"}
                        {impact.isDefault ? " (default used)" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={clsx(
                          "rounded-md px-3 py-1 text-xs font-semibold",
                          impact.direction === "positive"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        )}
                      >
                        Impact {impact.weight.toFixed(2)}
                      </span>
                      {impact.normalizedValue !== undefined && (
                        <span className="text-xs text-slate-500">
                          Normalized {impact.normalizedValue?.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {topImpacts.length === 0 && (
                  <p className="py-6 text-sm text-slate-500">
                    No feature contributions were returned for this decision.
                  </p>
                )}
              </div>
            ) : (
              <p className="mt-4 text-sm text-slate-500">
                Feature contributions (SHAP-inspired) will appear after you submit an application.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ApplicationsPage;

