import { Router } from "express";
import { UserController } from "./user.controller";

import { validationRequest } from "../../middlewares/validate";
import { authCheck } from "../../middlewares/checkAuth";
import { Role } from "./user.interface";
import { createUserZodSchema, updateUserZodSchema } from "./user.validation";

const router = Router();
router.post("/register", validationRequest(createUserZodSchema), UserController.createUser);
router.get("/all-users", authCheck(Role.ADMIN), UserController.getAllUsers);
router.patch("/:id", validationRequest(updateUserZodSchema), authCheck(...Object.values(Role)), UserController.updateUser);

export const UserRouter = router;
