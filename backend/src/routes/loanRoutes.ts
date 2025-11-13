import { Router } from "express";

import { scoreLoanHandler } from "../controllers/loanController";

const router = Router();

router.post("/score", scoreLoanHandler);

export const loanRouter = router;


