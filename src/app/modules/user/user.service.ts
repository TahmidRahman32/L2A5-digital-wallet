import AppError from "../../middlewares/errorHelpers/appError";
import { IauthProvider, IUser, Role } from "./user.interface";

import httpStatus from "http-status-codes";
import bcryptjs from "bcryptjs";
import { envConfig } from "../../middlewares/config/env";
import { JwtPayload } from "jsonwebtoken";
import User from "./user.model";
import { Wallet } from "../wallet/wallet.model";
const createUser = async (payload: Partial<IUser>) => {
   const { email, password, ...rest } = payload;
   const hashedPassword = await bcryptjs.hash(password as string, Number(envConfig.BCRYPT_SALT_ROUNDS));
   const authProvider: IauthProvider = { provider: "credential", providerId: email! };

   const user = await User.create({
      email,
      password: hashedPassword,
      auth: [authProvider],
      ...rest,
   });

   const wallet = await Wallet.create({ user: user._id });

   return {
      user,
      wallet,
   };
};

const updateUser = async (userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) => {
   const ifUserExist = await User.findById(userId).select("-password");
   if (!ifUserExist) {
      throw new AppError(httpStatus.NOT_FOUND, "User Not Found");
   }

   if (payload.role) {
      if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
         throw new AppError(httpStatus.NOT_FOUND, "you are not authorized");
      }
      if (decodedToken.role === Role.ADMIN && decodedToken.role === Role.ADMIN) {
         throw new AppError(httpStatus.NOT_FOUND, "you are not authorized");
      }
   }
   if (payload.status || payload.status || payload.status) {
      if (decodedToken.role === Role.USER || decodedToken.role === Role.AGENT) {
         throw new AppError(httpStatus.NOT_FOUND, "you are not authorized");
      }
   }
   if (payload.password) {
      payload.password = await bcryptjs.hash(payload.password, Number(envConfig.BCRYPT_SALT_ROUNDS));
   }

   const newUpdateUser = await User.findByIdAndUpdate(userId, payload, { new: true, runValidators: true }).select("-password");

   return newUpdateUser;
};

const getAllUsers = async () => {
   const users = await User.find({}).select("-password");

   const totalUsers = await User.countDocuments();

   return {
      data: users,
      meta: {
         Total: totalUsers,
      },
   };
};

export const UserService = {
   createUser,
   getAllUsers,
   updateUser,
};
