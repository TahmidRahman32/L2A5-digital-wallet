import { model, Schema } from "mongoose";
import { IauthProvider, IUser, Role, Status } from "./user.interface";
import bcryptjs from "bcryptjs";
import { envConfig } from "../../middlewares/config/env";
const authProviderSchema = new Schema<IauthProvider>(
   {
      provider: { type: String, required: true },
      providerId: { type: String, required: true },
   },
   {
      _id: false,
      versionKey: false,
   }
);

const userSchema = new Schema<IUser>(
   {
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String },
      role: {
         type: String,
         enum: Object.values(Role),
         default: Role.USER,
      },
      phone: { type: String },
      transactionPin: { type: String, select: false },
      isActive: { type: Boolean, default: true },
      status: {
         type: String,
         enum: Object.values(Status),
         default: Status.ACTIVE,
      },
      isApproved: { type: Boolean, default: false },
      auth: [authProviderSchema],
   },
   {
      versionKey: false,
      timestamps: true,
   }
);





const User = model<IUser>("User", userSchema);

export default User;
