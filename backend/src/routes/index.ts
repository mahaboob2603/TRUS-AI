import { Router } from "express";

import { auditRouter } from "./auditRoutes";
import { consentRouter } from "./consentRoutes";
import { loanRouter } from "./loanRoutes";

const router = Router();

router.use("/loans", loanRouter);
router.use("/consent", consentRouter);
router.use("/audit", auditRouter);

export const apiRouter = router;


