import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { successResponse, errorResponse } from '../utils';
import { addBalance, subtractBalance } from '../services/balance';
import { createAdminLog } from '../services/adminLog';

const router = Router();
const prisma = new PrismaClient();

// 모든 어드민 API에 인증 + 권한 체크
router.use(authMiddleware);
router.use(adminMiddleware);

// ===== 기본 설정값 (최초 조회 시 없으면 자동 생성) =====
const DEFAULT_SETTINGS: Record<string, { value: string; description: string }> = {
  min_deposit: { value: '5', description: '최소 입금액' },
  min_withdraw: { value: '10', description: '최소 출금액' },
  withdraw_fee: { value: '1', description: '출금 수수료' },
  deposit_expire_minutes: { value: '30', description: '입금 만료 시간(분)' },
  maintenance_mode: { value: 'false', description: '점검 모드' },
  signup_enabled: { value: 'true', description: '회원가입 허용' },
  welcome_bonus: { value: '0', description: '웰컴 보너스 금액' },
};

// ===== 유저 관리 =====

// GET /users — 전체 유저 목록
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      search,
      status,
      from,
      to,
      page = '1',
      limit = '20',
    } = req.query;

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

    if (status) {
      where.status = status as string;
    }

    if (from || to) {
      where.created_at = {};
      if (from) where.created_at.gte = new Date(from as string);
      if (to) where.created_at.lte = new Date(to as string);
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
          balance: true,
          bonus_balance: true,
          status: true,
          role: true,
          created_at: true,
          last_login: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    // 각 유저별 총 입금/출금/베팅 합계
    const userIds = users.map((u: any) => u.id);
    const [depositSums, withdrawSums, betSums] = await Promise.all([
      prisma.transaction.groupBy({
        by: ['user_id'],
        where: { user_id: { in: userIds }, type: 'DEPOSIT', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ['user_id'],
        where: { user_id: { in: userIds }, type: 'WITHDRAW', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.groupBy({
        by: ['user_id'],
        where: { user_id: { in: userIds }, type: 'BET', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    const depositMap = new Map(depositSums.map((d: any) => [d.user_id, Number(d._sum.amount || 0)]));
    const withdrawMap = new Map(withdrawSums.map((w: any) => [w.user_id, Number(w._sum.amount || 0)]));
    const betMap = new Map(betSums.map((b: any) => [b.user_id, Number(b._sum.amount || 0)]));

    const data = users.map((u: any) => ({
      ...u,
      balance: Number(u.balance),
      bonus_balance: Number(u.bonus_balance),
      total_deposit: depositMap.get(u.id) || 0,
      total_withdraw: withdrawMap.get(u.id) || 0,
      total_bet: betMap.get(u.id) || 0,
    }));

    res.json(successResponse({
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    }));
  } catch (err) {
    console.error('GET /admin/users error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /users/:id — 유저 상세
router.get('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(String(req.params.id));
    if (isNaN(userId)) {
      res.status(400).json(errorResponse('유효하지 않은 유저 ID입니다'));
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    // 최근 입출금 10건
    const recentTransactions = await prisma.transaction.findMany({
      where: { user_id: userId, type: { in: ['DEPOSIT', 'WITHDRAW'] } },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        type: true,
        amount: true,
        balance_after: true,
        method: true,
        status: true,
        memo: true,
        created_at: true,
      },
    });

    // 최근 베팅 10건
    const recentBets = await prisma.gameLog.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        id: true,
        game_id: true,
        game_name: true,
        provider: true,
        bet_amount: true,
        win_amount: true,
        profit: true,
        result: true,
        created_at: true,
      },
    });

    // 쿠폰 사용 내역
    const couponLogs = await prisma.couponLog.findMany({
      where: { user_id: userId },
      orderBy: { used_at: 'desc' },
      include: {
        coupon: { select: { code: true, type: true, value: true } },
      },
    });

    // 최근 로그인 기록 10건
    const loginLogs = await prisma.loginLog.findMany({
      where: { user_id: userId },
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

    // 총 입금/출금/베팅 합계
    const [depositSum, withdrawSum, betSum] = await Promise.all([
      prisma.transaction.aggregate({
        where: { user_id: userId, type: 'DEPOSIT', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { user_id: userId, type: 'WITHDRAW', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { user_id: userId, type: 'BET', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    res.json(successResponse({
      ...user,
      balance: Number(user.balance),
      bonus_balance: Number(user.bonus_balance),
      totals: {
        total_deposit: Number(depositSum._sum.amount || 0),
        total_withdraw: Number(withdrawSum._sum.amount || 0),
        total_bet: Number(betSum._sum.amount || 0),
      },
      recent_transactions: recentTransactions,
      recent_bets: recentBets,
      coupon_logs: couponLogs,
      login_logs: loginLogs,
    }));
  } catch (err) {
    console.error('GET /admin/users/:id error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// PUT /users/:id — 유저 정보 수정
router.put('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(String(req.params.id));
    if (isNaN(userId)) {
      res.status(400).json(errorResponse('유효하지 않은 유저 ID입니다'));
      return;
    }

    const { nickname, status, role } = req.body;
    const updateData: any = {};

    if (nickname !== undefined) updateData.nickname = nickname;
    if (status !== undefined) updateData.status = status;
    if (role !== undefined) updateData.role = role;

    if (Object.keys(updateData).length === 0) {
      res.status(400).json(errorResponse('수정할 항목이 없습니다'));
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        username: true,
        nickname: true,
        role: true,
        status: true,
        balance: true,
        created_at: true,
      },
    });

    await createAdminLog(
      req.user!.id,
      'USER_UPDATE',
      'User',
      userId,
      { before: { nickname: user.nickname, status: user.status, role: user.role }, after: updateData },
      req.ip
    );

    res.json(successResponse(updated));
  } catch (err) {
    console.error('PUT /admin/users/:id error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// PUT /users/:id/balance — 잔액 수동 조정
router.put('/users/:id/balance', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(String(req.params.id));
    if (isNaN(userId)) {
      res.status(400).json(errorResponse('유효하지 않은 유저 ID입니다'));
      return;
    }

    const { type, amount, memo } = req.body;

    if (!type || !['add', 'subtract'].includes(type)) {
      res.status(400).json(errorResponse('type은 add 또는 subtract이어야 합니다'));
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json(errorResponse('유효한 금액을 입력해주세요'));
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }

    const adminMemo = memo ? `[관리자 조정] ${memo}` : '[관리자 조정]';

    let updated;
    if (type === 'add') {
      updated = await addBalance(userId, numAmount, 'BONUS', adminMemo);
    } else {
      updated = await subtractBalance(userId, numAmount, 'WITHDRAW', adminMemo);
    }

    await createAdminLog(
      req.user!.id,
      'BALANCE_ADJUST',
      'User',
      userId,
      { type, amount: numAmount, memo, balance_after: Number(updated.balance) },
      req.ip
    );

    res.json(successResponse({
      user_id: userId,
      type,
      amount: numAmount,
      balance_after: Number(updated.balance),
    }));
  } catch (err: any) {
    console.error('PUT /admin/users/:id/balance error:', err);
    if (err.message === '잔액 부족') {
      res.status(400).json(errorResponse('유저의 잔액이 부족합니다'));
      return;
    }
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// PUT /users/:id/ban — 차단
router.put('/users/:id/ban', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(String(req.params.id));
    if (isNaN(userId)) {
      res.status(400).json(errorResponse('유효하지 않은 유저 ID입니다'));
      return;
    }

    const { memo } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }

    if (user.status === 'BLOCKED') {
      res.status(400).json(errorResponse('이미 차단된 유저입니다'));
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'BLOCKED' },
    });

    await createAdminLog(
      req.user!.id,
      'USER_BAN',
      'User',
      userId,
      { memo: memo || null, previous_status: user.status },
      req.ip
    );

    res.json(successResponse({ message: '유저가 차단되었습니다', user_id: userId }));
  } catch (err) {
    console.error('PUT /admin/users/:id/ban error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// PUT /users/:id/unban — 차단 해제
router.put('/users/:id/unban', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(String(req.params.id));
    if (isNaN(userId)) {
      res.status(400).json(errorResponse('유효하지 않은 유저 ID입니다'));
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }

    if (user.status !== 'BLOCKED') {
      res.status(400).json(errorResponse('차단된 유저가 아닙니다'));
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: 'ACTIVE' },
    });

    await createAdminLog(
      req.user!.id,
      'USER_UNBAN',
      'User',
      userId,
      null,
      req.ip
    );

    res.json(successResponse({ message: '차단이 해제되었습니다', user_id: userId }));
  } catch (err) {
    console.error('PUT /admin/users/:id/unban error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// ===== 재무 =====

// GET /finance/summary — 전체 재무 요약
router.get('/finance/summary', async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalDeposit,
      totalWithdraw,
      totalBet,
      totalWin,
      activeUsersToday,
      newUsersToday,
      pendingWithdraws,
    ] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: 'DEPOSIT', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: 'WITHDRAW', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: 'BET', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: 'WIN', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.loginLog.groupBy({
        by: ['user_id'],
        where: { created_at: { gte: today } },
      }),
      prisma.user.count({
        where: { created_at: { gte: today } },
      }),
      prisma.withdrawRequest.aggregate({
        where: { status: 'PENDING' },
        _count: true,
        _sum: { amount: true },
      }),
    ]);

    const dep = Number(totalDeposit._sum.amount || 0);
    const wdr = Number(totalWithdraw._sum.amount || 0);
    const bet = Number(totalBet._sum.amount || 0);
    const win = Number(totalWin._sum.amount || 0);
    const houseEdge = bet > 0 ? ((bet - win) / bet * 100) : 0;

    res.json(successResponse({
      total_deposit: dep,
      total_withdraw: wdr,
      total_bet: bet,
      total_win: win,
      house_edge: Math.round(houseEdge * 100) / 100,
      net_revenue: dep - wdr,
      active_users_today: activeUsersToday.length,
      new_users_today: newUsersToday,
      pending_withdraws: {
        count: pendingWithdraws._count || 0,
        amount: Number(pendingWithdraws._sum.amount || 0),
      },
    }));
  } catch (err) {
    console.error('GET /admin/finance/summary error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /finance/daily — 일별 재무 (최근 30일)
router.get('/finance/daily', async (req: Request, res: Response): Promise<void> => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // 날짜별 집계를 위해 raw query 사용
    const dailyFinance: any[] = await prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        SUM(CASE WHEN type = 'DEPOSIT' AND status = 'COMPLETED' THEN amount ELSE 0 END) as deposits,
        SUM(CASE WHEN type = 'WITHDRAW' AND status = 'COMPLETED' THEN amount ELSE 0 END) as withdraws,
        SUM(CASE WHEN type = 'BET' AND status = 'COMPLETED' THEN amount ELSE 0 END) as bets,
        SUM(CASE WHEN type = 'WIN' AND status = 'COMPLETED' THEN amount ELSE 0 END) as wins
      FROM "Transaction"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `;

    // 일별 신규유저, 활성유저
    const dailyUsers: any[] = await prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COUNT(*) as new_users
      FROM "User"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
    `;

    const dailyActive: any[] = await prisma.$queryRaw`
      SELECT
        DATE(created_at) as date,
        COUNT(DISTINCT user_id) as active_users
      FROM "LoginLog"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
    `;

    const newUserMap = new Map(dailyUsers.map((d) => [d.date?.toISOString?.() || String(d.date), Number(d.new_users)]));
    const activeUserMap = new Map(dailyActive.map((d) => [d.date?.toISOString?.() || String(d.date), Number(d.active_users)]));

    const data = dailyFinance.map((d) => {
      const dateKey = d.date?.toISOString?.() || String(d.date);
      return {
        date: dateKey,
        deposits: Number(d.deposits || 0),
        withdraws: Number(d.withdraws || 0),
        bets: Number(d.bets || 0),
        wins: Number(d.wins || 0),
        new_users: newUserMap.get(dateKey) || 0,
        active_users: activeUserMap.get(dateKey) || 0,
      };
    });

    res.json(successResponse(data));
  } catch (err) {
    console.error('GET /admin/finance/daily error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /finance/monthly — 월별 재무 (최근 12개월)
router.get('/finance/monthly', async (req: Request, res: Response): Promise<void> => {
  try {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 12);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const monthlyFinance: any[] = await prisma.$queryRaw`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') as month,
        SUM(CASE WHEN type = 'DEPOSIT' AND status = 'COMPLETED' THEN amount ELSE 0 END) as deposits,
        SUM(CASE WHEN type = 'WITHDRAW' AND status = 'COMPLETED' THEN amount ELSE 0 END) as withdraws,
        SUM(CASE WHEN type = 'BET' AND status = 'COMPLETED' THEN amount ELSE 0 END) as bets,
        SUM(CASE WHEN type = 'WIN' AND status = 'COMPLETED' THEN amount ELSE 0 END) as wins
      FROM "Transaction"
      WHERE created_at >= ${startDate}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
      ORDER BY month DESC
    `;

    const monthlyUsers: any[] = await prisma.$queryRaw`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(*) as new_users
      FROM "User"
      WHERE created_at >= ${startDate}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
    `;

    const monthlyActive: any[] = await prisma.$queryRaw`
      SELECT
        TO_CHAR(created_at, 'YYYY-MM') as month,
        COUNT(DISTINCT user_id) as active_users
      FROM "LoginLog"
      WHERE created_at >= ${startDate}
      GROUP BY TO_CHAR(created_at, 'YYYY-MM')
    `;

    const newUserMap = new Map(monthlyUsers.map((d) => [d.month, Number(d.new_users)]));
    const activeUserMap = new Map(monthlyActive.map((d) => [d.month, Number(d.active_users)]));

    const data = monthlyFinance.map((d) => ({
      month: d.month,
      deposits: Number(d.deposits || 0),
      withdraws: Number(d.withdraws || 0),
      bets: Number(d.bets || 0),
      wins: Number(d.wins || 0),
      new_users: newUserMap.get(d.month) || 0,
      active_users: activeUserMap.get(d.month) || 0,
    }));

    res.json(successResponse(data));
  } catch (err) {
    console.error('GET /admin/finance/monthly error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// ===== 대시보드 =====

// GET /dashboard — 한방 API
router.get('/dashboard', async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // 오늘 통계
    const [todayDeposit, todayWithdraw, todayBet, todayWin, todayNewUsers, todayActiveUsers] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: 'DEPOSIT', status: 'COMPLETED', created_at: { gte: today } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: 'WITHDRAW', status: 'COMPLETED', created_at: { gte: today } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: 'BET', status: 'COMPLETED', created_at: { gte: today } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: 'WIN', status: 'COMPLETED', created_at: { gte: today } },
        _sum: { amount: true },
      }),
      prisma.user.count({ where: { created_at: { gte: today } } }),
      prisma.loginLog.groupBy({
        by: ['user_id'],
        where: { created_at: { gte: today } },
      }),
    ]);

    // 어제 통계 (변화율 계산용)
    const [yDeposit, yWithdraw, yBet, yWin, yNewUsers, yActiveUsers] = await Promise.all([
      prisma.transaction.aggregate({
        where: { type: 'DEPOSIT', status: 'COMPLETED', created_at: { gte: yesterday, lt: today } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: 'WITHDRAW', status: 'COMPLETED', created_at: { gte: yesterday, lt: today } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: 'BET', status: 'COMPLETED', created_at: { gte: yesterday, lt: today } },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { type: 'WIN', status: 'COMPLETED', created_at: { gte: yesterday, lt: today } },
        _sum: { amount: true },
      }),
      prisma.user.count({ where: { created_at: { gte: yesterday, lt: today } } }),
      prisma.loginLog.groupBy({
        by: ['user_id'],
        where: { created_at: { gte: yesterday, lt: today } },
      }),
    ]);

    const calcChange = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 10000) / 100;
    };

    const tDep = Number(todayDeposit._sum.amount || 0);
    const tWdr = Number(todayWithdraw._sum.amount || 0);
    const tBet = Number(todayBet._sum.amount || 0);
    const tWin = Number(todayWin._sum.amount || 0);
    const yDep = Number(yDeposit._sum.amount || 0);
    const yWdr = Number(yWithdraw._sum.amount || 0);
    const yBt = Number(yBet._sum.amount || 0);
    const yWn = Number(yWin._sum.amount || 0);

    // 대기 중 출금
    const pendingWithdraws = await prisma.withdrawRequest.aggregate({
      where: { status: 'PENDING' },
      _count: true,
      _sum: { amount: true },
    });

    // 최근 입금 5건
    const recentDeposits = await prisma.transaction.findMany({
      where: { type: 'DEPOSIT', status: 'COMPLETED' },
      orderBy: { created_at: 'desc' },
      take: 5,
      include: { user: { select: { id: true, username: true, nickname: true } } },
    });

    // 최근 출금 5건
    const recentWithdraws = await prisma.withdrawRequest.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      include: { user: { select: { id: true, username: true, nickname: true } } },
    });

    // 최근 큰 당첨 5건 (GameRound에서 win_amount 큰 순)
    let recentBigWins: any[] = [];
    try {
      recentBigWins = await prisma.gameRound.findMany({
        where: { win_amount: { gt: 0 } },
        orderBy: { win_amount: 'desc' },
        take: 5,
        include: {
          user: { select: { id: true, username: true, nickname: true } },
          game: { select: { name: true, provider: true } },
        },
      });
    } catch {
      // GameRound 테이블이 없으면 Transaction WIN에서
      try {
        recentBigWins = await prisma.transaction.findMany({
          where: { type: 'WIN', status: 'COMPLETED' },
          orderBy: { amount: 'desc' },
          take: 5,
          include: { user: { select: { id: true, username: true, nickname: true } } },
        });
      } catch {
        recentBigWins = [];
      }
    }

    // 최근 가입 5건
    const recentUsers = await prisma.user.findMany({
      orderBy: { created_at: 'desc' },
      take: 5,
      select: {
        id: true,
        username: true,
        nickname: true,
        status: true,
        created_at: true,
      },
    });

    res.json(successResponse({
      today: {
        deposits: tDep,
        withdraws: tWdr,
        bets: tBet,
        wins: tWin,
        new_users: todayNewUsers,
        active_users: todayActiveUsers.length,
      },
      changes: {
        deposits: calcChange(tDep, yDep),
        withdraws: calcChange(tWdr, yWdr),
        bets: calcChange(tBet, yBt),
        wins: calcChange(tWin, yWn),
        new_users: calcChange(todayNewUsers, yNewUsers),
        active_users: calcChange(todayActiveUsers.length, yActiveUsers.length),
      },
      pending: {
        withdraw_count: pendingWithdraws._count || 0,
        withdraw_amount: Number(pendingWithdraws._sum.amount || 0),
      },
      recent_deposits: recentDeposits,
      recent_withdraws: recentWithdraws,
      recent_big_wins: recentBigWins,
      recent_users: recentUsers,
    }));
  } catch (err) {
    console.error('GET /admin/dashboard error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// ===== 시스템 설정 =====

// GET /settings — 전체 설정 목록
router.get('/settings', async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    });

    // 기본 설정값 자동 생성 (없는 것만)
    const existingKeys = new Set(settings.map((s: any) => s.key));
    const missingEntries = Object.entries(DEFAULT_SETTINGS).filter(([key]) => !existingKeys.has(key));

    if (missingEntries.length > 0) {
      await prisma.systemSetting.createMany({
        data: missingEntries.map(([key, { value, description }]) => ({
          key,
          value,
          description,
        })),
        skipDuplicates: true,
      });

      settings = await prisma.systemSetting.findMany({
        orderBy: { key: 'asc' },
      });
    }

    res.json(successResponse(settings));
  } catch (err) {
    console.error('GET /admin/settings error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// PUT /settings — 설정 변경
router.put('/settings', async (req: Request, res: Response): Promise<void> => {
  try {
    const updates = req.body;

    if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
      res.status(400).json(errorResponse('변경할 설정을 입력해주세요'));
      return;
    }

    const results: any[] = [];

    for (const [key, value] of Object.entries(updates)) {
      const updated = await prisma.systemSetting.upsert({
        where: { key },
        create: {
          key,
          value: String(value),
          description: DEFAULT_SETTINGS[key]?.description || null,
          updated_by: req.user!.id,
        },
        update: {
          value: String(value),
          updated_by: req.user!.id,
        },
      });
      results.push(updated);
    }

    await createAdminLog(
      req.user!.id,
      'SETTINGS_UPDATE',
      'SystemSetting',
      undefined,
      updates,
      req.ip
    );

    res.json(successResponse(results));
  } catch (err) {
    console.error('PUT /admin/settings error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// ===== 어드민 로그 =====

// GET /logs — 어드민 활동 로그
router.get('/logs', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      admin_id,
      action,
      from,
      to,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (admin_id) {
      where.admin_id = parseInt(admin_id as string);
    }

    if (action) {
      where.action = action as string;
    }

    if (from || to) {
      where.created_at = {};
      if (from) where.created_at.gte = new Date(from as string);
      if (to) where.created_at.lte = new Date(to as string);
    }

    const [logs, total] = await Promise.all([
      prisma.adminLog.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
        include: {
          admin: { select: { id: true, username: true, nickname: true } },
        },
      }),
      prisma.adminLog.count({ where }),
    ]);

    res.json(successResponse({
      data: logs,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    }));
  } catch (err) {
    console.error('GET /admin/logs error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// ===== 게임 통계 =====

// GET /games/stats — 게임별 통계
router.get('/games/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    // GameRound 테이블에서 게임별 집계
    let stats: any[] = [];
    try {
      stats = await prisma.$queryRaw`
        SELECT
          g.id as game_id,
          g.name as game_name,
          g.provider,
          g.category,
          COUNT(gr.id)::int as play_count,
          COALESCE(SUM(gr.bet_amount), 0) as total_bet,
          COALESCE(SUM(gr.win_amount), 0) as total_win,
          CASE
            WHEN SUM(gr.bet_amount) > 0
            THEN ROUND(((SUM(gr.bet_amount) - SUM(gr.win_amount)) / SUM(gr.bet_amount) * 100)::numeric, 2)
            ELSE 0
          END as house_edge
        FROM "Game" g
        LEFT JOIN "GameRound" gr ON g.id = gr.game_id
        GROUP BY g.id, g.name, g.provider, g.category
        ORDER BY play_count DESC
      `;
    } catch {
      // GameRound 테이블이 없으면 GameLog에서 시도
      try {
        stats = await prisma.$queryRaw`
          SELECT
            game_id,
            game_name,
            provider,
            COUNT(*)::int as play_count,
            COALESCE(SUM(bet_amount), 0) as total_bet,
            COALESCE(SUM(win_amount), 0) as total_win,
            CASE
              WHEN SUM(bet_amount) > 0
              THEN ROUND(((SUM(bet_amount) - SUM(win_amount)) / SUM(bet_amount) * 100)::numeric, 2)
              ELSE 0
            END as house_edge
          FROM "GameLog"
          GROUP BY game_id, game_name, provider
          ORDER BY play_count DESC
        `;
      } catch {
        stats = [];
      }
    }

    const data = (stats as any[]).map((s: any) => ({
      ...s,
      total_bet: Number(s.total_bet || 0),
      total_win: Number(s.total_win || 0),
      house_edge: Number(s.house_edge || 0),
    }));

    res.json(successResponse(data));
  } catch (err) {
    console.error('GET /admin/games/stats error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// ===== 유저 상세 전체 데이터 =====

// GET /users/:id/detail — 유저 상세 (통합)
router.get('/users/:id/detail', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(String(req.params.id));
    if (isNaN(userId)) {
      res.status(400).json(errorResponse('유효하지 않은 유저 ID입니다'));
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        nickname: true,
        phone: true,
        role: true,
        status: true,
        balance: true,
        bonus_balance: true,
        memo: true,
        created_at: true,
        updated_at: true,
        last_login: true,
      },
    });

    if (!user) {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }

    // 통계 (입금/출금/베팅/당첨)
    const [depositSum, withdrawSum, betSum, winSum] = await Promise.all([
      prisma.transaction.aggregate({
        where: { user_id: userId, type: 'DEPOSIT', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { user_id: userId, type: 'WITHDRAW', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { user_id: userId, type: 'BET', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { user_id: userId, type: 'WIN', status: 'COMPLETED' },
        _sum: { amount: true },
      }),
    ]);

    const totalDeposit = Number(depositSum._sum.amount || 0);
    const totalWithdraw = Number(withdrawSum._sum.amount || 0);
    const totalBet = Number(betSum._sum.amount || 0);
    const totalWin = Number(winSum._sum.amount || 0);

    // 최근 로그인 10건
    const recentLogins = await prisma.loginLog.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 10,
      select: {
        ip_address: true,
        device: true,
        user_agent: true,
        created_at: true,
        fingerprint_hash: true,
      },
    });

    // 활성 보너스
    const activeBonuses = await prisma.userBonus.findMany({
      where: { user_id: userId, status: 'ACTIVE' },
      include: {
        template: { select: { name: true } },
      },
    });

    const activeBonus = activeBonuses.map((b: any) => ({
      template_name: b.template.name,
      wagered: Number(b.wager_completed),
      required: Number(b.wager_required),
      progress_pct: Number(b.wager_required) > 0
        ? Math.round(Number(b.wager_completed) / Number(b.wager_required) * 10000) / 100
        : 0,
    }));

    // 최근 트랜잭션 20건
    const recentTransactions = await prisma.transaction.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 20,
      select: {
        id: true,
        type: true,
        amount: true,
        balance_after: true,
        status: true,
        reference: true,
        memo: true,
        created_at: true,
      },
    });

    res.json(successResponse({
      user: {
        ...user,
        balance: Number(user.balance),
        bonus_balance: Number(user.bonus_balance),
      },
      stats: {
        totalDeposit,
        totalWithdraw,
        totalBet,
        totalWin,
        netProfit: totalDeposit - totalWithdraw,
      },
      recentLogins,
      activeBonus,
      recentTransactions: recentTransactions.map((t: any) => ({
        ...t,
        amount: Number(t.amount),
        balance_after: Number(t.balance_after),
      })),
    }));
  } catch (err) {
    console.error('GET /admin/users/:id/detail error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// ===== 머니히스토리 =====

// GET /money-history — 전체 유저 머니히스토리
router.get('/money-history', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      page = '1',
      limit = '20',
      type,
      username,
      startDate,
      endDate,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 20));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    // type 필터 (deposit/withdraw/bet/win/bonus/coupon → TxType enum)
    if (type) {
      const typeStr = (type as string).toUpperCase();
      if (['DEPOSIT', 'WITHDRAW', 'BET', 'WIN', 'BONUS'].includes(typeStr)) {
        where.type = typeStr;
      }
    }

    // username 필터
    if (username) {
      where.user = {
        username: { contains: username as string, mode: 'insensitive' },
      };
    }

    // 날짜 필터
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) where.created_at.gte = new Date(startDate as string);
      if (endDate) where.created_at.lte = new Date(endDate as string);
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
        include: {
          user: { select: { username: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    // 필터된 기간의 합계
    const summaryWhere = { ...where, status: 'COMPLETED' as const };
    const [sumDeposit, sumWithdraw, sumBet, sumWin] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...summaryWhere, type: 'DEPOSIT' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...summaryWhere, type: 'WITHDRAW' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...summaryWhere, type: 'BET' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...summaryWhere, type: 'WIN' },
        _sum: { amount: true },
      }),
    ]);

    const totalDeposit = Number(sumDeposit._sum.amount || 0);
    const totalWithdraw = Number(sumWithdraw._sum.amount || 0);
    const totalBet = Number(sumBet._sum.amount || 0);
    const totalWin = Number(sumWin._sum.amount || 0);

    res.json(successResponse({
      transactions: transactions.map((t: any) => ({
        id: t.id,
        username: t.user.username,
        type: t.type,
        amount: Number(t.amount),
        balance_after: Number(t.balance_after),
        reference: t.reference,
        memo: t.memo,
        created_at: t.created_at,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        total_pages: Math.ceil(total / limitNum),
      },
      summary: {
        totalDeposit,
        totalWithdraw,
        totalBet,
        totalWin,
        netProfit: totalDeposit - totalWithdraw,
      },
    }));
  } catch (err) {
    console.error('GET /admin/money-history error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// ===== 유저 메모 =====

// PUT /users/:id/memo — 유저 메모 저장
router.put('/users/:id/memo', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(String(req.params.id));
    if (isNaN(userId)) {
      res.status(400).json(errorResponse('유효하지 않은 유저 ID입니다'));
      return;
    }

    const { memo } = req.body;
    if (memo === undefined) {
      res.status(400).json(errorResponse('memo 필드가 필요합니다'));
      return;
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }

    await prisma.user.update({
      where: { id: userId },
      data: { memo: memo || null },
    });

    await createAdminLog(
      req.user!.id,
      'USER_MEMO_UPDATE',
      'User',
      userId,
      { memo },
      req.ip
    );

    res.json(successResponse({ user_id: userId, memo: memo || null }));
  } catch (err) {
    console.error('PUT /admin/users/:id/memo error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// ===== 쿠폰 통계 =====

// GET /coupons/stats — 쿠폰 통계
router.get('/coupons/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const now = new Date();

    // 전체 쿠폰 목록
    const coupons = await prisma.coupon.findMany({
      select: {
        id: true,
        type: true,
        value: true,
        max_uses: true,
        used_count: true,
        is_active: true,
        expires_at: true,
      },
    });

    let totalIssued = 0;
    let totalUsed = 0;
    let totalExpired = 0;
    let totalUnused = 0;
    let totalAmountIssued = 0;
    let totalAmountUsed = 0;

    const byType: Record<string, { issued: number; used: number }> = {};

    for (const c of coupons) {
      const typeName = c.type as string;
      if (!byType[typeName]) {
        byType[typeName] = { issued: 0, used: 0 };
      }

      totalIssued++;
      byType[typeName].issued++;
      totalAmountIssued += Number(c.value);

      if (c.used_count > 0) {
        totalUsed++;
        byType[typeName].used++;
        totalAmountUsed += Number(c.value) * c.used_count;
      }

      if (c.expires_at && c.expires_at < now && c.used_count === 0) {
        totalExpired++;
      }

      if (c.used_count === 0 && c.is_active && (!c.expires_at || c.expires_at >= now)) {
        totalUnused++;
      }
    }

    res.json(successResponse({
      total: {
        issued: totalIssued,
        used: totalUsed,
        expired: totalExpired,
        unused: totalUnused,
      },
      byType,
      totalAmount: {
        issued: totalAmountIssued,
        used: totalAmountUsed,
      },
    }));
  } catch (err) {
    console.error('GET /admin/coupons/stats error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// ===== 쿠폰 일괄 발급 =====

// POST /coupons/bulk-assign — 다수 유저에게 일괄 쿠폰 발급
router.post('/coupons/bulk-assign', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userIds, couponData } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      res.status(400).json(errorResponse('userIds 배열이 필요합니다'));
      return;
    }

    if (!couponData || !couponData.type || couponData.amount === undefined) {
      res.status(400).json(errorResponse('couponData에 type, amount가 필요합니다'));
      return;
    }

    const { code_prefix = 'BULK', type, amount, expires_at, description } = couponData;

    // type 검증
    if (!['BONUS_MONEY', 'FREE_SPIN', 'DEPOSIT_BONUS'].includes(type)) {
      res.status(400).json(errorResponse('type은 BONUS_MONEY, FREE_SPIN, DEPOSIT_BONUS 중 하나여야 합니다'));
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      res.status(400).json(errorResponse('유효한 금액을 입력해주세요'));
      return;
    }

    // 유저 존재 확인
    const users = await prisma.user.findMany({
      where: { id: { in: userIds.map((id: any) => parseInt(id)) } },
      select: { id: true, username: true },
    });

    if (users.length === 0) {
      res.status(400).json(errorResponse('유효한 유저가 없습니다'));
      return;
    }

    const createdCoupons: any[] = [];
    const timestamp = Date.now().toString(36);

    for (const user of users) {
      const code = `${code_prefix}-${user.id}-${timestamp}`.toUpperCase();

      const coupon = await prisma.coupon.create({
        data: {
          code,
          type: type as any,
          value: numAmount,
          max_uses: 1,
          target_user_id: user.id,
          is_active: true,
          expires_at: expires_at ? new Date(expires_at) : null,
          description: description || `일괄 발급 (${code_prefix})`,
        },
      });

      createdCoupons.push({
        coupon_id: coupon.id,
        code: coupon.code,
        user_id: user.id,
        username: user.username,
      });
    }

    await createAdminLog(
      req.user!.id,
      'COUPON_BULK_ASSIGN',
      'Coupon',
      undefined,
      { userIds: users.map((u: any) => u.id), couponData, created_count: createdCoupons.length },
      req.ip
    );

    res.json(successResponse({
      created_count: createdCoupons.length,
      coupons: createdCoupons,
    }));
  } catch (err) {
    console.error('POST /admin/coupons/bulk-assign error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

export default router;
