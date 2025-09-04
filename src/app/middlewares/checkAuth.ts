// import { NextFunction, Request, Response } from "express";
// import AppError from "./errorHelpers/appError";
// import { envConfig } from "./config/env";
// import { JwtPayload } from "jsonwebtoken";
// import httpStatus from "http-status-codes";
// import { verifiedToken } from "./Utils/jwt";
// import User from "../modules/user/user.model";
// import { Status } from "../modules/user/user.interface";

// export const authCheck =
//    (...authRoles: string[]) =>
//    async (req: Request, res: Response, next: NextFunction) => {

//       try {
//          const accessToken = req.headers.authorization;

//          if (!accessToken) {
//             throw new AppError(402, "no token received");
//          }
//         const verified = verifiedToken(accessToken, envConfig.JWT_ACCESS_SECRET as string) as { id: string } & JwtPayload;

//          const isUserExist = await User.findOne({ email: verified.email });

//          if (!isUserExist) {
//             throw new AppError(httpStatus.BAD_REQUEST, "User Does Not Exist");
//          }
//          // if (isUserExist.isActive === isActive.BLOCKED || isUserExist.isActive === isActive.INACTIVE) {
//          //    throw new AppError(httpStatus.BAD_REQUEST, `user is ${isUserExist.isActive}`);
//          // }
//          if (isUserExist.status === Status.SUSPENDED) {
//             throw new AppError(httpStatus.BAD_REQUEST, "User is Suspended");
//          }

//          if (!authRoles.includes(verified.role)) {
//             throw new AppError(402, "your not authorized");
//          }

//          req.user = verifiedToken;

//          next();
//       } catch (err) {
//          next(err);
//       }
//    };

// // import { NextFunction, Request, Response } from "express";
// // import AppError from "./errorHelpers/appError";
// // import { envConfig } from "./config/env";
// // import { JwtPayload } from "jsonwebtoken";
// // import httpStatus from "http-status-codes";
// // import { verifiedToken } from "./Utils/jwt";
// // import User from "../modules/user/user.model";

// // interface DecodedToken extends JwtPayload {
// //    id: string;
// //    role: string;
// //    email?: string;
// // }

// // export const authCheck =
// //    (...authRoles: string[]) =>
// //    async (req: Request, res: Response, next: NextFunction) => {
// //       try {
// //          const accessToken = req.headers.authorization?.split(" ")[1]; // "Bearer token"

// //          if (!accessToken) {
// //             throw new AppError(httpStatus.UNAUTHORIZED, "No token received");
// //          }

// //          const decoded = verifiedToken(accessToken, envConfig.JWT_ACCESS_SECRET as string) as DecodedToken;

// //          const isUserExist = await User.findById(decoded.id);

// //          if (!isUserExist) {
// //             throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
// //          }

// //          if (isUserExist.isDelete) {
// //             throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
// //          }

// //          if (authRoles.length && !authRoles.includes(decoded.role)) {
// //             throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
// //          }

// //          // ✅ এখন টাইপ সঠিক হবে
// //          req.user = verifiedToken

// //          next();
// //       } catch (err) {
// //          next(err);
// //       }
// //    };

import { NextFunction, Request, Response } from "express";
import AppError from "./errorHelpers/appError";
import { envConfig } from "./config/env";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status-codes";
import { verifiedToken } from "./Utils/jwt";
import User from "../modules/user/user.model";
import { Status } from "../modules/user/user.interface";

interface DecodedToken extends JwtPayload {
   id: string;
   role: string;
   email?: string;
}

export const authCheck =
   (...authRoles: string[]) =>
   async (req: Request, res: Response, next: NextFunction) => {
      try {
         const accessToken = req.headers.authorization;

         if (!accessToken) {
            throw new AppError(httpStatus.UNAUTHORIZED, "No token received");
         }

         const decoded = verifiedToken(accessToken, envConfig.JWT_ACCESS_SECRET as string) as DecodedToken;
         // console.log(decoded);

         const isUserExist = await User.findById(decoded.userId);
         console.log(isUserExist);
         

         if (!isUserExist) {
            throw new AppError(httpStatus.BAD_REQUEST, "User does not exist");
         }

         if (isUserExist.status === Status.SUSPENDED) {
            throw new AppError(httpStatus.BAD_REQUEST, "User is Suspended");
         }

         if (authRoles.length && !authRoles.includes(decoded.role)) {
            throw new AppError(httpStatus.FORBIDDEN, "You are not authorized");
         }
         (req as any).user = decoded;

         next();
      } catch (err) {
         next(err);
      }
   };
