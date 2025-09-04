import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/Utils/catchAsync";
import AppError from "../../middlewares/errorHelpers/appError";
import httpStatus from "http-status-codes";
import { Wallet } from "../wallet/wallet.model";
import mongoose from "mongoose";
import User from "../user/user.model";
import { envConfig } from "../../middlewares/config/env";
import { Role } from "../user/user.interface";
import agentTransaction from "./agent.transaction";

export const cashIn = catchAsync(async (req: Request, res: Response) => {
   const { amount, userPhone } = req.body;
   const userId = (req.user as any)?.userId;
   const userRole = (req.user as any)?.role;
   const agentId = userId;
   const agentRole = userRole;
   const CASH_IN_FEE = envConfig.CASH_IN_FEE;
   const AGENT_COMMISSION = envConfig.AGENT_COMMISSION_RATE * amount;
   if (agentRole !== Role.AGENT) {
      throw new AppError(httpStatus.FORBIDDEN, "Only agents can perform cash-in operations");
   }
   const agent = await User.findById(agentId).select("-password");
   if (!agent || (agent as any).isApproved === false) {
      throw new AppError(httpStatus.FORBIDDEN, "Agent account is not approved");
   }
   if (!amount || amount <= 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid amount");
   }

   if (!userPhone) {
      throw new AppError(httpStatus.BAD_REQUEST, "User phone number is required");
   }

   const session = await mongoose.startSession();
   session.startTransaction();

   try {
      const user = await User.findOne({ phone: userPhone }).select("-password");

      if (!user) {
         throw new AppError(httpStatus.NOT_FOUND, "User not found");
      }

      if (!user.isActive) {
         throw new AppError(httpStatus.FORBIDDEN, "User account is deactivated");
      }

      let userWallet = await Wallet.findOne({ user: user._id });

      if (!userWallet) {
         userWallet = (await Wallet.create([{ user: user._id, balance: amount }], { session }))[0];
      } else if (userWallet.isBlocked) {
         throw new AppError(httpStatus.FORBIDDEN, "User wallet is blocked");
      } else {
         userWallet = await Wallet.findByIdAndUpdate(userWallet._id, { $inc: { balance: amount } }, { new: true, session });
      }

      const transaction = await agentTransaction(user._id.toString(), agentId, amount, CASH_IN_FEE, AGENT_COMMISSION, "cash-in", agentId, "completed", `Cash-in of ৳${amount} by agent to ${user.phone}`, session);
      await session.commitTransaction();
      session.endSession();

      res.status(httpStatus.OK).json({
         status: "success",
         message: `Cash-in successful. ৳${amount} added to user's wallet`,
         data: {
            transaction: transaction[0],
            user: {
               phone: user.phone,
               name: user.name,
               newBalance: userWallet?.balance,
            },
         },
      });
   } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
   }
});
export const cashOut = catchAsync(async (req: Request, res: Response) => {
   const { amount, userPhone } = req.body;

   const userId = (req.user as any)?.userId;
   const userRole = (req.user as any)?.role;
   const agentId = userId;
   const agentRole = userRole;
   const CASH_OUT_FEE = envConfig.CASH_OUT_FEE;
   const AGENT_COMMISSION_RATE = envConfig.AGENT_COMMISSION_RATE;

   const amountNum = Number(amount);
   const feeNum = Number(CASH_OUT_FEE);
   if (agentRole !== Role.AGENT) {
      throw new AppError(httpStatus.FORBIDDEN, "Only agents can perform cash-out operations");
   }
   const agent = await User.findById(agentId).select("-password");
   if (!agent || (agent as any).isApproved === false) {
      throw new AppError(httpStatus.FORBIDDEN, "Agent account is not approved");
   }

   if (!amountNum || amountNum <= 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid amount");
   }

   if (!userPhone) {
      throw new AppError(httpStatus.BAD_REQUEST, "User phone number is required");
   }

   const session = await mongoose.startSession();
   session.startTransaction();

   try {
      const user = await User.findOne({ phone: userPhone }).select("-password");

      if (!user) {
         throw new AppError(httpStatus.NOT_FOUND, "User not found");
      }

      if (!user.isActive) {
         throw new AppError(httpStatus.FORBIDDEN, "User account is deactivated");
      }

      const userWallet = await Wallet.findOne({ user: user._id });

      if (!userWallet) {
         throw new AppError(httpStatus.NOT_FOUND, "User wallet not found");
      }

      if (userWallet.isBlocked) {
         throw new AppError(httpStatus.FORBIDDEN, "User wallet is blocked");
      }
      const totalDeduction = amountNum + feeNum;

      if (userWallet.balance < totalDeduction) {
         throw new AppError(httpStatus.BAD_REQUEST, `Insufficient balance. User needs ${totalDeduction} Taka (amount + fee)`);
      }
      const agentWallet = await Wallet.findOne({ user: agentId });

      if (!agentWallet) {
         throw new AppError(httpStatus.NOT_FOUND, "Agent wallet not found");
      }

      if (agentWallet.isBlocked) {
         throw new AppError(httpStatus.FORBIDDEN, "Your agent wallet is blocked");
      }
      const agentCommission = amount * AGENT_COMMISSION_RATE;

      const updatedUserWallet = await Wallet.findByIdAndUpdate(userWallet._id, { $inc: { balance: -totalDeduction } }, { new: true, session });

      const updatedAgentWallet = await Wallet.findByIdAndUpdate(agentWallet._id, { $inc: { balance: amount - agentCommission } }, { new: true, session });

      const transaction = await agentTransaction(
         user._id.toString(),
         agentId,
         amount,
         CASH_OUT_FEE,
         agentCommission,
         "cash-out",
         agentId,
         "completed",
         `Cash-out of ৳${amount} by agent from ${user.phone}. Commission: ৳${agentCommission.toFixed(2)}`,
         session
      );

      await session.commitTransaction();
      session.endSession();

      res.status(httpStatus.OK).json({
         status: "success",
         message: `Cash-out successful. ৳${CASH_OUT_FEE} fee charged. Agent commission: ৳${agentCommission.toFixed(2)}`,
         data: {
            transaction: transaction[0],
            user: {
               phone: user.phone,
               name: user.name,
               newBalance: updatedUserWallet!.balance,
            },
            agent: {
               newBalance: updatedAgentWallet!.balance,
            },
         },
      });
   } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
   }
});

export const agentController = {
   cashIn,
   cashOut,
};
