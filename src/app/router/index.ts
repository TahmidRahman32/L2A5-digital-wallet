import { Router } from "express";
import { authRouter } from "../modules/auth/autn.route";
import { UserRouter } from "../modules/user/user.route";
import walletRouter from "../modules/wallet/wallet.route";

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
];

modulesRoutes.forEach((route) => {
   router.use(route.path, route.route);
});
