import { Transaction } from "./transaction.model";
import { Request, Response } from "express";
import { catchAsync } from "../../middlewares/Utils/catchAsync";
import { transactionService } from "./transaction.service";

export const getMyTransactions = catchAsync(async (req: Request, res: Response) => {
  const userId = (req.user as { userId: string })?.userId;
   //   const userRole = (req.user as any)?.role;

   await transactionService.transactionMe(userId, req, res);
});
// export const getMyTransactions = catchAsync(async (req: Request, res: Response) => {
//  const userId = (req.user as any)?.userId;
//   const userRole = (req.user as any)?.role;

//   if (!userId) {
//     throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
//   }

//   // Parse query parameters for filtering, sorting, and pagination
//   const page = parseInt(req.query.page as string) || 1;
//   const limit = parseInt(req.query.limit as string) || 10;
//   const sortBy = (req.query.sort as string) || "-createdAt"; // Default: newest first
//   const typeFilter = req.query.type as string;
//   const statusFilter = req.query.status as string;

//   // Calculate skip for pagination
//   const skip = (page - 1) * limit;

//   // Build the base query - user can see transactions where they are sender, receiver, or initiator
//   let baseQuery = {
//     $or: [
//       { from: userId },
//       { to: userId },
//       { initiatedBy: userId }
//     ]
//   };

//   // Add type filter if provided
//   if (typeFilter) {
//     baseQuery = {
//       ...baseQuery,
//       type: typeFilter
//     } as any;
//   }

//   // Add status filter if provided
//   if (statusFilter) {
//     baseQuery = {
//       ...baseQuery,
//       status: statusFilter
//     } as any;
//   }

//   // Execute the query with pagination and sorting
//   const transactions = await Transaction.find(baseQuery)
//     .populate("from", "name phone")
//     .populate("to", "name phone")
//     .populate("initiatedBy", "name phone role")
//     .sort(sortBy)
//     .skip(skip)
//     .limit(limit);

//   // Get total count for pagination info
//   const total = await Transaction.countDocuments(baseQuery);

//   // Calculate total pages
//   const totalPages = Math.ceil(total / limit);

//   res.status(httpStatus.OK).json({
//     status: "success",
//     results: transactions.length,
//     pagination: {
//       page,
//       limit,
//       total,
//       totalPages,
//       hasNext: page < totalPages,
//       hasPrev: page > 1
//     },
//     data: { transactions },
//   });
// });

// export const transactionWithdraw = async (userId: string, amountNum: number, feeNum: number, session: any) => {
//    const transaction = await Transaction.create(
//       [
//          {
//             from: userId,
//             amount: amountNum,
//             fee: feeNum,
//             type: "withdraw",
//             initiatedBy: userId,
//             status: "completed",
//             description: `Withdrawal of ৳${amountNum} (Fee: ৳${feeNum})`,
//          },
//       ],
//       { session }
//    );
//    return transaction;
// };

// export const transactionAddMoney = async (userId: string, amountNum: number, session: any) => {
//    const transaction = await Transaction.create(
//       [
//          {
//             to: userId,
//             amount: amountNum,
//             type: "deposit",
//             initiatedBy: userId,
//             status: "completed",
//             description: `Deposit of ৳${amountNum} to own wallet`,
//          },
//       ],
//       { session }
//    );
//    return transaction;
// };
export const transactionSendMoney = async (senderId: string, receiverId: string, amount: number, session: any) => {
   const transaction = await Transaction.create(
      [
         {
            from: senderId,
            to: receiverId,
            amount: amount,
            type: "transfer",
            initiatedBy: senderId,
            status: "completed",
            description: `Transfer of ৳${amount} from ${senderId} to ${receiverId}`,
         },
      ],
      { session }
   );
   return transaction;
};

export const transactionController = {
   getMyTransactions,
};
