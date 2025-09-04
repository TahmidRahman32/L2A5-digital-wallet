import { Request, Response } from "express";
import { envConfig } from "./config/env";
import AppError from "./errorHelpers/appError";
const errorSources: any = [];

const handleDuplicateError = (err: any) => {
   const matchArray = err.message.match(/"([^"]*)"/);
   return {
      statusCode: 400,
      message: `${matchArray[1]} already exists!`,
   };
};

export const globalErrorhandler = (err: any, req: Request, res: Response, ) => {
   let statusCode = 500;
   let message = `Something went wrong!!`;

   if (err.code === 11000) {
      const simplifiedError = handleDuplicateError(err);
      statusCode = simplifiedError.statusCode;
      message = simplifiedError.message;
   } else if (err.name === "ZodError") {
      statusCode = 400;
      message = "ZodError";
      const zodIssues = err.issues;
      // console.log(zodIssues, "amake dekha jacche");

      zodIssues.forEach((issue: any) => {
         errorSources.push({
            path: issue.path[issue.path.length - 1],
            message: issue.message,
         });
      });
   } else if (err.name === "CastError") {
      statusCode = 400;
      message = "invalid mongoDB Objectid, please provide  a valid id";
   } else if (err instanceof AppError) {
      statusCode = err.statusCode;
      message = err.message;
   } else if (err instanceof Error) {
      statusCode = 500;
      message = err.message;
   }
   res.status(statusCode).json({
      success: false,
      message,
      errorSources,
      err,
      stack: envConfig.NODE_ENV === "development" ? err.stack : null,
   });
};
