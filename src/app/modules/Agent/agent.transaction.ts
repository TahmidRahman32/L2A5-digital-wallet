import { Transaction } from "../transaction/transaction.model";

const agentTransaction = async (from: string, to: string, amount: number, fee: number, commission: number, type: string, initiatedBy: string, status: string, description: string, session: any) => {
   const transaction = await Transaction.create(
      [
         {
            from,
            to,
            amount,
            fee,
            commission,
            type,
            initiatedBy,
            status,
            description,
         },
      ],
      { session }
   );
   return transaction;
};

export default agentTransaction;
