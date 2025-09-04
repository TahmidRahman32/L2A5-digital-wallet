// src/modules/admin/admin.route.ts
import express from "express";

import { approveAgent, blockWallet, getWalletStatus, suspendAgent, unblockWallet } from "./admin.controller";
import { authCheck } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";

const router = express.Router();

router.get("/status/:userId", authCheck(Role.ADMIN), getWalletStatus);
router.patch("/block/:userId", authCheck(Role.ADMIN), blockWallet);
router.patch("/unblock/:userId", authCheck(Role.ADMIN), unblockWallet);
router.patch("/approve-agent/:agentId", authCheck(Role.ADMIN), approveAgent);
router.patch("/suspend-agent/:agentId", authCheck(Role.ADMIN), suspendAgent);

export const adminRouter = router;
