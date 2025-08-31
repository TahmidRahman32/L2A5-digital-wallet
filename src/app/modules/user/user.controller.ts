import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { UserService } from "./user.service";
import { catchAsync } from "../../middlewares/Utils/catchAsync";
import { sendResponse } from "../../middlewares/Utils/sendResponse";



const createUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   const user = await UserService.createUser(req.body);

   sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User Created Successfully",
      data: user,
   });
});
const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   const userId = req.params.id;
   const VerifyToken = req.user;
   const payload = req.body;
   const user = await UserService.updateUser(userId, payload, VerifyToken!);

   sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "User Update Successfully",
      data: user,
   });
});

const getAllUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   const result = await UserService.getAllUsers();
   sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "All  Users Retrieved Successfully",
      data: result,
      meta: result.meta ? { total: result.meta.Total } : undefined,
   });
});

export const UserController = {
   createUser,
   getAllUsers,
   updateUser,
};
