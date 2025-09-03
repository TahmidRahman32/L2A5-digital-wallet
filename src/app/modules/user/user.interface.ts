// import { Types } from "mongoose";

import { Types } from "mongoose";

export enum Role {
   ADMIN = "ADMIN",
   AGENT = "AGENT",
   USER = "USER",
}

export enum Status {
   ACTIVE = "ACTIVE",
   SUSPENDED = "SUSPENDED",
   DELETED = "DELETED",
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
   name: string;
   email: string;
   password: string;
   phone: string;
   role: Role;
   transactionPin?: string;
   status: Status;
   auth?: IauthProvider[];
   isActive?: boolean;
   comparePin(candidatePin: string): Promise<boolean>;
}
