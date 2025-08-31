import { Router } from "express";
import { authCheck } from "../../middlewares/checkAuth";
import { Role } from "../user/user.interface";
import { walletController } from "./wallet.controller";

const walletRouter = Router();

walletRouter.get("/", authCheck(Role.USER), walletController.getMyWallet);
// walletRouter.post("/add-money", authCheck(Role.USER), walletController.addMoney);

export default walletRouter;
