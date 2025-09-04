import { JwtPayload } from "jsonwebtoken";
import { envConfig } from "../config/env";
import AppError from "../errorHelpers/appError";
import { Status, IUser } from "../../modules/user/user.interface";
import { generateToken, verifiedToken } from "./jwt";
import httpStatus from "http-status-codes";
import User from "../../modules/user/user.model";
export const createUserToken = (user: Partial<IUser>) => {
   const jwtPayload = {
      userId: user._id,
      email: user.email,
      role: user.role,
   };
   const accessToken = generateToken(jwtPayload, envConfig.JWT_ACCESS_SECRET, envConfig.JWT_EXPIRES_IN);

   const refreshToken = generateToken(jwtPayload, envConfig.JWT_REFRESH_SECRET, envConfig.JWT_REFRESH_EXPIRES_IN);

   return {
      accessToken,
      refreshToken,
   };
};

export const createNewAccessTokenWithRefreshToken = async (refreshToken: string) => {
   const verifyRefreshToken = verifiedToken(refreshToken, envConfig.JWT_REFRESH_SECRET) as JwtPayload;

   const isUserExist = await User.findOne({ email: verifyRefreshToken.email });

   if (!isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User Does Not Exist");
   }
   if (isUserExist.status === Status.SUSPENDED || isUserExist.status === Status.DELETED) {
      throw new AppError(httpStatus.BAD_REQUEST, `user is ${isUserExist.status}`);
   }

   const jwtPayload = {
      userId: isUserExist._id,
      email: isUserExist.email,
      role: isUserExist.role,
   };
   const accessToken = generateToken(jwtPayload, envConfig.JWT_ACCESS_SECRET, envConfig.JWT_EXPIRES_IN);

   return accessToken;
};
