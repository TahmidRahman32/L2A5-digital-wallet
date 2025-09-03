// src/modules/transaction/transaction.route.ts
import express from "express";
import { authCheck } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { transactionController } from "./transaction.controller";



const router = express.Router();

router.get("/me", authCheck(Role.USER), transactionController.getMyTransactions);

export const transactionRouter = router;
