import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/Utils/catchAsync";
import AppError from "../../middlewares/errorHelpers/appError";
import httpStatus from "http-status-codes";

import { Wallet } from "./wallet.model";

export const getMyWallet = catchAsync(async (req: Request, res: Response) => {
   console.log(req.user, "User Info");

   const userId = (req.user as any)?._id;
   console.log(userId, "UserId");
   
   const wallet = await Wallet.findOne({ user: userId });

   console.log(wallet, "wallet ki asolei nai");
   

   if (!wallet) {
       throw new AppError(httpStatus.NOT_FOUND, "Wallet Not Found");
   }

   res.status(200).json({
      status: "success",
      data: { wallet },
   });
});

// export const addMoney = catchAsync(async (req: Request, res: Response) => {
//    const { amount } = req.body;

//    if (amount <= 0) {
//       throw new AppError(httpStatus.BAD_REQUEST, "Invalid amount");
//    }

//    const session = await mongoose.startSession();
//    session.startTransaction();

//    try {
//       // Update wallet balance
//       const wallet = await Wallet.findOneAndUpdate({ user: req.user!._id, isBlocked: false }, { $inc: { balance: amount } }, { new: true, session });

//       if (!wallet) {
//          throw new AppError("Wallet not found or blocked", 400);
//       }

//       // Create transaction record
//       const transaction = await Transaction.create(
//          [
//             {
//                to: req.user!._id,
//                amount,
//                type: "deposit",
//                initiatedBy: req.user!._id,
//                status: "completed",
//                description: `Deposit of ৳${amount} to own wallet`,
//             },
//          ],
//          { session }
//       );

//       await session.commitTransaction();
//       session.endSession();

//       res.status(200).json({
//          status: "success",
//          data: { wallet, transaction: transaction[0] },
//       });
//    } catch (error) {
//       await session.abortTransaction();
//       session.endSession();
//       throw error;
//    }
// });


export const walletController = {
   getMyWallet,
//   addMoney,
};
