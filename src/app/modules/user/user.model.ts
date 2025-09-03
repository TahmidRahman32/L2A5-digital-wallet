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
      auth: [authProviderSchema],
   },
   {
      versionKey: false,
      timestamps: true,
   }
);

userSchema.pre("save", async function (next) {
   if (!this.isModified("transactionPin") || !this.transactionPin) return next();
   this.transactionPin = await bcryptjs.hash(this.transactionPin, envConfig.BCRYPT_SALT_ROUNDS);
   next();
});

userSchema.methods.comparePin = async function (candidatePin: string): Promise<boolean> {
   if (!this.transactionPin) return false;
   return await bcryptjs.compare(candidatePin, this.transactionPin);
};

// Remove sensitive information from JSON output
userSchema.methods.toJSON = function () {
   const userObject = this.toObject();
   delete userObject.transactionPin;
   return userObject;
};

const User = model<IUser>("User", userSchema);

export default User;
