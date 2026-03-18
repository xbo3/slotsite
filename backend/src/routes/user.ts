import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils';

const router = Router();
const prisma = new PrismaClient();

// 모든 유저 API에 authMiddleware 적용
router.use(authMiddleware);

// GET /me — 내 정보 조회
router.get('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        nickname: true,
        phone: true,
        role: true,
        status: true,
        balance: true,
        bonus_balance: true,
        created_at: true,
        updated_at: true,
        last_login: true,
      },
    });

    if (!user) {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }

    res.json(successResponse(user));
  } catch (err) {
    console.error('GET /me error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// PUT /me — 닉네임 변경
router.put('/me', async (req: Request, res: Response): Promise<void> => {
  try {
    const { nickname } = req.body;

    if (!nickname || typeof nickname !== 'string' || nickname.trim().length === 0) {
      res.status(400).json(errorResponse('닉네임을 입력해주세요'));
      return;
    }

    const trimmed = nickname.trim();

    // 중복 체크
    const existing = await prisma.user.findFirst({
      where: {
        nickname: trimmed,
        id: { not: req.user!.id },
      },
    });

    if (existing) {
      res.status(400).json(errorResponse('이미 사용 중인 닉네임입니다'));
      return;
    }

    const updated = await prisma.user.update({
      where: { id: req.user!.id },
      data: { nickname: trimmed },
      select: {
        id: true,
        username: true,
        nickname: true,
        phone: true,
        role: true,
        status: true,
        balance: true,
        bonus_balance: true,
        created_at: true,
        updated_at: true,
        last_login: true,
      },
    });

    res.json(successResponse(updated));
  } catch (err) {
    console.error('PUT /me error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// PUT /me/password — 비밀번호 변경
router.put('/me/password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      res.status(400).json(errorResponse('현재 비밀번호와 새 비밀번호를 입력해주세요'));
      return;
    }

    if (new_password.length < 6) {
      res.status(400).json(errorResponse('새 비밀번호는 6자 이상이어야 합니다'));
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }

    const isValid = await bcrypt.compare(current_password, user.password);
    if (!isValid) {
      res.status(400).json(errorResponse('현재 비밀번호가 일치하지 않습니다'));
      return;
    }

    const hashedPassword = await bcrypt.hash(new_password, 12);

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword },
    });

    res.json(successResponse({ message: '비밀번호가 변경되었습니다' }));
  } catch (err) {
    console.error('PUT /me/password error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// PUT /me/security-password — 2차 비밀번호 설정/변경
router.put('/me/security-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { current_security_password, new_security_password } = req.body;

    if (!new_security_password) {
      res.status(400).json(errorResponse('새 2차 비밀번호를 입력해주세요'));
      return;
    }

    if (new_security_password.length < 4) {
      res.status(400).json(errorResponse('2차 비밀번호는 4자 이상이어야 합니다'));
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }

    // 이미 2차 비밀번호가 설정되어 있으면 현재 비밀번호 검증
    if (user.security_password) {
      if (!current_security_password) {
        res.status(400).json(errorResponse('현재 2차 비밀번호를 입력해주세요'));
        return;
      }

      const isValid = await bcrypt.compare(current_security_password, user.security_password);
      if (!isValid) {
        res.status(400).json(errorResponse('현재 2차 비밀번호가 일치하지 않습니다'));
        return;
      }
    }

    const hashedSecurityPassword = await bcrypt.hash(new_security_password, 12);

    await prisma.user.update({
      where: { id: req.user!.id },
      data: { security_password: hashedSecurityPassword },
    });

    res.json(successResponse({ message: '2차 비밀번호가 설정되었습니다' }));
  } catch (err) {
    console.error('PUT /me/security-password error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /me/login-history — 최근 로그인 기록 10건
router.get('/me/login-history', async (req: Request, res: Response): Promise<void> => {
  try {
    const logs = await prisma.loginLog.findMany({
      where: { user_id: req.user!.id },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        ip_address: true,
        user_agent: true,
        device: true,
        created_at: true,
      },
    });

    res.json(successResponse(logs));
  } catch (err) {
    console.error('GET /me/login-history error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /me/transactions — 거래내역
router.get('/me/transactions', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      type,
      status,
      from,
      to,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    // where 조건 구성
    const where: any = { user_id: req.user!.id };

    if (type) {
      where.type = type as string;
    }

    if (status) {
      where.status = status as string;
    }

    if (from || to) {
      where.created_at = {};
      if (from) where.created_at.gte = new Date(from as string);
      if (to) where.created_at.lte = new Date(to as string);
    }

    // 데이터 조회 + 총 개수
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          type: true,
          amount: true,
          balance_after: true,
          method: true,
          status: true,
          reference: true,
          memo: true,
          created_at: true,
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    // summary 계산 (조회 기간 내)
    const summaryWhere: any = { user_id: req.user!.id };
    if (from || to) {
      summaryWhere.created_at = {};
      if (from) summaryWhere.created_at.gte = new Date(from as string);
      if (to) summaryWhere.created_at.lte = new Date(to as string);
    }
    summaryWhere.status = 'COMPLETED';

    const [depositSum, withdrawSum] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...summaryWhere, type: 'DEPOSIT' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...summaryWhere, type: 'WITHDRAW' },
        _sum: { amount: true },
      }),
    ]);

    const totalDeposit = Number(depositSum._sum.amount || 0);
    const totalWithdraw = Number(withdrawSum._sum.amount || 0);

    res.json(successResponse({
      transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
      },
      summary: {
        total_deposit: totalDeposit,
        total_withdraw: totalWithdraw,
        net_profit: totalDeposit - totalWithdraw,
      },
    }));
  } catch (err) {
    console.error('GET /me/transactions error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /me/bets — 베팅내역 (GameRound 우선, GameLog 폴백)
router.get('/me/bets', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      game_type,
      result,
      from,
      to,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    // GameRound 데이터 존재 여부 확인
    const gameRoundCount = await prisma.gameRound.count({ where: { user_id: req.user!.id } });

    if (gameRoundCount > 0) {
      // GameRound 기반 조회
      const roundWhere: any = { user_id: req.user!.id };

      if (result) roundWhere.result = result as string;

      if (from || to) {
        roundWhere.played_at = {};
        if (from) roundWhere.played_at.gte = new Date(from as string);
        if (to) roundWhere.played_at.lte = new Date(to as string);
      }

      // game_type 필터 — Game 테이블의 provider 기반
      if (game_type) {
        roundWhere.game = { provider: game_type as string };
      }

      const [bets, total] = await Promise.all([
        prisma.gameRound.findMany({
          where: roundWhere,
          orderBy: { played_at: 'desc' },
          skip,
          take: limitNum,
          include: {
            game: { select: { name: true, name_ko: true, provider: true, category: true } },
          },
        }),
        prisma.gameRound.count({ where: roundWhere }),
      ]);

      // stats
      const statsAgg = await prisma.gameRound.aggregate({
        where: roundWhere,
        _sum: { bet_amount: true, win_amount: true, profit: true },
        _count: true,
      });

      const formattedBets = bets.map(b => ({
        id: b.id,
        game_id: b.game_id.toString(),
        game_name: b.game.name_ko || b.game.name,
        provider: b.game.provider,
        round_id: b.round_id,
        bet_amount: b.bet_amount,
        win_amount: b.win_amount,
        profit: b.profit,
        result: b.result,
        created_at: b.played_at,
      }));

      res.json(successResponse({
        bets: formattedBets,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          total_pages: Math.ceil(total / limitNum),
        },
        stats: {
          total_bets: statsAgg._count,
          total_bet_amount: Number(statsAgg._sum.bet_amount || 0),
          total_win_amount: Number(statsAgg._sum.win_amount || 0),
          net_profit: Number(statsAgg._sum.profit || 0),
        },
      }));
    } else {
      // GameLog 폴백 (기존 로직)
      const where: any = { user_id: req.user!.id };

      if (game_type) {
        where.provider = game_type as string;
      }

      if (result) {
        where.result = result as string;
      }

      if (from || to) {
        where.created_at = {};
        if (from) where.created_at.gte = new Date(from as string);
        if (to) where.created_at.lte = new Date(to as string);
      }

      const [bets, total] = await Promise.all([
        prisma.gameLog.findMany({
          where,
          orderBy: { created_at: 'desc' },
          skip,
          take: limitNum,
          select: {
            id: true,
            game_id: true,
            game_name: true,
            provider: true,
            round_id: true,
            bet_amount: true,
            win_amount: true,
            profit: true,
            result: true,
            created_at: true,
          },
        }),
        prisma.gameLog.count({ where }),
      ]);

      const statsWhere: any = { user_id: req.user!.id };
      if (game_type) statsWhere.provider = game_type as string;
      if (result) statsWhere.result = result as string;
      if (from || to) {
        statsWhere.created_at = {};
        if (from) statsWhere.created_at.gte = new Date(from as string);
        if (to) statsWhere.created_at.lte = new Date(to as string);
      }

      const [statsCount, statsAgg] = await Promise.all([
        prisma.gameLog.count({ where: statsWhere }),
        prisma.gameLog.aggregate({
          where: statsWhere,
          _sum: {
            bet_amount: true,
            win_amount: true,
            profit: true,
          },
        }),
      ]);

      res.json(successResponse({
        bets,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          total_pages: Math.ceil(total / limitNum),
        },
        stats: {
          total_bets: statsCount,
          total_bet_amount: Number(statsAgg._sum.bet_amount || 0),
          total_win_amount: Number(statsAgg._sum.win_amount || 0),
          net_profit: Number(statsAgg._sum.profit || 0),
        },
      }));
    }
  } catch (err) {
    console.error('GET /me/bets error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

export default router;
