import { Schema, model, type Document } from "mongoose";

import type { ConsentMap } from "../types/consent";

export interface CustomerDocument extends Document {
  customerId: string;
  fullName: string;
  email: string;
  consent: ConsentMap;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const consentDefault: ConsentMap = {
  credit_history: true,
  income_data: true,
  employment_data: true,
  transaction_monitoring: true,
};

const customerSchema = new Schema<CustomerDocument>(
  {
    customerId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    consent: {
      credit_history: { type: Boolean, default: consentDefault.credit_history },
      income_data: { type: Boolean, default: consentDefault.income_data },
      employment_data: { type: Boolean, default: consentDefault.employment_data },
      transaction_monitoring: {
        type: Boolean,
        default: consentDefault.transaction_monitoring,
      },
    },
    metadata: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
    collection: "customers",
  },
);

export const CustomerModel = model<CustomerDocument>("Customer", customerSchema);


