// import { Types } from "mongoose";

import { Types } from "mongoose";

export enum Role {
   ADMIN = "ADMIN",
   AGENT= "AGENT",
   USER = "USER",
 
}

export enum IsActive {
   ACTIVE = "ACTIVE",
   SUSPENDED = "SUSPENDED",
   
}

export interface IauthProvider {
   provider: "google" | "credential";
   providerId: string;
}

// export interface IUser {
//    _id?: string;
//    name: string;
//    email: string;
//    password?: string;
//    phone?: string;
//    picture?: string;
//    address?: string;
//    isActive?: isActive;
//    isDelete?: string;
//    isVerified?: boolean;
//    guides?: Types.ObjectId[];
//    bookings?: Types.ObjectId[];
//    role: Role;
//    auth: IauthProvider[];
// }


export interface IUser {
   _id: Types.ObjectId;
   name: string;
   phone: string;
   email: string; // unique login id
   password?: string; // hashed
   role?: Role;
   status?: IsActive;
   isDelete?: string;
   isVerified?: boolean;
   agent?: {
      approved: boolean;
      commissionPercent?: number; // override default
   } | null;
   auth?: IauthProvider[];
}