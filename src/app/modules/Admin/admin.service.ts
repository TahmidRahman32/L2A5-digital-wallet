import { AdminTransaction } from "./admin.model";

export const AdminTransactionService = async (adminId: string, reason: string, agentId: string, action: string, type: string, status: string, description: string) => {
   await AdminTransaction.create({
      type: type,
      initiatedBy: adminId,
      status: status,
      description: description,
      metadata: {
         action: action,
         agentId: agentId,
         reason: reason,
      },
   });
};

