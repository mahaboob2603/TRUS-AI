export type ConsentCategory =
  | "credit_history"
  | "income_data"
  | "employment_data"
  | "transaction_monitoring";

export type ConsentMap = Record<ConsentCategory, boolean>;


