import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status-codes";
import { authServices } from "./auth.service";
import AppError from "../../middlewares/errorHelpers/appError";

import { envConfig } from "../../middlewares/config/env";
import passport from "passport";
import { catchAsync } from "../../middlewares/Utils/catchAsync";
import { createUserToken } from "../../middlewares/Utils/users.token";
import { setAuthCookie } from "../../middlewares/Utils/setCookie";
import { sendResponse } from "../../middlewares/Utils/sendResponse";

const credentialLogin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) {
         return next(new AppError(401, err));
      }
      if (!user) {
         return next(new AppError(401, info.message));
      }

      const userToken = await createUserToken(user);

      // delete user.toObject().password;
      const { password: pass, ...rest } = user.toObject();
      setAuthCookie(res, userToken);
      sendResponse(res, {
         statusCode: httpStatus.OK,
         success: true,
         message: "User logged Successfully",
         data: {
            accessToken: userToken.accessToken,
            refreshToken: userToken.refreshToken,
            rest,
         },
      });
   })(req, res, next);
   // res.cookie("accessToken", loginInfo.accessToken, {
   //    httpOnly: true,
   //    secure: false,
   // });
   // res.cookie("refreshToken", loginInfo.refreshToken, {
   //    httpOnly: true,
   //    secure: false,
   // });
});

const getNewAccessToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   const refreshToken = req.cookies.refreshToken;

   if (!refreshToken) {
      throw new AppError(httpStatus.BAD_REQUEST, "No Refresh Token received from Cookies");
   }
   const tokenInfo = await authServices.getNewAccessToken(refreshToken as string);
   // res.cookie("accessToken", tokenInfo.accessToken, {
   //    httpOnly: true,
   //    secure: false,
   // });
   setAuthCookie(res, tokenInfo);
   sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "New Access Token Retrieved Successfully",
      data: tokenInfo,
   });
});
const logout = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   res.clearCookie("accessToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
   });
   res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
   });
   sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "User logged Out Successfully",
      data: null,
   });
});

const resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   const decodedToken = req.user;
   const oldPassword = req.body.oldPassword;
   const newPassword = req.body.newPassword;
   await authServices.restPassword(oldPassword, newPassword, decodedToken!);

   sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Password Change Successfully",
      data: null,
   });
});
const googleCallbackController = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
   let redirectTo = req.query.state ? (req.query.state as string) : "";

   if (redirectTo.startsWith("/")) {
      redirectTo = redirectTo.slice(1);
   }
   const user = req.user;

   console.log(user, "user");

   if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "user not found");
   }

   const tokenInfo = await createUserToken(user);
   setAuthCookie(res, tokenInfo);

   res.redirect(`${envConfig.FRONTEND_URL}/${redirectTo}`);
});

export const AuthController = {
   credentialLogin,
   getNewAccessToken,
   logout,
   resetPassword,
   googleCallbackController,
};
