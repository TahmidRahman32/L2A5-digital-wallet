import { Router } from "express";
import { authCheck } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { walletController } from "./wallet.controller";
import { validationRequest } from "../../middlewares/validate";
import {sendMoneySchema } from "./wallet.validation";

const walletRouter = Router();

walletRouter.get("/me", authCheck(Role.USER), walletController.getMyWallet);
walletRouter.patch("/top-up", authCheck(Role.USER, Role.AGENT), walletController.addMoney);
walletRouter.patch("/withdraw", authCheck(Role.USER, Role.AGENT), walletController.withdrawMoney);
walletRouter.patch("/send", validationRequest(sendMoneySchema), authCheck(Role.USER, Role.AGENT), walletController.sendMoney);
// walletRouter.post("/add-money", authCheck(Role.USER), walletController.addMoney);

export default walletRouter;
