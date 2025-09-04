import mongoose, { Schema } from "mongoose";
import { ITransaction } from "./admin.interface";

const transactionSchema = new Schema<ITransaction>(
   {
      from: { type: Schema.Types.ObjectId, ref: "User" },
      to: { type: Schema.Types.ObjectId, ref: "User" },
      type: {
         type: String,
         enum: ["deposit", "withdraw", "transfer", "cash-in", "cash-out", "admin-action"],
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
      metadata: {
         type: Schema.Types.Mixed, // Flexible structure for different admin actions
         default: {},
      },
   },
   { timestamps: true, versionKey: false }
);

export const AdminTransaction = mongoose.model<ITransaction>("AdminTransaction", transactionSchema);
