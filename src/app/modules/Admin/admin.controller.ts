// src/modules/admin/admin.controller.ts
import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/Utils/catchAsync";
import AppError from "../../middlewares/errorHelpers/appError";
import httpStatus from "http-status-codes";
import { Wallet } from "../wallet/wallet.model";

import { Transaction } from "../transaction/transaction.model";
import User from "../user/user.model";

// Define a custom interface for the authenticated request
interface AuthRequest extends Request {
   user?: {
      userId: string;
      role: string;
      // Add other user properties as needed
   };
}

export const blockWallet = catchAsync(async (req: Request, res: Response) => {
   const { userId } = req.params;
   const { isBlocked, reason } = req.body;
   const adminId = (req.user as any)?.userId;

   if (typeof isBlocked !== "boolean") {
      throw new AppError(httpStatus.BAD_REQUEST, "isBlocked must be a boolean value");
   }

   // Find the user
   const user = await User.findById(userId);
   if (!user) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
   }

   // Find the user's wallet
   const wallet = await Wallet.findOne({ user: userId });
   if (!wallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Wallet not found for this user");
   }

   // Update the wallet block status
   const updatedWallet = await Wallet.findByIdAndUpdate(wallet._id, { isBlocked, lastBlockedBy: adminId, lastBlockedAt: isBlocked ? new Date() : null }, { new: true, runValidators: true }).populate("user", "name phone email");

   // Create an audit log transaction
   if (isBlocked) {
      await Transaction.create({
         type: "admin-action",
         initiatedBy: adminId,
         status: "completed",
         description: `Wallet blocked by admin. Reason: ${reason || "Not specified"}`,
         metadata: {
            action: "block-wallet",
            userId: userId,
            walletId: wallet._id,
            reason: reason,
         },
      });
   } else {
      await Transaction.create({
         type: "admin-action",
         initiatedBy: adminId,
         status: "completed",
         description: "Wallet unblocked by admin",
         metadata: {
            action: "unblock-wallet",
            userId: userId,
            walletId: wallet._id,
         },
      });
   }

   res.status(httpStatus.OK).json({
      status: "success",
      message: `Wallet ${isBlocked ? "blocked" : "unblocked"} successfully`,
      data: { wallet: updatedWallet },
   });
});

export const getWalletStatus = catchAsync(async (req: Request, res: Response) => {
   const { userId } = req.params;

   // Find the user's wallet
   const wallet = await Wallet.findOne({ user: userId }).populate("user", "name phone email");

   if (!wallet) {
      throw new AppError(httpStatus.NOT_FOUND, "Wallet not found for this user");
   }

   res.status(httpStatus.OK).json({
      status: "success",
      data: { wallet },
   });
});

export const adminController = {
   blockWallet,
   getWalletStatus,
};
