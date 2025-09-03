import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/Utils/catchAsync";
import httpStatus from "http-status-codes";
import { sendResponse } from "../../middlewares/Utils/sendResponse";
import { walletService } from "./wallet.service";


export const getMyWallet = catchAsync(async (req: Request, res: Response) => {
   const userId = (req.user as any)?.userId;
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
   const userId = (req.user as any)?.userId;

   await walletService.addMoney(userId, amount, res);
});

export const withdrawMoney = catchAsync(async (req: Request, res: Response) => {
   const { amount } = req.body;
   // console.log(amount, "Withdrawal Amount");

   const userId = (req.user as any)?.userId;

   await walletService.withdrawMoney(userId, amount, res);
});
export const sendMoney = catchAsync(async (req: Request, res: Response) => {
   const { amount, recipientPhone } = req.body;
   const senderId = (req.user as any)?.userId;

   await walletService.sendMoney(senderId, recipientPhone, amount, res);
});

export const walletController = {
   // getWallet,
   getMyWallet,
   addMoney,
   withdrawMoney,
   sendMoney,
};
