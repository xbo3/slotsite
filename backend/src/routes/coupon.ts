import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { successResponse, errorResponse } from '../utils';

const router = Router();
const prisma = new PrismaClient();

// ===== 헬퍼 =====

function generateCouponCode(prefix?: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix ? `${prefix}${code}` : code;
}

// ===== 관리자 API =====

// POST /api/coupons/admin/coupons — 쿠폰 생성
router.post('/admin/coupons', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      code, auto, type, value, min_deposit, max_uses,
      starts_at, expires_at, is_active, target_user_id, description,
    } = req.body;

    if (!type || value === undefined) {
      res.status(400).json(errorResponse('type, value 필수'));
      return;
    }

    const couponCode = auto ? generateCouponCode() : code;
    if (!couponCode) {
      res.status(400).json(errorResponse('code 또는 auto: true 필수'));
      return;
    }

    // 중복 체크
    const existing = await prisma.coupon.findUnique({ where: { code: couponCode } });
    if (existing) {
      res.status(400).json(errorResponse('이미 존재하는 쿠폰 코드입니다'));
      return;
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: couponCode,
        type,
        value,
        min_deposit: min_deposit || 0,
        max_uses: max_uses || 0,
        starts_at: starts_at ? new Date(starts_at) : new Date(),
        expires_at: expires_at ? new Date(expires_at) : null,
        is_active: is_active !== undefined ? is_active : true,
        target_user_id: target_user_id || null,
        description: description || null,
      },
    });

    res.status(201).json(successResponse(coupon));
  } catch (err) {
    console.error('Create coupon error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// POST /api/coupons/admin/coupons/bulk — 벌크 생성
router.post('/admin/coupons/bulk', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { count, prefix, type, value, min_deposit, max_uses, starts_at, expires_at, description } = req.body;

    if (!count || count < 1 || count > 1000) {
      res.status(400).json(errorResponse('count는 1~1000 사이 필수'));
      return;
    }
    if (!type || value === undefined) {
      res.status(400).json(errorResponse('type, value 필수'));
      return;
    }

    const coupons = [];
    const codes = new Set<string>();

    // 유니크 코드 생성
    while (codes.size < count) {
      codes.add(generateCouponCode(prefix));
    }

    // DB에 이미 있는 코드 체크
    const existingCodes = await prisma.coupon.findMany({
      where: { code: { in: Array.from(codes) } },
      select: { code: true },
    });
    const existingSet = new Set(existingCodes.map(c => c.code));

    for (const code of codes) {
      if (existingSet.has(code)) continue;
      coupons.push({
        code,
        type,
        value,
        min_deposit: min_deposit || 0,
        max_uses: max_uses || 0,
        starts_at: starts_at ? new Date(starts_at) : new Date(),
        expires_at: expires_at ? new Date(expires_at) : null,
        description: description || null,
      });
    }

    const result = await prisma.coupon.createMany({ data: coupons });

    res.status(201).json(successResponse({ created: result.count, codes: Array.from(codes).filter(c => !existingSet.has(c)) }));
  } catch (err) {
    console.error('Bulk create coupon error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// GET /api/coupons/admin/coupons — 목록
router.get('/admin/coupons', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string; // active, inactive, all
    const type = req.query.type as string;
    const search = req.query.search as string;

    const where: any = {};

    if (status === 'active') where.is_active = true;
    else if (status === 'inactive') where.is_active = false;

    if (type) where.type = type;

    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        include: { _count: { select: { logs: true } } },
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.coupon.count({ where }),
    ]);

    res.json(successResponse({
      coupons,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }));
  } catch (err) {
    console.error('List coupons error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// PUT /api/coupons/admin/coupons/:id — 수정
router.put('/admin/coupons/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      res.status(404).json(errorResponse('쿠폰을 찾을 수 없습니다'));
      return;
    }

    const { type, value, min_deposit, max_uses, starts_at, expires_at, is_active, target_user_id, description } = req.body;

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        ...(type !== undefined && { type }),
        ...(value !== undefined && { value }),
        ...(min_deposit !== undefined && { min_deposit }),
        ...(max_uses !== undefined && { max_uses }),
        ...(starts_at !== undefined && { starts_at: new Date(starts_at) }),
        ...(expires_at !== undefined && { expires_at: expires_at ? new Date(expires_at) : null }),
        ...(is_active !== undefined && { is_active }),
        ...(target_user_id !== undefined && { target_user_id: target_user_id || null }),
        ...(description !== undefined && { description }),
      },
    });

    res.json(successResponse(updated));
  } catch (err) {
    console.error('Update coupon error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// DELETE /api/coupons/admin/coupons/:id — 삭제 (사용된 적 있으면 soft delete)
router.delete('/admin/coupons/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      res.status(404).json(errorResponse('쿠폰을 찾을 수 없습니다'));
      return;
    }

    if (coupon.used_count > 0) {
      // soft delete
      await prisma.coupon.update({ where: { id }, data: { is_active: false } });
      res.json(successResponse({ message: '사용 내역이 있어 비활성화 처리되었습니다' }));
    } else {
      // hard delete
      await prisma.coupon.delete({ where: { id } });
      res.json(successResponse({ message: '쿠폰이 삭제되었습니다' }));
    }
  } catch (err) {
    console.error('Delete coupon error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// GET /api/coupons/admin/coupons/:id/logs — 사용 내역
router.get('/admin/coupons/:id/logs', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) {
      res.status(404).json(errorResponse('쿠폰을 찾을 수 없습니다'));
      return;
    }

    const [logs, total] = await Promise.all([
      prisma.couponLog.findMany({
        where: { coupon_id: id },
        include: { user: { select: { id: true, username: true, nickname: true } } },
        orderBy: { used_at: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.couponLog.count({ where: { coupon_id: id } }),
    ]);

    res.json(successResponse({
      coupon: { id: coupon.id, code: coupon.code, type: coupon.type },
      logs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }));
  } catch (err) {
    console.error('Coupon logs error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// ===== 유저 API =====

// POST /api/coupons/apply — 쿠폰 적용
router.post('/apply', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;
    const userId = req.user!.id;

    if (!code) {
      res.status(400).json(errorResponse('쿠폰 코드를 입력해주세요'));
      return;
    }

    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase().trim() } });

    // 존재 여부
    if (!coupon) {
      res.status(404).json(errorResponse('유효하지 않은 쿠폰 코드입니다'));
      return;
    }

    // 활성 상태
    if (!coupon.is_active) {
      res.status(400).json(errorResponse('비활성화된 쿠폰입니다'));
      return;
    }

    // 시작일 체크
    if (new Date() < coupon.starts_at) {
      res.status(400).json(errorResponse('아직 사용 기간이 아닙니다'));
      return;
    }

    // 만료일 체크
    if (coupon.expires_at && new Date() > coupon.expires_at) {
      res.status(400).json(errorResponse('만료된 쿠폰입니다'));
      return;
    }

    // 사용횟수 체크
    if (coupon.max_uses > 0 && coupon.used_count >= coupon.max_uses) {
      res.status(400).json(errorResponse('사용 가능 횟수를 초과한 쿠폰입니다'));
      return;
    }

    // 특정 유저 전용 체크
    if (coupon.target_user_id && coupon.target_user_id !== userId) {
      res.status(403).json(errorResponse('이 쿠폰을 사용할 권한이 없습니다'));
      return;
    }

    // 이미 사용했는지 체크
    const alreadyUsed = await prisma.couponLog.findFirst({
      where: { coupon_id: coupon.id, user_id: userId },
    });
    if (alreadyUsed) {
      res.status(400).json(errorResponse('이미 사용한 쿠폰입니다'));
      return;
    }

    const bonusAmount = new Prisma.Decimal(coupon.value);

    // 타입별 처리
    if (coupon.type === 'BONUS_MONEY') {
      // 바로 balance에 추가
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: userId },
          data: { balance: { increment: bonusAmount } },
        });

        await tx.couponLog.create({
          data: { coupon_id: coupon.id, user_id: userId, bonus_amount: bonusAmount },
        });

        await tx.coupon.update({
          where: { id: coupon.id },
          data: { used_count: { increment: 1 } },
        });

        return { type: 'BONUS_MONEY', amount: bonusAmount, new_balance: user.balance };
      });

      res.json(successResponse(result));

    } else if (coupon.type === 'FREE_SPIN') {
      // bonus_balance에 추가
      const result = await prisma.$transaction(async (tx) => {
        const user = await tx.user.update({
          where: { id: userId },
          data: { bonus_balance: { increment: bonusAmount } },
        });

        await tx.couponLog.create({
          data: { coupon_id: coupon.id, user_id: userId, bonus_amount: bonusAmount },
        });

        await tx.coupon.update({
          where: { id: coupon.id },
          data: { used_count: { increment: 1 } },
        });

        return { type: 'FREE_SPIN', amount: bonusAmount, new_bonus_balance: user.bonus_balance };
      });

      res.json(successResponse(result));

    } else if (coupon.type === 'DEPOSIT_BONUS') {
      // 로그만 남기고 메모에 기록 (다음 입금 시 적용)
      const result = await prisma.$transaction(async (tx) => {
        await tx.couponLog.create({
          data: {
            coupon_id: coupon.id,
            user_id: userId,
            bonus_amount: new Prisma.Decimal(0), // 아직 실적용 안 됨
          },
        });

        await tx.coupon.update({
          where: { id: coupon.id },
          data: { used_count: { increment: 1 } },
        });

        return {
          type: 'DEPOSIT_BONUS',
          value: coupon.value,
          min_deposit: coupon.min_deposit,
          message: `다음 입금 시 ${coupon.value}% 보너스가 적용됩니다`,
        };
      });

      res.json(successResponse(result));

    } else {
      res.status(400).json(errorResponse('알 수 없는 쿠폰 타입입니다'));
    }
  } catch (err) {
    console.error('Apply coupon error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// GET /api/coupons/my — 내 쿠폰 사용 내역
router.get('/my', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // 사용한 쿠폰 내역
    const [logs, total] = await Promise.all([
      prisma.couponLog.findMany({
        where: { user_id: userId },
        include: {
          coupon: {
            select: { code: true, type: true, value: true, description: true },
          },
        },
        orderBy: { used_at: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.couponLog.count({ where: { user_id: userId } }),
    ]);

    // 나한테 할당된 미사용 쿠폰
    const availableCoupons = await prisma.coupon.findMany({
      where: {
        target_user_id: userId,
        is_active: true,
        OR: [
          { expires_at: null },
          { expires_at: { gt: new Date() } },
        ],
        NOT: {
          logs: { some: { user_id: userId } },
        },
      },
      select: { id: true, code: true, type: true, value: true, description: true, expires_at: true },
    });

    res.json(successResponse({
      used: logs,
      available: availableCoupons,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }));
  } catch (err) {
    console.error('My coupons error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

export default router;
