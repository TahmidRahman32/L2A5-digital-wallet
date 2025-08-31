import { NextFunction, Request, Response } from "express";
import { ZodObject } from "zod";

export const validationRequest = (createZodSchema: ZodObject) => async (req: Request, res: Response, next: NextFunction) => {
   try {
      req.body = await createZodSchema.parseAsync(req.body);

      next();
   } catch (error) {
      next(error);
   }
};
