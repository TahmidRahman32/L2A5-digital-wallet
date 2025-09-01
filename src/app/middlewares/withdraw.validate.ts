// src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodError } from "zod";
import AppError from "./errorHelpers/appError";
import httpStatus from "http-status-codes";

export const validate = (schema: ZodObject<any>) => {
   return (req: Request, res: Response, next: NextFunction) => {
      try {
         schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
         });
         next();
      } catch (error) {
         if (error instanceof ZodError) {
            // const errorMessages = (error as ZodError<any>).errors.map((err: any) => ({
            //    field: err.path.join("."),
            //    message: err.message,
            // }));

            return next(new AppError(httpStatus.BAD_REQUEST, `Validation failed`));
         }
         next(error);
      }
   };
};
