import { model, Schema } from "mongoose";
import { IauthProvider, IsActive, IUser, Role } from "./user.interface";

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
      _id: { type: String },
      name: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String },
      role: {
         type: String,
         enum: Object.values(Role),
         default: Role.USER,
      },
      phone: { type: String },
      isDelete: { type: Boolean, default: false },
      status: {
         type: String,
         enum: Object.values(IsActive),
         default: IsActive.ACTIVE,
      },
      isVerified: { type: Boolean, default: false },
      agent: {
         approved: { type: Boolean, default: false },
         commissionPercent: { type: Number },
      },
      auth: [authProviderSchema],
   },
   {
      versionKey: false,
      timestamps: true,
   }
);

const User = model<IUser>("User", userSchema);

export default User;
