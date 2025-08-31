import mongoose, { Document, Schema } from "mongoose";

export interface IWallet extends Document {
   user: mongoose.Types.ObjectId;
   balance: number;
   isBlocked: boolean;
   createdAt: Date;
   updatedAt: Date;
}
