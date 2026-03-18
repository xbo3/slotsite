import { PrismaClient, Prisma } from '@prisma/client';
const prisma = new PrismaClient();

export async function addBalance(userId: number, amount: number | Prisma.Decimal, type: string, memo?: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { balance: { increment: new Prisma.Decimal(amount.toString()) } },
    });
    await tx.transaction.create({
      data: {
        user_id: userId,
        type: type as any,
        amount: new Prisma.Decimal(amount.toString()),
        balance_after: user.balance,
        status: 'COMPLETED',
        memo: memo || null,
      },
    });
    return user;
  });
}

export async function subtractBalance(userId: number, amount: number | Prisma.Decimal, type: string, memo?: string) {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({ where: { id: userId } });
    if (!user || user.balance.lt(new Prisma.Decimal(amount.toString()))) {
      throw new Error('잔액 부족');
    }
    const updated = await tx.user.update({
      where: { id: userId },
      data: { balance: { decrement: new Prisma.Decimal(amount.toString()) } },
    });
    await tx.transaction.create({
      data: {
        user_id: userId,
        type: type as any,
        amount: new Prisma.Decimal(amount.toString()),
        balance_after: updated.balance,
        status: 'COMPLETED',
        memo: memo || null,
      },
    });
    return updated;
  });
}

export async function getBalance(userId: number) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { balance: true, bonus_balance: true } });
  return user;
}
