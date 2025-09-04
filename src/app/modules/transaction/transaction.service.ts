import { Request, Response } from "express";
import AppError from "../../middlewares/errorHelpers/appError";
import { Transaction } from "./transaction.model";
import httpStatus from "http-status-codes";
export const transactions = async (userId: string, amountNum: number, feeNum: number, type: string, status: string, description: string, session: unknown) => {
   const transaction = await Transaction.create(
      [
         {
            from: userId,
            amount: amountNum,
            fee: feeNum,
            type: type,
            initiatedBy: userId,
            status: status,
            description: description,
         },
      ],
      { session }
   );
   return transaction;
};

const transactionMe = async (userId: string, req: Request, resp: Response) => {
   if (!userId) {
      throw new AppError(httpStatus.UNAUTHORIZED, "User not authenticated");
   }

// Parse query parameters for filtering, sorting, and pagination
const page = parseInt(req.query.page as string) || 1;
const limit = parseInt(req.query.limit as string) || 10;
const sortBy = (req.query.sort as string) || "-createdAt"; // Default: newest first
const typeFilter = req.query.type as string;
const statusFilter = req.query.status as string;

// Calculate skip for pagination
const skip = (page - 1) * limit;

// Build the base query - user can see transactions where they are sender, receiver, or initiator
let baseQuery = {
   $or: [{ from: userId }, { to: userId }, { initiatedBy: userId }],
};

// Add type filter if provided
if (typeFilter) {
   baseQuery = {
      ...baseQuery,
      type: typeFilter,
   } as any;
}

// Add status filter if provided
if (statusFilter) {
   baseQuery = {
      ...baseQuery,
      status: statusFilter,
   } as any;
}

// Execute the query with pagination and sorting
const transactions = await Transaction.find(baseQuery).populate("from", "name phone").populate("to", "name phone").populate("initiatedBy", "name phone role").sort(sortBy).skip(skip).limit(limit);

// Get total count for pagination info
const total = await Transaction.countDocuments(baseQuery);

// Calculate total pages
const totalPages = Math.ceil(total / limit)

resp.status(httpStatus.OK).json({
   status: "success",
   results: transactions.length,
   pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
   },
   data: { transactions },
});
}

export const transactionService = {
   transactionMe
};