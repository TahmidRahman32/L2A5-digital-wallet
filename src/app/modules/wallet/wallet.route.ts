import { Router } from "express";
import { authCheck } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { walletController } from "./wallet.controller";

const walletRouter = Router();

walletRouter.get("/me", authCheck(Role.USER), walletController.getMyWallet);
walletRouter.patch("/topup", authCheck(Role.USER, Role.AGENT), walletController.addMoney);
walletRouter.patch("/withdraw", authCheck(Role.USER), walletController.withdrawMoney);
// walletRouter.post("/add-money", authCheck(Role.USER), walletController.addMoney);

export default walletRouter;
