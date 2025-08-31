import mongoose, { Document, Schema } from "mongoose";

export interface ITransaction extends Document {
   from: mongoose.Types.ObjectId; // Sender user ID
   to: mongoose.Types.ObjectId; // Receiver user ID
   amount: number;
   type: "deposit" | "withdraw" | "transfer" | "cash-in" | "cash-out";
   fee: number;
   commission?: number; // For agent transactions
   initiatedBy: mongoose.Types.ObjectId; // Who initiated the transaction
   status: "pending" | "completed" | "failed" | "reversed";
   description?: string;
   createdAt: Date;
   updatedAt: Date;
}
