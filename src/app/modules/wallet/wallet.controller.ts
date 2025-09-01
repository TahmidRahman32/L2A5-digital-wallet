import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/Utils/catchAsync";
import AppError from "../../middlewares/errorHelpers/appError";
import httpStatus from "http-status-codes";
import { Wallet } from "./wallet.model";
import mongoose from "mongoose";
import { Transaction } from "../transaction/transaction.model";
import { envConfig } from "../../middlewares/config/env";
import { sendResponse } from "../../middlewares/Utils/sendResponse";

export const getMyWallet = catchAsync(async (req: Request, res: Response) => {
   const userId = (req.user as any)?.userId;
   // console.log(userId, "UserId");
   const wallet = await Wallet.findOne({ user: userId });
   if (!wallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Wallet Not Found");
   }

   if (!wallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Wallet Not Found");
   }
   

   res.status(200).json({
      status: "success",
      data: { wallet },
   });
});

export const addMoney = catchAsync(async (req: Request, res: Response) => {
   const { amount } = req.body;

   if (amount <= 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid amount");
   }

   const session = await mongoose.startSession();
   session.startTransaction();

   try {
      // Update wallet balance
      const userId = (req.user as any)?.userId;
      console.log(userId);

      const wallet = await Wallet.findOneAndUpdate({ user: userId }, { $inc: { balance: amount } }, { new: true, session });

      if (!wallet) {
         throw new AppError(httpStatus.NOT_FOUND, "Wallet not found or blocked");
      }

      // Create transaction record
      const transaction = await Transaction.create(
         [
            {
               to: userId,
               amount,
               type: "deposit",
               initiatedBy: userId,
               status: "completed",
               description: `Deposit of ৳${amount} to own wallet`,
            },
         ],
         { session }
      );

      await session.commitTransaction();
      session.endSession();

      res.status(200).json({
         status: "success",
         data: { wallet, transaction },
      });
   } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
   }
});

export const withdrawMoney = catchAsync(async (req: Request, res: Response) => {
   const { amount } = req.body;
   console.log(amount, "Withdrawal Amount");

   const userId = (req.user as any)?.userId;
   console.log(userId, "UserId not found");

   const WITHDRAWAL_FEE = envConfig.WITHDRAWAL_FEE; // string from .env

   if (!userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
   }

   const amountNum = Number(amount);
   const feeNum = Number(WITHDRAWAL_FEE);

   if (isNaN(amountNum) || amountNum <= 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid amount");
   }
   if (isNaN(feeNum) || feeNum < 0) {
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Invalid withdrawal fee configuration");
   }

   const session = await mongoose.startSession();
   session.startTransaction();

   try {
      // Check if user has sufficient balance (amount + fee)
      const wallet = await Wallet.findOne({ user: userId });

      if (!wallet) {
         throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
      }

      const totalDeduction = amountNum + feeNum;
      console.log(totalDeduction, "Total Deduction");

      if (wallet.balance < totalDeduction) {
         throw new AppError(httpStatus.BAD_REQUEST, `Insufficient balance. Need ${totalDeduction} Taka (amount + fee)`);
      }

      // Deduct amount + fee from wallet
      const updatedWallet = await Wallet.findByIdAndUpdate(wallet._id, { $inc: { balance: -totalDeduction } }, { new: true, session });
      console.log(updatedWallet, "Updated Wallet");

      // Create transaction record
      const transaction = await Transaction.create(
         [
            {
               from: userId,
               amount: amountNum,
               fee: feeNum,
               type: "withdraw",
               initiatedBy: userId,
               status: "completed",
               description: `Withdrawal of ৳${amountNum} (Fee: ৳${feeNum})`,
            },
         ],
         { session }
      );

      await session.commitTransaction();
      session.endSession();

      res.status(httpStatus.OK).json({
         status: "success",
         message: `Withdrawal successful. ৳${feeNum} fee charged`,
         data: {
            wallet: updatedWallet,
            transaction: transaction[0],
         },
      });
   } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
   }
});

export const walletController = {
   // getWallet,
   getMyWallet,
   addMoney,
   withdrawMoney,
};
