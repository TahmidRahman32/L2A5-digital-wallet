import { envConfig } from "../config/env";

import bcryptjs from "bcryptjs";
import { IauthProvider, IUser, Role } from "../../modules/user/user.interface";
import User from "../../modules/user/user.model";
export const seedAdmin = async () => {
   try {
      const isAdminExist = await User.findOne({ email: envConfig.ADMIN_EMAIL });

      if (isAdminExist) {
         console.log("Admin already exist");
         return;
      }
      console.log("try again");

      const authProvider: IauthProvider = {
         provider: "credential",
         providerId: envConfig.ADMIN_EMAIL,
      };
      const hashPassword = await bcryptjs.hash(envConfig.ADMIN_PASSWORD, Number(envConfig.BCRYPT_SALT_ROUNDS));
      const payload: IUser = {
         name: "Admin",
         email: envConfig.ADMIN_EMAIL,
         phone: envConfig.ADMIN_PHONE,
         role: Role.ADMIN,
         password: hashPassword,
         isVerified: true,
         auth: [authProvider],
      };

      const Admin = await User.create(payload);
      console.log("Admin created successfully! \n");

      console.log(Admin);
   } catch (error) {
      console.log(error);
   }
};
