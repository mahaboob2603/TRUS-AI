import cors from "cors";
import express from "express";

import { connectToDatabase } from "./config/database";
import { env } from "./config/env";
import { errorHandler } from "./middleware/errorHandler";
import { apiRouter } from "./routes";

export const createApp = (): express.Express => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "trus-ai-backend" });
  });

  app.use("/api", apiRouter);

  app.use((_req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  app.use(errorHandler);

  return app;
};

const start = async (): Promise<void> => {
  try {
    await connectToDatabase();
    const app = createApp();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`[server] listening on port ${env.port}`);
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[server] failed to start", error);
    process.exit(1);
  }
};

if (require.main === module) {
  void start();
}

