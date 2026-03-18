import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { successResponse, errorResponse } from '../utils';
import { subtractBalance, addBalance } from '../services/balance';

const router = Router();
const prisma = new PrismaClient();

// ===== 로비 API (인증 불필요) =====

// GET /api/games — 게임 목록
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      provider,
      search,
      featured,
      is_new,
      page = '1',
      limit = '20',
      sort = 'popular',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));

    const where: any = { is_active: true };

    if (category) where.category = category as string;
    if (provider) where.provider = provider as string;
    if (featured === 'true') where.is_featured = true;
    if (is_new === 'true') where.is_new = true;

    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { name_ko: { contains: search as string, mode: 'insensitive' } },
        { provider: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // 정렬
    let orderBy: any;
    switch (sort) {
      case 'newest':
        orderBy = { created_at: 'desc' };
        break;
      case 'az':
        orderBy = { name: 'asc' };
        break;
      case 'popular':
      default:
        orderBy = [{ sort_order: 'desc' }, { play_count: 'desc' }];
        break;
    }

    const [games, total] = await Promise.all([
      prisma.game.findMany({
        where,
        orderBy,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
        select: {
          id: true,
          external_id: true,
          name: true,
          name_ko: true,
          provider: true,
          category: true,
          thumbnail: true,
          is_featured: true,
          is_new: true,
          rtp: true,
          play_count: true,
        },
      }),
      prisma.game.count({ where }),
    ]);

    res.json(successResponse({
      games,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
      },
    }));
  } catch (err) {
    console.error('Games list error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /api/games/providers — 프로바이더 목록
router.get('/providers', async (_req: Request, res: Response): Promise<void> => {
  try {
    const providers = await prisma.game.groupBy({
      by: ['provider'],
      where: { is_active: true },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    res.json(successResponse(
      providers.map(p => ({
        name: p.provider,
        game_count: p._count.id,
      }))
    ));
  } catch (err) {
    console.error('Providers list error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /api/games/categories — 카테고리별 게임 수
router.get('/categories', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.game.groupBy({
      by: ['category'],
      where: { is_active: true },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    });

    res.json(successResponse(
      categories.map(c => ({
        name: c.category,
        game_count: c._count.id,
      }))
    ));
  } catch (err) {
    console.error('Categories list error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /api/games/:id — 게임 상세
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json(errorResponse('유효하지 않은 게임 ID'));
      return;
    }

    const game = await prisma.game.findUnique({
      where: { id },
      select: {
        id: true,
        external_id: true,
        name: true,
        name_ko: true,
        provider: true,
        category: true,
        thumbnail: true,
        is_active: true,
        is_featured: true,
        is_new: true,
        rtp: true,
        sort_order: true,
        play_count: true,
        created_at: true,
      },
    });

    if (!game || !game.is_active) {
      res.status(404).json(errorResponse('게임을 찾을 수 없습니다'));
      return;
    }

    res.json(successResponse(game));
  } catch (err) {
    console.error('Game detail error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// ===== 게임 실행 API =====

// POST /api/games/:id/launch — 게임 세션 생성
router.post('/:id/launch', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const gameId = parseInt(req.params.id);
    const userId = req.user!.id;

    if (isNaN(gameId)) {
      res.status(400).json(errorResponse('유효하지 않은 게임 ID'));
      return;
    }

    const game = await prisma.game.findUnique({ where: { id: gameId } });
    if (!game || !game.is_active) {
      res.status(404).json(errorResponse('게임을 찾을 수 없습니다'));
      return;
    }

    // 기존 활성 세션 종료
    await prisma.gameSession.updateMany({
      where: { user_id: userId, game_id: gameId, status: 'active' },
      data: { status: 'ended', ended_at: new Date() },
    });

    // 새 세션 생성
    const session = await prisma.gameSession.create({
      data: {
        user_id: userId,
        game_id: gameId,
      },
    });

    // play_count 증가
    await prisma.game.update({
      where: { id: gameId },
      data: { play_count: { increment: 1 } },
    });

    res.status(201).json(successResponse({
      session_id: session.id,
      session_token: session.session_token,
      game_url: `/play/${gameId}?session=${session.session_token}`,
    }));
  } catch (err) {
    console.error('Game launch error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// ===== 콜백 API (미들웨어 없음 — 외부 서버에서 호출) =====

// POST /api/games/callback/bet — 베팅 콜백
router.post('/callback/bet', async (req: Request, res: Response): Promise<void> => {
  try {
    const { session_token, round_id, bet_amount } = req.body;

    if (!session_token || !round_id || bet_amount === undefined) {
      res.status(400).json(errorResponse('session_token, round_id, bet_amount 필수'));
      return;
    }

    const session = await prisma.gameSession.findUnique({
      where: { session_token },
      include: { game: true },
    });

    if (!session || session.status !== 'active') {
      res.status(404).json(errorResponse('유효하지 않은 세션입니다'));
      return;
    }

    const betDecimal = new Prisma.Decimal(bet_amount.toString());

    // 잔액 차감
    try {
      await subtractBalance(session.user_id, betDecimal, 'BET', `게임 베팅 (${session.game.name}, 라운드: ${round_id})`);
    } catch (err: any) {
      if (err.message === '잔액 부족') {
        res.status(400).json(errorResponse('잔액 부족'));
        return;
      }
      throw err;
    }

    // GameRound 생성
    const round = await prisma.gameRound.create({
      data: {
        session_id: session.id,
        user_id: session.user_id,
        game_id: session.game_id,
        round_id,
        bet_amount: betDecimal,
      },
    });

    // 세션 총 베팅 업데이트
    await prisma.gameSession.update({
      where: { id: session.id },
      data: { total_bet: { increment: betDecimal } },
    });

    // 잔액 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user_id },
      select: { balance: true },
    });

    res.json(successResponse({
      round_id: round.id,
      balance: user?.balance,
    }));
  } catch (err) {
    console.error('Callback bet error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// POST /api/games/callback/win — 당첨 콜백
router.post('/callback/win', async (req: Request, res: Response): Promise<void> => {
  try {
    const { session_token, round_id, win_amount } = req.body;

    if (!session_token || !round_id || win_amount === undefined) {
      res.status(400).json(errorResponse('session_token, round_id, win_amount 필수'));
      return;
    }

    const session = await prisma.gameSession.findUnique({
      where: { session_token },
      include: { game: true },
    });

    if (!session) {
      res.status(404).json(errorResponse('유효하지 않은 세션입니다'));
      return;
    }

    const winDecimal = new Prisma.Decimal(win_amount.toString());

    // 잔액 추가
    if (winDecimal.gt(0)) {
      await addBalance(session.user_id, winDecimal, 'WIN', `게임 당첨 (${session.game.name}, 라운드: ${round_id})`);
    }

    // GameRound 업데이트
    const existingRound = await prisma.gameRound.findFirst({
      where: { session_id: session.id, round_id },
    });

    if (existingRound) {
      const profit = winDecimal.sub(existingRound.bet_amount);
      await prisma.gameRound.update({
        where: { id: existingRound.id },
        data: {
          win_amount: winDecimal,
          profit,
          result: profit.gt(0) ? 'win' : profit.lt(0) ? 'lose' : 'draw',
        },
      });
    }

    // 세션 총 당첨 업데이트
    await prisma.gameSession.update({
      where: { id: session.id },
      data: { total_win: { increment: winDecimal } },
    });

    // 잔액 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user_id },
      select: { balance: true },
    });

    res.json(successResponse({
      round_id,
      balance: user?.balance,
    }));
  } catch (err) {
    console.error('Callback win error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// POST /api/games/callback/rollback — 롤백 콜백
router.post('/callback/rollback', async (req: Request, res: Response): Promise<void> => {
  try {
    const { session_token, round_id } = req.body;

    if (!session_token || !round_id) {
      res.status(400).json(errorResponse('session_token, round_id 필수'));
      return;
    }

    const session = await prisma.gameSession.findUnique({
      where: { session_token },
      include: { game: true },
    });

    if (!session) {
      res.status(404).json(errorResponse('유효하지 않은 세션입니다'));
      return;
    }

    // 해당 라운드 찾기
    const round = await prisma.gameRound.findFirst({
      where: { session_id: session.id, round_id },
    });

    if (!round) {
      res.status(404).json(errorResponse('해당 라운드를 찾을 수 없습니다'));
      return;
    }

    // 베팅 금액 복구
    await addBalance(session.user_id, round.bet_amount, 'BONUS', `게임 롤백 (${session.game.name}, 라운드: ${round_id})`);

    // 세션 통계 업데이트
    await prisma.gameSession.update({
      where: { id: session.id },
      data: {
        total_bet: { decrement: round.bet_amount },
        total_win: { decrement: round.win_amount },
      },
    });

    // GameRound 삭제
    await prisma.gameRound.delete({ where: { id: round.id } });

    // 잔액 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user_id },
      select: { balance: true },
    });

    res.json(successResponse({
      round_id,
      balance: user?.balance,
      message: '롤백 처리되었습니다',
    }));
  } catch (err) {
    console.error('Callback rollback error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /api/games/callback/balance — 잔액 조회 콜백
router.get('/callback/balance', async (req: Request, res: Response): Promise<void> => {
  try {
    const session_token = req.query.session_token as string;

    if (!session_token) {
      res.status(400).json(errorResponse('session_token 필수'));
      return;
    }

    const session = await prisma.gameSession.findUnique({
      where: { session_token },
    });

    if (!session) {
      res.status(404).json(errorResponse('유효하지 않은 세션입니다'));
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user_id },
      select: { balance: true },
    });

    res.json(successResponse({
      balance: user?.balance || 0,
    }));
  } catch (err) {
    console.error('Callback balance error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// ===== 관리자 API =====

// POST /api/games/admin/games — 게임 추가
router.post('/admin/games', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { external_id, name, name_ko, provider, category, thumbnail, is_active, is_featured, is_new, rtp, sort_order } = req.body;

    if (!name || !provider) {
      res.status(400).json(errorResponse('name, provider 필수'));
      return;
    }

    // external_id 중복 체크
    if (external_id) {
      const existing = await prisma.game.findUnique({ where: { external_id } });
      if (existing) {
        res.status(400).json(errorResponse('이미 등록된 external_id입니다'));
        return;
      }
    }

    const game = await prisma.game.create({
      data: {
        external_id: external_id || null,
        name,
        name_ko: name_ko || null,
        provider,
        category: category || 'slots',
        thumbnail: thumbnail || null,
        is_active: is_active !== undefined ? is_active : true,
        is_featured: is_featured || false,
        is_new: is_new || false,
        rtp: rtp ? new Prisma.Decimal(rtp.toString()) : null,
        sort_order: sort_order || 0,
      },
    });

    res.status(201).json(successResponse(game));
  } catch (err) {
    console.error('Admin add game error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// POST /api/games/admin/games/bulk — 게임 일괄 등록
router.post('/admin/games/bulk', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { games } = req.body;

    if (!games || !Array.isArray(games) || games.length === 0) {
      res.status(400).json(errorResponse('games 배열 필수'));
      return;
    }

    if (games.length > 500) {
      res.status(400).json(errorResponse('한 번에 최대 500개까지 등록 가능합니다'));
      return;
    }

    // external_id 중복 필터
    const externalIds = games.filter((g: any) => g.external_id).map((g: any) => g.external_id);
    const existingGames = await prisma.game.findMany({
      where: { external_id: { in: externalIds } },
      select: { external_id: true },
    });
    const existingSet = new Set(existingGames.map(g => g.external_id));

    const newGames = games
      .filter((g: any) => !g.external_id || !existingSet.has(g.external_id))
      .map((g: any) => ({
        external_id: g.external_id || null,
        name: g.name,
        name_ko: g.name_ko || null,
        provider: g.provider,
        category: g.category || 'slots',
        thumbnail: g.thumbnail || null,
        is_active: g.is_active !== undefined ? g.is_active : true,
        is_featured: g.is_featured || false,
        is_new: g.is_new || false,
        rtp: g.rtp ? new Prisma.Decimal(g.rtp.toString()) : null,
        sort_order: g.sort_order || 0,
      }));

    const result = await prisma.game.createMany({ data: newGames });

    res.status(201).json(successResponse({
      added: result.count,
      duplicates: games.length - newGames.length,
      message: `${result.count}개 게임이 등록되었습니다`,
    }));
  } catch (err) {
    console.error('Admin bulk add games error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// PUT /api/games/admin/games/:id — 게임 수정
router.put('/admin/games/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const game = await prisma.game.findUnique({ where: { id } });
    if (!game) {
      res.status(404).json(errorResponse('게임을 찾을 수 없습니다'));
      return;
    }

    const { external_id, name, name_ko, provider, category, thumbnail, is_active, is_featured, is_new, rtp, sort_order } = req.body;

    const updated = await prisma.game.update({
      where: { id },
      data: {
        ...(external_id !== undefined && { external_id: external_id || null }),
        ...(name !== undefined && { name }),
        ...(name_ko !== undefined && { name_ko }),
        ...(provider !== undefined && { provider }),
        ...(category !== undefined && { category }),
        ...(thumbnail !== undefined && { thumbnail }),
        ...(is_active !== undefined && { is_active }),
        ...(is_featured !== undefined && { is_featured }),
        ...(is_new !== undefined && { is_new }),
        ...(rtp !== undefined && { rtp: rtp ? new Prisma.Decimal(rtp.toString()) : null }),
        ...(sort_order !== undefined && { sort_order }),
      },
    });

    res.json(successResponse(updated));
  } catch (err) {
    console.error('Admin update game error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// DELETE /api/games/admin/games/:id — 게임 비활성화 (soft delete)
router.delete('/admin/games/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const game = await prisma.game.findUnique({ where: { id } });
    if (!game) {
      res.status(404).json(errorResponse('게임을 찾을 수 없습니다'));
      return;
    }

    await prisma.game.update({
      where: { id },
      data: { is_active: false },
    });

    res.json(successResponse({ message: '게임이 비활성화되었습니다' }));
  } catch (err) {
    console.error('Admin delete game error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /api/games/admin/games/stats — 게임별 통계
router.get('/admin/games/stats', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));

    const games = await prisma.game.findMany({
      orderBy: { play_count: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        name_ko: true,
        provider: true,
        category: true,
        is_active: true,
        play_count: true,
        _count: {
          select: {
            sessions: true,
            rounds: true,
          },
        },
      },
    });

    // 게임별 베팅/당첨 합계
    const statsPromises = games.map(async (game) => {
      const agg = await prisma.gameRound.aggregate({
        where: { game_id: game.id },
        _sum: {
          bet_amount: true,
          win_amount: true,
          profit: true,
        },
        _count: true,
      });

      return {
        ...game,
        total_sessions: game._count.sessions,
        total_rounds: game._count.rounds,
        total_bet: Number(agg._sum.bet_amount || 0),
        total_win: Number(agg._sum.win_amount || 0),
        total_profit: Number(agg._sum.profit || 0),
      };
    });

    const stats = await Promise.all(statsPromises);
    const total = await prisma.game.count();

    res.json(successResponse({
      games: stats,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    }));
  } catch (err) {
    console.error('Admin game stats error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

export default router;
