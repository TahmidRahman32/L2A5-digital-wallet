import { NextFunction, Request, Response } from "express";
import { IUser } from "../modules/user/user.interface";


// Extend the Express Request interface to include user property
// export interface AuthRequest extends Request {
//    user?: IUser;
// }

// Define the async handler type
// export type AsyncHandler = (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
