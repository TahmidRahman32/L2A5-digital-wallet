import { z } from "zod";

export const sendMoneySchema = z.object({
   amount: z.number().positive("Amount must be positive").min(1, "Minimum transfer amount is 1 Taka").max(50000, "Maximum transfer amount is 50,000 Taka"),
   recipientPhone: z.string().regex(/^01[3-9]\d{8}$/, "Must be a valid Bangladeshi phone number"),
});

export type SendMoneyInput = z.infer<typeof sendMoneySchema>;


// Add to your existing validation schemas
export const cashInSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .min(1, 'Minimum cash-in amount is 1 Taka')
    .max(50000, 'Maximum cash-in amount is 50,000 Taka'),
  userPhone: z.string()
    .regex(/^01[3-9]\d{8}$/, 'Must be a valid Bangladeshi phone number'),
});

export type CashInInput = z.infer<typeof cashInSchema>;