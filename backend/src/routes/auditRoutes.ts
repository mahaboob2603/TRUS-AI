import { Router } from "express";

import { listAuditHandler } from "../controllers/auditController";

const router = Router();

router.get("/", listAuditHandler);

export const auditRouter = router;


