import mongoose, { Schema } from "mongoose";
import { IWallet } from "./wallet.interface";
import { Status } from "../user/user.interface";

const walletSchema = new Schema<IWallet>(
   {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
      balance: { type: Number, default: 50, min: 0 },
      status: { type: String, enum: Object.values(Status), default: Status.ACTIVE },
   },
   { timestamps: true, versionKey: false }
);
export const Wallet = mongoose.model<IWallet>("Wallet", walletSchema);
