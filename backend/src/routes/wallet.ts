import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils';

const router = Router();
const prisma = new PrismaClient();

// GET /api/wallet/balance — 로그인 유저 잔액 + 보너스 잔액 조회
router.get('/balance', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        balance: true,
        bonus_balance: true,
      },
    });

    if (!user) {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }

    res.json(successResponse({
      balance: user.balance,
      bonus_balance: user.bonus_balance,
      total: user.balance.add(user.bonus_balance),
    }));
  } catch (err) {
    console.error('Wallet balance error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /api/wallet — 안내 응답
router.get('/', (_req: Request, res: Response) => {
  res.json(successResponse({
    message: 'Use /api/wallet/balance, /api/deposit, or /api/withdraw',
    endpoints: {
      balance: 'GET /api/wallet/balance',
      deposit: 'POST /api/deposit/request',
      withdraw: 'POST /api/withdraw/request',
      deposit_history: 'GET /api/deposit/history',
      withdraw_history: 'GET /api/withdraw/history',
    },
  }));
});

export default router;
