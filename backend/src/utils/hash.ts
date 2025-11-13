import crypto from "node:crypto";

export const computeHash = (input: string): string => {
  return crypto.createHash("sha256").update(input).digest("hex");
};


