import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { successResponse, errorResponse } from '../utils';

const router = Router();
const prisma = new PrismaClient();

// 모든 포인트 API에 인증 + 권한 체크
router.use(authMiddleware);
router.use(adminMiddleware);

// ===== GET /points/users — 유저별 포인트 목록 =====
router.get('/points/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      const s = search as string;
      where.OR = [
        { username: { contains: s, mode: 'insensitive' } },
        { nickname: { contains: s, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          username: true,
          nickname: true,
          points: true,
          created_at: true,
          _count: { select: { point_transactions: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);

    // 유저별 누적 적립/사용 계산
    const userIds = users.map(u => u.id);
    const earnAgg = await prisma.pointTransaction.groupBy({
      by: ['user_id'],
      where: { user_id: { in: userIds }, amount: { gt: 0 } },
      _sum: { amount: true },
    });
    const useAgg = await prisma.pointTransaction.groupBy({
      by: ['user_id'],
      where: { user_id: { in: userIds }, amount: { lt: 0 } },
      _sum: { amount: true },
    });

    const earnMap = new Map(earnAgg.map(e => [e.user_id, Number(e._sum.amount || 0)]));
    const useMap = new Map(useAgg.map(e => [e.user_id, Math.abs(Number(e._sum.amount || 0))]));

    const result = users.map(u => ({
      ...u,
      totalEarned: earnMap.get(u.id) || 0,
      totalUsed: useMap.get(u.id) || 0,
    }));

    res.json(successResponse({
      users: result,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    }));
  } catch (err: any) {
    console.error('[Points] 유저 목록 오류:', err);
    res.status(500).json(errorResponse('포인트 유저 목록 조회 실패'));
  }
});

// ===== POST /points/give — 포인트 지급 =====
router.post('/points/give', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount || amount <= 0) {
      res.status(400).json(errorResponse('유저 ID와 양수 금액을 입력하세요'));
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }

    const newBalance = user.points + amount;

    const [updatedUser, tx] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { points: newBalance },
      }),
      prisma.pointTransaction.create({
        data: {
          user_id: userId,
          amount: amount,
          balance: newBalance,
          type: 'ADMIN',
          description: description || `관리자 지급 (${amount}P)`,
        },
      }),
    ]);

    res.json(successResponse({ user: updatedUser, transaction: tx }));
  } catch (err: any) {
    console.error('[Points] 지급 오류:', err);
    res.status(500).json(errorResponse('포인트 지급 실패'));
  }
});

// ===== POST /points/deduct — 포인트 차감 =====
router.post('/points/deduct', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, amount, description } = req.body;

    if (!userId || !amount || amount <= 0) {
      res.status(400).json(errorResponse('유저 ID와 양수 금액을 입력하세요'));
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }

    if (user.points < amount) {
      res.status(400).json(errorResponse(`포인트 부족 (보유: ${user.points}P, 요청: ${amount}P)`));
      return;
    }

    const newBalance = user.points - amount;

    const [updatedUser, tx] = await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { points: newBalance },
      }),
      prisma.pointTransaction.create({
        data: {
          user_id: userId,
          amount: -amount,
          balance: newBalance,
          type: 'ADMIN',
          description: description || `관리자 차감 (-${amount}P)`,
        },
      }),
    ]);

    res.json(successResponse({ user: updatedUser, transaction: tx }));
  } catch (err: any) {
    console.error('[Points] 차감 오류:', err);
    res.status(500).json(errorResponse('포인트 차감 실패'));
  }
});

// ===== GET /points/history — 포인트 내역 =====
router.get('/points/history', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, type, from, to, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (userId) where.user_id = parseInt(userId as string);
    if (type) where.type = type as string;
    if (from || to) {
      where.created_at = {};
      if (from) where.created_at.gte = new Date(from as string);
      if (to) where.created_at.lte = new Date(to as string);
    }

    const [transactions, total] = await Promise.all([
      prisma.pointTransaction.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
        include: {
          user: { select: { id: true, username: true, nickname: true } },
        },
      }),
      prisma.pointTransaction.count({ where }),
    ]);

    res.json(successResponse({
      transactions,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    }));
  } catch (err: any) {
    console.error('[Points] 내역 조회 오류:', err);
    res.status(500).json(errorResponse('포인트 내역 조회 실패'));
  }
});

// ===== GET /points/stats — 포인트 전체 통계 =====
router.get('/points/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const [totalIssued, totalUsed, totalConverted] = await Promise.all([
      prisma.pointTransaction.aggregate({
        where: { amount: { gt: 0 } },
        _sum: { amount: true },
      }),
      prisma.pointTransaction.aggregate({
        where: { type: 'USE', amount: { lt: 0 } },
        _sum: { amount: true },
      }),
      prisma.pointTransaction.aggregate({
        where: { type: 'CONVERT', amount: { lt: 0 } },
        _sum: { amount: true },
      }),
    ]);

    const totalUsers = await prisma.user.count({ where: { points: { gt: 0 } } });

    res.json(successResponse({
      totalIssued: Number(totalIssued._sum.amount || 0),
      totalUsed: Math.abs(Number(totalUsed._sum.amount || 0)),
      totalConverted: Math.abs(Number(totalConverted._sum.amount || 0)),
      usersWithPoints: totalUsers,
    }));
  } catch (err: any) {
    console.error('[Points] 통계 조회 오류:', err);
    res.status(500).json(errorResponse('포인트 통계 조회 실패'));
  }
});

// ===== PUT /points/settings — 포인트 설정 =====
router.put('/points/settings', async (req: Request, res: Response): Promise<void> => {
  try {
    const { point_to_money_rate, earn_rate_per_bet } = req.body;

    const settings: any[] = [];

    if (point_to_money_rate !== undefined) {
      settings.push(
        prisma.systemSetting.upsert({
          where: { key: 'point_to_money_rate' },
          update: { value: String(point_to_money_rate), updated_by: req.user?.id },
          create: { key: 'point_to_money_rate', value: String(point_to_money_rate), description: '포인트→머니 전환 비율 (1P = ?원)' },
        })
      );
    }

    if (earn_rate_per_bet !== undefined) {
      settings.push(
        prisma.systemSetting.upsert({
          where: { key: 'earn_rate_per_bet' },
          update: { value: String(earn_rate_per_bet), updated_by: req.user?.id },
          create: { key: 'earn_rate_per_bet', value: String(earn_rate_per_bet), description: '배팅당 포인트 적립률 (%)' },
        })
      );
    }

    if (settings.length === 0) {
      res.status(400).json(errorResponse('설정할 항목이 없습니다'));
      return;
    }

    await prisma.$transaction(settings);
    res.json(successResponse({ updated: true }));
  } catch (err: any) {
    console.error('[Points] 설정 오류:', err);
    res.status(500).json(errorResponse('포인트 설정 실패'));
  }
});

export default router;
