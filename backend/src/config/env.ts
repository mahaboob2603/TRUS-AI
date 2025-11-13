import dotenv from "dotenv";

dotenv.config();

const getEnv = (key: string, fallback?: string): string => {
  const value = process.env[key];
  if (value && value.length > 0) {
    return value;
  }
  if (fallback !== undefined) {
    return fallback;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return "";
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  mongoUri: getEnv("MONGODB_URI", "mongodb://localhost:27017/trus-ai"),
  huggingFace: {
    apiUrl: getEnv(
      "HUGGINGFACE_API_URL",
      "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
    ),
    token: getEnv("HUGGINGFACE_API_TOKEN", "demo-token"),
  },
} as const;



