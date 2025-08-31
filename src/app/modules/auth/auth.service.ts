import AppError from "../../middlewares/errorHelpers/appError";
import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { envConfig } from "../../middlewares/config/env";
import { createNewAccessTokenWithRefreshToken, createUserToken } from "../../middlewares/Utils/users.token";
import User from "../user/user.model";
import { IUser } from "../user/user.interface";
const credentialLogin = async (payload: Partial<IUser>) => {
   const { email, password } = payload;

   const isUserExist = await User.findOne({ email });

   if (!isUserExist) {
      throw new AppError(httpStatus.BAD_REQUEST, "User Does Not Exist");
   }

   const isPasswordMatch = await bcryptjs.compare(password as string, isUserExist.password as string);
   if (!isPasswordMatch) {
      throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password");
   }

   const userToken = createUserToken(isUserExist);

   const { password: pass, ...rest } = isUserExist.toObject();

   return {
      accessToken: userToken.accessToken,
      refreshToken: userToken.refreshToken,
      user: rest,
   };
};
const getNewAccessToken = async (refreshToken: string) => {
   const NewAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken);

   return {
      accessToken: NewAccessToken,
   };
};
const restPassword = async (oldPassword: string, newPassword: string, decodedToken: JwtPayload) => {
   // console.log(decodedToken.email, 'user email ache');

   const user = await User.findOne(decodedToken.email);

   const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user!.password as string);
   if (!isOldPasswordMatch) {
      throw new AppError(httpStatus.UNAUTHORIZED, "Old password Does Not match");
   }

   user!.password = await bcryptjs.hash(newPassword, Number(envConfig.BCRYPT_SALT_ROUNDS));

   user!.save();
};

export const authServices = {
   credentialLogin,
   getNewAccessToken,
   restPassword,
};
