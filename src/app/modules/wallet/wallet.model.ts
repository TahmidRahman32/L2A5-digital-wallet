import mongoose, { Schema } from "mongoose";
import { IWallet } from "./wallet.interface";

const walletSchema = new Schema<IWallet>(
   {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
      balance: { type: Number, default: 50, min: 0 },
      isBlocked: { type: Boolean, default: false },
   },
   { timestamps: true, versionKey: false }
);
export const Wallet = mongoose.model<IWallet>("Wallet", walletSchema);
