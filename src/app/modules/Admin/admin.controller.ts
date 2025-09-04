// src/modules/admin/admin.controller.ts
import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/Utils/catchAsync";
import AppError from "../../middlewares/errorHelpers/appError";
import httpStatus from "http-status-codes";
import { Wallet } from "../wallet/wallet.model";
import User from "../user/user.model";
import { Role } from "../user/user.interface";
import is from "zod/v4/locales/is.cjs";
import { Transaction } from "../transaction/transaction.model";

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

export const unblockWallet = catchAsync(async (req: Request, res: Response) => {
   const { userId } = req.params;
   const adminId = (req.user as any)?.userId;

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

   // Check if wallet is already unblocked
   if (!wallet.isBlocked) {
      throw new AppError(httpStatus.BAD_REQUEST, "Wallet is already unblocked");
   }

   // Update the wallet to unblock it
   const updatedWallet = await Wallet.findByIdAndUpdate(
      wallet._id,
      {
         isBlocked: false,
         lastBlockedBy: undefined,
         lastBlockedAt: undefined,
         blockReason: undefined,
      },
      { new: true, runValidators: true }
   ).populate("user", "name phone email");

   res.status(httpStatus.OK).json({
      status: "success",
      message: "Wallet unblocked successfully",
      data: { wallet: updatedWallet },
   });
});

export const approveAgent = catchAsync(async (req: Request, res: Response) => {
   const { agentId } = req.params;
   const { isApproved, reason } = req.body;
   const userRole = (req.user as any)?.role;
   // console.log(isApproved, reason);
   
   if (typeof isApproved !== "boolean") {
      throw new AppError(httpStatus.BAD_REQUEST, "isApproved must be a boolean value");
   }
   
   // Find the agent
   const agent = await User.findById(agentId);
   
   if (userRole === Role.AGENT) {
      throw new AppError(httpStatus.BAD_REQUEST, `User is already a ${Role.AGENT}`);
   }
   
   // Prevent admins from modifying other admins (unless super admin)
   if (userRole !== Role.ADMIN) {
      throw new AppError(httpStatus.FORBIDDEN, "Cannot modify other admin accounts");
   }
   if (!agent) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
   }
   
   // Check if the user is actually an agent
   if (agent.role !== Role.USER) {
      throw new AppError(httpStatus.BAD_REQUEST, "User is not an agent");
   }
   
   // Check if agent is already approved
   if (agent.isApproved) {
      throw new AppError(httpStatus.BAD_REQUEST, "Agent is already approved");
   }
   
   // Update the agent approval status
   const updatedAgent = await User.findByIdAndUpdate(
      agentId,
      { isApproved, role: isApproved ? Role.AGENT : Role.USER },
      { new: true, runValidators: true }
   ).select("-password");

   // Create wallet for agent if it doesn't exist (when approving)
   if (isApproved) {
      const walletExists = await Wallet.exists({ user: agentId });
      if (!walletExists) {
         await Wallet.create({ user: agentId, balance: 50 });
      }
   }

   // // Create an audit log transaction
   // if (isApproved) {
   //    await Transaction.create({
   //       type: "admin-action",
   //       initiatedBy: adminId,
   //       status: "completed",
   //       description: `Agent approved by admin. Reason: ${reason || "Not specified"}`,
   //       metadata: {
   //          action: "approve-agent",
   //          agentId: agentId,
   //          reason: reason,
   //       },
   //    });
   // } else {
   //    await Transaction.create({
   //       type: "admin-action",
   //       initiatedBy: adminId,
   //       status: "completed",
   //       description: `Agent suspended by admin. Reason: ${reason || "Not specified"}`,
   //       metadata: {
   //          action: "suspend-agent",
   //          agentId: agentId,
   //          reason: reason,
   //       },
   //    });
   // }

   res.status(httpStatus.OK).json({
      status: "success",
      message: `Agent ${isApproved ? "approved" : "suspended"} successfully`,
      data: { agent: updatedAgent },
   });
});

export const suspendAgent = catchAsync(async (req: Request, res: Response) => {
   const { agentId } = req.params;
   const { reason } = req.body;
   const adminId = (req.user as any)?.userId;

   const agent = await User.findById(agentId);
   if (!agent) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
   }

   // Check if the user is actually an agent
   if (agent.role !== Role.AGENT) {
      throw new AppError(httpStatus.BAD_REQUEST, "User is not an agent");
   }

   // Check if agent is already suspended
   if (!agent.isApproved) {
      throw new AppError(httpStatus.BAD_REQUEST, "Agent is already suspended");
   }
   const updatedAgent = await User.findByIdAndUpdate(agentId, { isApproved: false, role: Role.USER }, { new: true, runValidators: true }).select("-password");

   // Create an audit log transaction
   // await Transaction.create({
   //    type: "admin-action",
   //    initiatedBy: adminId,
   //    status: "completed",
   //    description: `Agent suspended by admin. Reason: ${reason || "Not specified"}`,
   //    metadata: {
   //       action: "suspend-agent",
   //       agentId: agentId,
   //       reason: reason,
   //    },
   // });

   res.status(httpStatus.OK).json({
      status: "success",
      message: "Agent suspended successfully",
      data: { agent: updatedAgent },
   });
});

export const adminController = {
   blockWallet,
   getWalletStatus,
   unblockWallet,
   approveAgent,
   suspendAgent,
};
