import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { successResponse, errorResponse } from '../utils';

const router = Router();
const prisma = new PrismaClient();

// 모든 파트너 API에 인증 + 권한 체크
router.use(authMiddleware);
router.use(adminMiddleware);

// ===== GET /partners — 파트너 목록 =====
router.get('/partners', async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status, page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (search) {
      const s = search as string;
      where.OR = [
        { name: { contains: s, mode: 'insensitive' } },
        { username: { contains: s, mode: 'insensitive' } },
        { code: { contains: s, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status as string;
    }

    const [partners, total] = await Promise.all([
      prisma.partner.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
        include: {
          _count: { select: { users: true, children: true } },
          parent: { select: { id: true, name: true, code: true } },
        },
      }),
      prisma.partner.count({ where }),
    ]);

    res.json(successResponse({
      partners,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
    }));
  } catch (err: any) {
    console.error('[Partner] 목록 조회 오류:', err);
    res.status(500).json(errorResponse('파트너 목록 조회 실패'));
  }
});

// ===== POST /partners — 파트너 생성 =====
router.post('/partners', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, name, code, commission_rate, parent_id, memo } = req.body;

    if (!username || !password || !name || !code) {
      res.status(400).json(errorResponse('필수 항목을 입력하세요 (username, password, name, code)'));
      return;
    }

    // 중복 체크
    const existing = await prisma.partner.findFirst({
      where: { OR: [{ username }, { code }] },
    });
    if (existing) {
      res.status(400).json(errorResponse('이미 사용 중인 아이디 또는 추천코드입니다'));
      return;
    }

    const hashed = await bcrypt.hash(password, 12);

    const partner = await prisma.partner.create({
      data: {
        username,
        password: hashed,
        name,
        code,
        commission_rate: commission_rate || 0,
        parent_id: parent_id || null,
        memo: memo || null,
      },
    });

    res.json(successResponse(partner));
  } catch (err: any) {
    console.error('[Partner] 생성 오류:', err);
    res.status(500).json(errorResponse('파트너 생성 실패'));
  }
});

// ===== PUT /partners/:id — 파트너 수정 =====
router.put('/partners/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { name, commission_rate, status, parent_id, memo, password } = req.body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (commission_rate !== undefined) data.commission_rate = commission_rate;
    if (status !== undefined) data.status = status;
    if (parent_id !== undefined) data.parent_id = parent_id;
    if (memo !== undefined) data.memo = memo;
    if (password) data.password = await bcrypt.hash(password, 12);

    const partner = await prisma.partner.update({
      where: { id },
      data,
    });

    res.json(successResponse(partner));
  } catch (err: any) {
    console.error('[Partner] 수정 오류:', err);
    res.status(500).json(errorResponse('파트너 수정 실패'));
  }
});

// ===== DELETE /partners/:id — 파트너 삭제 =====
router.delete('/partners/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    // 하부 유저가 있으면 삭제 불가
    const userCount = await prisma.user.count({ where: { partner_id: id } });
    if (userCount > 0) {
      res.status(400).json(errorResponse(`하부 유저 ${userCount}명이 있어 삭제할 수 없습니다. 먼저 유저를 이동하세요.`));
      return;
    }

    // 하부 파트너가 있으면 삭제 불가
    const childCount = await prisma.partner.count({ where: { parent_id: id } });
    if (childCount > 0) {
      res.status(400).json(errorResponse(`하부 파트너 ${childCount}개가 있어 삭제할 수 없습니다.`));
      return;
    }

    await prisma.partner.delete({ where: { id } });
    res.json(successResponse({ deleted: true }));
  } catch (err: any) {
    console.error('[Partner] 삭제 오류:', err);
    res.status(500).json(errorResponse('파트너 삭제 실패'));
  }
});

// ===== GET /partners/:id/users — 파트너 하부 유저 목록 =====
router.get('/partners/:id/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { page = '1', limit = '20' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { partner_id: id },
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          username: true,
          nickname: true,
          balance: true,
          status: true,
          created_at: true,
          last_login: true,
        },
      }),
      prisma.user.count({ where: { partner_id: id } }),
    ]);

    res.json(successResponse({ users, total, page: pageNum, totalPages: Math.ceil(total / limitNum) }));
  } catch (err: any) {
    console.error('[Partner] 하부유저 조회 오류:', err);
    res.status(500).json(errorResponse('하부유저 조회 실패'));
  }
});

// ===== GET /partners/:id/stats — 파트너 정산 통계 =====
router.get('/partners/:id/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    const partner = await prisma.partner.findUnique({
      where: { id },
      include: { _count: { select: { users: true, children: true } } },
    });

    if (!partner) {
      res.status(404).json(errorResponse('파트너를 찾을 수 없습니다'));
      return;
    }

    // 하부 유저 전체 입금/출금/배팅 합계
    const userIds = await prisma.user.findMany({
      where: { partner_id: id },
      select: { id: true },
    });
    const ids = userIds.map(u => u.id);

    let totalDeposit = 0;
    let totalWithdraw = 0;
    let totalBet = 0;
    let totalWin = 0;

    if (ids.length > 0) {
      const deposits = await prisma.transaction.aggregate({
        where: { user_id: { in: ids }, type: 'DEPOSIT', status: 'COMPLETED' },
        _sum: { amount: true },
      });
      const withdraws = await prisma.transaction.aggregate({
        where: { user_id: { in: ids }, type: 'WITHDRAW', status: 'COMPLETED' },
        _sum: { amount: true },
      });
      const bets = await prisma.gameLog.aggregate({
        where: { user_id: { in: ids } },
        _sum: { bet_amount: true, win_amount: true },
      });

      totalDeposit = Number(deposits._sum.amount || 0);
      totalWithdraw = Number(withdraws._sum.amount || 0);
      totalBet = Number(bets._sum.bet_amount || 0);
      totalWin = Number(bets._sum.win_amount || 0);
    }

    const commission = totalBet * (partner.commission_rate / 100);

    res.json(successResponse({
      partner,
      stats: {
        userCount: partner._count.users,
        childPartnerCount: partner._count.children,
        totalDeposit,
        totalWithdraw,
        totalBet,
        totalWin,
        netProfit: totalBet - totalWin,
        commission,
      },
    }));
  } catch (err: any) {
    console.error('[Partner] 통계 조회 오류:', err);
    res.status(500).json(errorResponse('파트너 통계 조회 실패'));
  }
});

// ===== GET /partners/tree — 파트너 트리 구조 =====
router.get('/partners/tree', async (req: Request, res: Response): Promise<void> => {
  try {
    const allPartners = await prisma.partner.findMany({
      orderBy: { created_at: 'asc' },
      include: {
        _count: { select: { users: true } },
      },
    });

    // 트리 구조 빌드
    const map = new Map<number, any>();
    const roots: any[] = [];

    for (const p of allPartners) {
      map.set(p.id, { ...p, children: [] });
    }

    for (const p of allPartners) {
      const node = map.get(p.id);
      if (p.parent_id && map.has(p.parent_id)) {
        map.get(p.parent_id).children.push(node);
      } else {
        roots.push(node);
      }
    }

    res.json(successResponse(roots));
  } catch (err: any) {
    console.error('[Partner] 트리 조회 오류:', err);
    res.status(500).json(errorResponse('파트너 트리 조회 실패'));
  }
});

export default router;
