import mongoose from "mongoose";

export interface IAdminActionMetadata {
   action: string;
   userId?: string;
   agentId?: string;
   walletId?: string;
   reason?: string;
   previousRole?: string;
   newRole?: string;
   [key: string]: any; // Allow for additional fields
}
export interface ITransaction extends Document {
   from: mongoose.Types.ObjectId;
   to: mongoose.Types.ObjectId;
   
   type: "deposit" | "withdraw" | "transfer" | "cash-in" | "cash-out" | "admin-action";
   fee: number;
   commission?: number;
   initiatedBy: mongoose.Types.ObjectId;
   status: "pending" | "completed" | "failed" | "reversed";
   description?: string;
   metadata?: IAdminActionMetadata; // For storing additional data about admin actions
   createdAt: Date;
   updatedAt: Date;
}
