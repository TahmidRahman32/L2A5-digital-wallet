import { Router } from "express";
import { authRouter } from "../modules/auth/autn.route";
import { UserRouter } from "../modules/user/user.route";
import walletRouter from "../modules/wallet/wallet.route";
import { transactionRouter } from "../modules/transaction/transaction.route";
import { agentRouter } from "../modules/Agent/agent.route";
import { adminRouter } from "../modules/Admin/admin.route";

export const router = Router();

const modulesRoutes = [
   {
      path: "/user",
      route: UserRouter,
   },
   {
      path: "/auth",
      route: authRouter,
   },
   {
      path: "/wallet",
      route: walletRouter,
   },
   {
      path: "/transactions",
      route: transactionRouter,
   },
   {
      path: "/agent",
      route: agentRouter,
   },
   {
      path: "/admin",
      route: adminRouter,
   },
];

modulesRoutes.forEach((route) => {
   router.use(route.path, route.route);
});
