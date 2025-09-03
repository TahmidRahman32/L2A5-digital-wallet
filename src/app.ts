import express, { Request, Response } from "express";

import cors from "cors";

import cookieParser from "cookie-parser";
import passport from "passport";
import expressSession from "express-session";
import "./app/middlewares/config/passport";
import { envConfig } from "./app/middlewares/config/env";
import { notFound } from "./app/middlewares/NotFound";
import { globalErrorhandler } from "./app/middlewares/globalErrorHandler";
import { router } from "./app/router";

const app = express();

app.use(
   expressSession({
      secret: envConfig.EXPRESS_SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
   })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(passport.initialize());
app.use(passport.session());

app.use("/api/v1", router);

app.get("/", (req: Request, res: Response) => {
   res.status(200).json({
      status: true,
      massage: "welcome to server",
   });
});

app.use(globalErrorhandler);

app.use(notFound);

export default app;
