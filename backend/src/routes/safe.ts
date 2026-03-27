import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils';

const router = Router();
const prisma = new PrismaClient();

// GET /api/safe/balance — 금고 잔액 조회
router.get('/balance', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { safe_balance: true, balance: true },
    });

    if (!user) {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }

    res.json(successResponse({
      safe_balance: user.safe_balance,
      balance: user.balance,
    }));
  } catch (err) {
    console.error('Safe balance error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// POST /api/safe/deposit — 잔액 → 금고 이체
router.post('/deposit', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, memo } = req.body;
    const userId = req.user!.id;

    if (!amount || amount <= 0) {
      res.status(400).json(errorResponse('이체 금액을 입력해주세요'));
      return;
    }

    const transferAmount = new Prisma.Decimal(amount);

    const result = await prisma.$transaction(async (tx) => {
      // 유저 조회 + 잔액 확인
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('USER_NOT_FOUND');

      if (user.balance.lt(transferAmount)) {
        throw new Error('INSUFFICIENT_BALANCE');
      }

      // 잔액 차감 + 금고 증가
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: transferAmount },
          safe_balance: { increment: transferAmount },
        },
      });

      // 금고 거래 기록
      const transaction = await tx.safeTransaction.create({
        data: {
          user_id: userId,
          type: 'DEPOSIT',
          amount: transferAmount,
          balance_after: updatedUser.safe_balance,
          memo: memo || null,
        },
      });

      return {
        transaction,
        balance: updatedUser.balance,
        safe_balance: updatedUser.safe_balance,
      };
    });

    res.json(successResponse(result));
  } catch (err: any) {
    if (err.message === 'USER_NOT_FOUND') {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }
    if (err.message === 'INSUFFICIENT_BALANCE') {
      res.status(400).json(errorResponse('잔액이 부족합니다'));
      return;
    }
    console.error('Safe deposit error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// POST /api/safe/withdraw — 금고 → 잔액 이체
router.post('/withdraw', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { amount, memo } = req.body;
    const userId = req.user!.id;

    if (!amount || amount <= 0) {
      res.status(400).json(errorResponse('이체 금액을 입력해주세요'));
      return;
    }

    const transferAmount = new Prisma.Decimal(amount);

    const result = await prisma.$transaction(async (tx) => {
      // 유저 조회 + 금고 잔액 확인
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('USER_NOT_FOUND');

      if (user.safe_balance.lt(transferAmount)) {
        throw new Error('INSUFFICIENT_SAFE_BALANCE');
      }

      // 금고 차감 + 잔액 증가
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          balance: { increment: transferAmount },
          safe_balance: { decrement: transferAmount },
        },
      });

      // 금고 거래 기록
      const transaction = await tx.safeTransaction.create({
        data: {
          user_id: userId,
          type: 'WITHDRAW',
          amount: transferAmount,
          balance_after: updatedUser.safe_balance,
          memo: memo || null,
        },
      });

      return {
        transaction,
        balance: updatedUser.balance,
        safe_balance: updatedUser.safe_balance,
      };
    });

    res.json(successResponse(result));
  } catch (err: any) {
    if (err.message === 'USER_NOT_FOUND') {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }
    if (err.message === 'INSUFFICIENT_SAFE_BALANCE') {
      res.status(400).json(errorResponse('금고 잔액이 부족합니다'));
      return;
    }
    console.error('Safe withdraw error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// GET /api/safe/history — 금고 거래 내역
router.get('/history', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [transactions, total] = await Promise.all([
      prisma.safeTransaction.findMany({
        where: { user_id: req.user!.id },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.safeTransaction.count({ where: { user_id: req.user!.id } }),
    ]);

    res.json(successResponse({
      transactions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }));
  } catch (err) {
    console.error('Safe history error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

export default router;
