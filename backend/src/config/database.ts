import mongoose from "mongoose";

import { env } from "./env";

export const connectToDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 5_000,
  });

  if (env.nodeEnv !== "test") {
    // eslint-disable-next-line no-console
    console.log("[database] connected");
  }
};

export const disconnectFromDatabase = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
};


