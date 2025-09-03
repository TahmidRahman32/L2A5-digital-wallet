// src/modules/agent/agent.route.ts
import express from "express";

import { authCheck } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { agentController } from "./agent.Controller";
import { validationRequest } from "../../middlewares/validate";
import { cashInSchema } from "../wallet/wallet.validation";

const router = express.Router();
router.post("/cash-in", authCheck(Role.AGENT), validationRequest(cashInSchema), agentController.cashIn);
router.post("/cash-out", authCheck(Role.AGENT), validationRequest(cashInSchema), agentController.cashOut);

// POST /agent/cash-in - Add money to user's wallet
// router.post("/cash-in", validate(cashInSchema), cashIn);
export const agentRouter = router;
