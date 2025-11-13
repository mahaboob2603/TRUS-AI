import { Router } from "express";

import { getConsentHandler, updateConsentHandler } from "../controllers/consentController";

const router = Router();

router.get("/:customerId", getConsentHandler);
router.put("/:customerId", updateConsentHandler);

export const consentRouter = router;


