import mongoose, { Document, Schema } from "mongoose";
import { Status } from "../user/user.interface";

export interface IWallet extends Document {
   user: mongoose.Types.ObjectId;
   balance: number;
   status: Status
}
