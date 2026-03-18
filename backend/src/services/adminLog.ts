import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function createAdminLog(
  adminId: number,
  action: string,
  targetType?: string,
  targetId?: number,
  details?: any,
  ipAddress?: string
) {
  return prisma.adminLog.create({
    data: {
      admin_id: adminId,
      action,
      target_type: targetType || null,
      target_id: targetId || null,
      details: details ? JSON.stringify(details) : null,
      ip_address: ipAddress || null,
    },
  });
}
