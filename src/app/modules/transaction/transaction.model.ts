import mongoose, { Schema } from "mongoose";
import { ITransaction } from "./transaction.interface";

const transactionSchema = new Schema<ITransaction>(
   {
      from: { type: Schema.Types.ObjectId, ref: "User" },
      to: { type: Schema.Types.ObjectId, ref: "User" },
      amount: { type: Number, required: true, min: 0 },
      type: {
         type: String,
         enum: ["deposit", "withdraw", "transfer", "cash-in", "cash-out"],
         required: true,
      },
      fee: { type: Number, default: 0, min: 0 },
      commission: { type: Number, min: 0 },
      initiatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
      status: {
         type: String,
         enum: ["pending", "completed", "failed", "reversed"],
         default: "pending",
      },
      description: String,
   },
   { timestamps: true }
);

export const Transaction = mongoose.model<ITransaction>("Transaction", transactionSchema);
