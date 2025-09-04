import mongoose from "mongoose";
import AppError from "../../middlewares/errorHelpers/appError";
import { Wallet } from "./wallet.model";
import httpStatus from "http-status-codes";
import { Transaction } from "../transaction/transaction.model";
import { Response } from "express";
import { sendResponse } from "../../middlewares/Utils/sendResponse";
import { envConfig } from "../../middlewares/config/env";
import {  transactionSendMoney, } from "../transaction/transaction.controller";
import User from "../user/user.model";
import { transactions } from "../transaction/transaction.service";

const getMyWallet = async (userId: string) => {
   const wallet = await Wallet.findOne({ user: userId });
   if (!wallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Wallet Not Found");
   }

   if (!wallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Wallet Not Found");
   }
   return {
      userId,
      wallet,
   };
};

const addMoney = async (userId: string, amount: number, resp: Response) => {
   if (amount <= 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid amount");
   }

   const session = await mongoose.startSession();
   session.startTransaction();

   try {
      const userAmount = userId;

      const wallet = await Wallet.findOneAndUpdate({ user: userAmount }, { $inc: { balance: amount } }, { new: true, session });

      if (!wallet) {
         throw new AppError(httpStatus.NOT_FOUND, "Wallet not found or blocked");
      }
      // const transaction = await transactionAddMoney(userAmount, amount, session);
      const transaction = await transactions(
         userAmount,
         amount,
         0,
         "add",
         "completed",
         `Added ৳${amount} to wallet`,
         session
      );

      await session.commitTransaction();
      session.endSession();

      sendResponse(resp, {
         statusCode: httpStatus.OK,
         success: true,
         message: "My Wallet Retrieved Successfully",
         data: { wallet, transaction },
      });
   } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
   }
   return {
      Wallet,
      Transaction,
   };
};

const withdrawMoney = async (userId: string, amount: number, resp: Response) => {
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
      const wallet = await Wallet.findOne({ user: userId });

      if (!wallet) {
         throw new AppError(httpStatus.NOT_FOUND, "Wallet not found");
      }

      const totalDeduction = amountNum + feeNum;
      // console.log(totalDeduction, "Total Deduction");

      if (wallet.balance < totalDeduction) {
         throw new AppError(httpStatus.BAD_REQUEST, `Insufficient balance. Need ${totalDeduction} Taka (amount + fee)`);
      }

      // Deduct amount + fee from wallet
      const updatedWallet = await Wallet.findByIdAndUpdate(wallet._id, { $inc: { balance: -totalDeduction } }, { new: true, session });
      // console.log(updatedWallet, "Updated Wallet");
      // const transaction = await transactionWithdraw(userId, amountNum, feeNum, session);

      const transaction = await transactions(
         userId, 
         amountNum,
         feeNum,
         "withdraw",
         "completed",
         `Withdrawal of ৳${amountNum} (Fee: ৳${feeNum})`,
         session
      );

      await session.commitTransaction();
      session.endSession();

      sendResponse(resp, {
         statusCode: httpStatus.OK,
         success: true,
         message: `Withdrawal successful. ৳${feeNum} fee charged`,
         data: {
            wallet: updatedWallet,
            transaction: transaction,
         },
      });
   } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
   }
   return {
      Wallet,
      Transaction,
   };
};

const sendMoney = async (senderId: string, recipientPhoneNumber: string, amount: number, resp: Response) => {
   const TRANSACTION_FEE = envConfig.TRANSACTION_FEE;

   if (!senderId) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
   }
   const amountNum = Number(amount);
   const feeNum = Number(TRANSACTION_FEE);

   if (!amountNum || amountNum <= 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid amount");
   }

   if (!recipientPhoneNumber) {
      throw new AppError(httpStatus.BAD_REQUEST, "Recipient phone number is required");
   }

   const sender = await User.findById(senderId);
   if (sender && sender.phone === recipientPhoneNumber) {
      throw new AppError(httpStatus.BAD_REQUEST, "Cannot send money to yourself");
   }

   if (isNaN(amountNum) || amountNum <= 0) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid amount");
   }
   if (isNaN(feeNum) || feeNum < 0) {
      throw new AppError(httpStatus.INTERNAL_SERVER_ERROR, "Invalid withdrawal fee configuration");
   }

   const session = await mongoose.startSession();
   session.startTransaction();

   try {
      const recipient = await User.findOne({ phone: recipientPhoneNumber });

      if (!recipient) {
         throw new AppError(httpStatus.NOT_FOUND, "Recipient not found");
      }

      if (!recipient.isActive) {
         throw new AppError(httpStatus.FORBIDDEN, "Recipient account is deactivated");
      }

      const senderWallet = await Wallet.findOne({ user: senderId });

      if (!senderWallet) {
         throw new AppError(httpStatus.NOT_FOUND, "Sender wallet not found");
      }

      if (senderWallet.isBlocked) {
         throw new AppError(httpStatus.FORBIDDEN, "Your wallet is blocked");
      }

      const recipientWallet = await Wallet.findOne({ user: recipient._id });

      if (!recipientWallet) {
         throw new AppError(httpStatus.NOT_FOUND, "Recipient wallet not found");
      }

      if (recipientWallet.isBlocked) {
         throw new AppError(httpStatus.FORBIDDEN, "Recipient wallet is blocked");
      }

      // Calculate total deduction (amount + fee)
      const totalDeduction = amountNum + feeNum;

      if (senderWallet.balance < totalDeduction) {
         throw new AppError(httpStatus.BAD_REQUEST, `Insufficient balance. Need ${totalDeduction} Taka (amount + fee)`);
      }

      // Deduct amount + fee from sender's wallet
      const updatedSenderWallet = await Wallet.findByIdAndUpdate(senderWallet._id, { $inc: { balance: -totalDeduction } }, { new: true, session });

      // Add amount to recipient's wallet
      const updatedRecipientWallet = await Wallet.findByIdAndUpdate(recipientWallet._id, { $inc: { balance: amount } }, { new: true, session });

      // Create transaction record
      const transaction = await transactionSendMoney(senderId, recipient._id.toString() , amountNum, session);

      await session.commitTransaction();
      session.endSession();
      sendResponse(resp, {
         statusCode: httpStatus.OK,
         success: true,
         message: `Transfer successful. ৳${feeNum} fee charged`,
         data: {
            transaction: transaction[0],
            senderBalance: updatedSenderWallet?.balance,
            recipient: {
               phone: recipient.phone,
               name: recipient.name,
            },
         },
      });

      // resp.status(httpStatus.OK).json({
      //    status: "success",
      //    message: `Transfer successful. ৳${feeNum} fee charged`,
      //    data: {
      //       transaction: transaction[0],
      //       senderBalance: updatedSenderWallet?.balance,
      //       recipient: {
      //          phone: recipient.phone,
      //          name: recipient.name,
      //       },
      //    },
      // });
   } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
   }
};

export const walletService = {
   getMyWallet,
   addMoney,
   withdrawMoney,
   sendMoney,
};
