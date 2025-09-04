import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/Utils/catchAsync";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../middlewares/Utils/sendResponse";
import { walletService } from "./wallet.service";
import { use } from "passport";


export const getMyWallet = catchAsync(async (req: Request, res: Response) => {
   const userId = (req.user as { userId: string })?.userId;
   const result = await walletService.getMyWallet(userId);

   sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "My Wallet Retrieved Successfully",
      data: { wallet: result.wallet },
   });
});
export const addMoney = catchAsync(async (req: Request, res: Response) => {
   const { amount } = req.body;
   const userId = (req.user as { userId: string })?.userId;
   console.log(userId, amount);

   await walletService.addMoney(userId, amount, res);
});

export const withdrawMoney = catchAsync(async (req: Request, res: Response) => {
   const { amount } = req.body;
   // console.log(amount, "Withdrawal Amount");

const userId = (req.user as { userId: string })?.userId;

   await walletService.withdrawMoney(userId, amount, res);
});
export const sendMoney = catchAsync(async (req: Request, res: Response) => {
   const { amount, recipientPhone } = req.body;
   const senderId = (req.user as { userId: string })?.userId;

   await walletService.sendMoney(senderId, recipientPhone, amount, res);
});

export const walletController = {
   // getWallet,
   getMyWallet,
   addMoney,
   withdrawMoney,
   sendMoney,
};
