import dotenv from "dotenv";

dotenv.config();

interface IEnvConfig {
   PORT: string;
   DB_URL: string;
   NODE_ENV: "development" | "production";
   BCRYPT_SALT_ROUNDS: string;
   JWT_EXPIRES_IN: string;
   JWT_ACCESS_SECRET: string;
   ADMIN_EMAIL: string;
   ADMIN_PASSWORD: string;
   JWT_REFRESH_EXPIRES_IN: string;
   JWT_REFRESH_SECRET: string;
   GOOGLE_CALLBACK_URL: string;
   GOOGLE_CLIENT_ID: string;
   GOOGLE_CLIENT_SECRET: string;
   FRONTEND_URL: string;
   EXPRESS_SESSION_SECRET: string;
   ADMIN_PHONE: string;
   WITHDRAWAL_FEE: number;
   CASH_OUT_FEE: number;
   AGENT_COMMISSION_RATE: number;
   MIN_WITHDRAWAL: number;
   MAX_WITHDRAWAL: number;
   TRANSACTION_FEE: number;
   CASH_IN_FEE: number;
}

const envConfigFunction = (): IEnvConfig => {
   const envRequiredVariable: string[] = [
      "PORT",
      "DB_URL",
      "NODE_ENV",
      "JWT_ACCESS_SECRET",
      "BCRYPT_SALT_ROUNDS",
      "JWT_EXPIRES_IN",
      "JWT_REFRESH_EXPIRES_IN",
      "JWT_REFRESH_SECRET",
      "GOOGLE_CLIENT_SECRET",
      "GOOGLE_CALLBACK_URL",
      "GOOGLE_CLIENT_ID",
      "FRONTEND_URL",
      "EXPRESS_SESSION_SECRET",
      "ADMIN_PHONE",
      "ADMIN_EMAIL",
      "ADMIN_PASSWORD",
      "WITHDRAWAL_FEE",
      "CASH_OUT_FEE",
      "AGENT_COMMISSION_RATE",
      "MIN_WITHDRAWAL",
      "MAX_WITHDRAWAL",
      "TRANSACTION_FEE",
      "CASH_IN_FEE"
   ];
   envRequiredVariable.forEach((key) => {
      if (!process.env[key]) {
         throw new Error(`Missing required variable ${key}`);
      }
   });
   return {
      PORT: process.env.PORT as string,
      DB_URL: process.env.DB_URL as string,
      NODE_ENV: process.env.NODE_ENV as "development" | "production",
      BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS as string,
      JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN as string,
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET as string,
      ADMIN_EMAIL: process.env.ADMIN_EMAIL as string,
      ADMIN_PASSWORD: process.env.ADMIN_PASSWORD as string,
      JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN as string,
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET as string,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
      GOOGLE_CALLBACK_URL: process.env.GOOGLE_CALLBACK_URL as string,
      EXPRESS_SESSION_SECRET: process.env.EXPRESS_SESSION_SECRET as string,
      FRONTEND_URL: process.env.FRONTEND_URL as string,
      ADMIN_PHONE: process.env.ADMIN_PHONE as string,
      WITHDRAWAL_FEE: process.env.WITHDRAWAL_FEE as unknown as number,
      CASH_OUT_FEE: process.env.CASH_OUT_FEE as unknown as number,
      AGENT_COMMISSION_RATE: process.env.AGENT_COMMISSION_RATE as unknown as number,
      MIN_WITHDRAWAL: process.env.MIN_WITHDRAWAL as unknown as number,
      MAX_WITHDRAWAL: process.env.MAX_WITHDRAWAL as unknown as number,
      TRANSACTION_FEE: process.env.TRANSACTION_FEE as unknown as number,
      CASH_IN_FEE: process.env.CASH_IN_FEE as unknown as number,
   };
};

export const envConfig = envConfigFunction();
