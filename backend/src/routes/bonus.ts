import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { successResponse, errorResponse } from '../utils';

const router = Router();
const prisma = new PrismaClient();

// ===== 유저 API =====

// GET /api/bonus/templates — 활성 보너스 목록
router.get('/templates', authMiddleware, async (_req: Request, res: Response): Promise<void> => {
  try {
    const templates = await prisma.bonusTemplate.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { priority: 'desc' },
      select: {
        id: true, name: true, description: true,
        deposit_type: true, min_deposit: true, max_deposit: true,
        bonus_percent: true, max_bonus: true,
        wager_multiplier: true, wager_base: true,
        max_conversion: true, allowed_games: true,
        validity_days: true,
      },
    });
    res.json(successResponse(templates));
  } catch (err) {
    console.error('Bonus templates error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// POST /api/bonus/activate — 보너스 활성화
router.post('/activate', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { template_id, deposit_amount } = req.body;
    const userId = req.user!.id;

    if (!template_id || !deposit_amount) {
      res.status(400).json(errorResponse('template_id, deposit_amount 필수'));
      return;
    }

    const depositAmt = new Prisma.Decimal(deposit_amount);

    // 동시 활성 보너스 1개 제한
    const activeBonus = await prisma.userBonus.findFirst({
      where: { user_id: userId, status: 'ACTIVE' },
    });
    if (activeBonus) {
      res.status(400).json(errorResponse('이미 활성 보너스가 있습니다. 완료/취소 후 이용해주세요.'));
      return;
    }

    // 템플릿 조회
    const template = await prisma.bonusTemplate.findUnique({ where: { id: template_id } });
    if (!template || template.status !== 'ACTIVE') {
      res.status(404).json(errorResponse('보너스를 찾을 수 없습니다'));
      return;
    }

    // 입금액 검증
    if (template.min_deposit.gt(0) && depositAmt.lt(template.min_deposit)) {
      res.status(400).json(errorResponse(`최소 입금액: ${template.min_deposit}`));
      return;
    }
    if (template.max_deposit.gt(0) && depositAmt.gt(template.max_deposit)) {
      res.status(400).json(errorResponse(`최대 입금액: ${template.max_deposit}`));
      return;
    }

    // 일일/총 사용 횟수 체크
    if (template.daily_limit > 0) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayCount = await prisma.userBonus.count({
        where: { user_id: userId, template_id, activated_at: { gte: todayStart } },
      });
      if (todayCount >= template.daily_limit) {
        res.status(400).json(errorResponse('오늘 사용 가능 횟수를 초과했습니다'));
        return;
      }
    }
    if (template.total_limit > 0) {
      const totalCount = await prisma.userBonus.count({
        where: { user_id: userId, template_id },
      });
      if (totalCount >= template.total_limit) {
        res.status(400).json(errorResponse('총 사용 가능 횟수를 초과했습니다'));
        return;
      }
    }

    // 보너스 계산
    let bonusAmount = depositAmt.mul(template.bonus_percent).div(100);
    if (template.max_bonus.gt(0) && bonusAmount.gt(template.max_bonus)) {
      bonusAmount = template.max_bonus;
    }

    // 웨이저 계산
    let wagerBase: Prisma.Decimal;
    if (template.wager_base === 'DEPOSIT_ONLY') {
      wagerBase = depositAmt;
    } else if (template.wager_base === 'BONUS_ONLY') {
      wagerBase = bonusAmount;
    } else {
      wagerBase = depositAmt.add(bonusAmount);
    }
    const wagerRequired = wagerBase.mul(template.wager_multiplier);

    // 만료일
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + template.validity_days);

    // 최대 전환액
    const maxConversion = template.max_conversion.gt(0) ? template.max_conversion : new Prisma.Decimal(999999999);

    // 트랜잭션으로 생성
    const result = await prisma.$transaction(async (tx) => {
      // UserBonus 생성
      const userBonus = await tx.userBonus.create({
        data: {
          user_id: userId,
          template_id,
          deposit_amount: depositAmt,
          bonus_amount: bonusAmount,
          current_bonus: bonusAmount,
          wager_required: wagerRequired,
          max_conversion: maxConversion,
          expires_at: expiresAt,
        },
      });

      // 유저 bonus_balance 증가
      const user = await tx.user.update({
        where: { id: userId },
        data: { bonus_balance: { increment: bonusAmount } },
      });

      // BonusTransaction 기록
      await tx.bonusTransaction.create({
        data: {
          user_id: userId,
          user_bonus_id: userBonus.id,
          type: 'GRANT',
          amount: bonusAmount,
          balance_after: user.bonus_balance,
          memo: `${template.name} 활성화`,
        },
      });

      return userBonus;
    });

    res.json(successResponse(result));
  } catch (err) {
    console.error('Bonus activate error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// GET /api/bonus/active — 내 활성 보너스
router.get('/active', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const bonus = await prisma.userBonus.findFirst({
      where: { user_id: req.user!.id, status: 'ACTIVE' },
      include: { template: { select: { name: true, allowed_games: true, wager_multiplier: true } } },
    });
    res.json(successResponse(bonus));
  } catch (err) {
    console.error('Active bonus error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// POST /api/bonus/convert — 웨이저 달성 후 전환
router.post('/convert', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const bonus = await prisma.userBonus.findFirst({
      where: { user_id: userId, status: 'ACTIVE' },
    });

    if (!bonus) {
      res.status(400).json(errorResponse('활성 보너스가 없습니다'));
      return;
    }

    // 웨이저 달성 확인
    if (bonus.wager_completed.lt(bonus.wager_required)) {
      const remaining = bonus.wager_required.sub(bonus.wager_completed);
      res.status(400).json(errorResponse(`웨이저 미달성. 남은 금액: ${remaining}`));
      return;
    }

    // 만료 확인
    if (new Date() > bonus.expires_at) {
      res.status(400).json(errorResponse('보너스가 만료되었습니다'));
      return;
    }

    // 전환 금액 (현재 보너스 잔액, 최대전환액 제한)
    let convertAmount = bonus.current_bonus;
    if (convertAmount.gt(bonus.max_conversion)) {
      convertAmount = bonus.max_conversion;
    }

    const result = await prisma.$transaction(async (tx) => {
      // UserBonus 상태 변경
      await tx.userBonus.update({
        where: { id: bonus.id },
        data: {
          status: 'CONVERTED',
          converted_amount: convertAmount,
          completed_at: new Date(),
          current_bonus: new Prisma.Decimal(0),
        },
      });

      // bonus_balance 차감, balance 증가
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          bonus_balance: { decrement: bonus.current_bonus },
          balance: { increment: convertAmount },
        },
      });

      // BonusTransaction 기록
      await tx.bonusTransaction.create({
        data: {
          user_id: userId,
          user_bonus_id: bonus.id,
          type: 'CONVERT',
          amount: convertAmount,
          balance_after: user.bonus_balance,
          memo: `보너스 전환 (${convertAmount})`,
        },
      });

      return { converted: convertAmount, new_balance: user.balance, new_bonus_balance: user.bonus_balance };
    });

    res.json(successResponse(result));
  } catch (err) {
    console.error('Bonus convert error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// GET /api/bonus/history — 보너스 이력
router.get('/history', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [bonuses, total] = await Promise.all([
      prisma.userBonus.findMany({
        where: { user_id: req.user!.id },
        include: { template: { select: { name: true } } },
        orderBy: { activated_at: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.userBonus.count({ where: { user_id: req.user!.id } }),
    ]);

    res.json(successResponse({ bonuses, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }));
  } catch (err) {
    console.error('Bonus history error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// ===== 관리자 API =====

// GET /api/bonus/admin/stats — 보너스 통계
router.get('/admin/stats', authMiddleware, adminMiddleware, async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalGranted, totalConverted, activeCount, templateCount] = await Promise.all([
      prisma.bonusTransaction.aggregate({ where: { type: 'GRANT' }, _sum: { amount: true } }),
      prisma.bonusTransaction.aggregate({ where: { type: 'CONVERT' }, _sum: { amount: true } }),
      prisma.userBonus.count({ where: { status: 'ACTIVE' } }),
      prisma.bonusTemplate.count({ where: { status: 'ACTIVE' } }),
    ]);

    res.json(successResponse({
      total_granted: totalGranted._sum.amount || 0,
      total_converted: totalConverted._sum.amount || 0,
      active_bonuses: activeCount,
      active_templates: templateCount,
    }));
  } catch (err) {
    console.error('Bonus stats error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// POST /api/bonus/admin/templates — 보너스 템플릿 생성
router.post('/admin/templates', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name, description, deposit_type, min_deposit, max_deposit,
      bonus_percent, max_bonus, wager_multiplier, wager_base,
      max_conversion, allowed_games, validity_days, daily_limit, total_limit, priority,
    } = req.body;

    if (!name || bonus_percent === undefined || wager_multiplier === undefined) {
      res.status(400).json(errorResponse('name, bonus_percent, wager_multiplier 필수'));
      return;
    }

    const template = await prisma.bonusTemplate.create({
      data: {
        name,
        description: description || null,
        deposit_type: deposit_type || 'ALL',
        min_deposit: min_deposit || 0,
        max_deposit: max_deposit || 0,
        bonus_percent,
        max_bonus: max_bonus || 0,
        wager_multiplier,
        wager_base: wager_base || 'DEPOSIT_PLUS_BONUS',
        max_conversion: max_conversion || 0,
        allowed_games: allowed_games || ['ALL'],
        validity_days: validity_days || 7,
        daily_limit: daily_limit || 0,
        total_limit: total_limit || 0,
        priority: priority || 0,
      },
    });

    res.status(201).json(successResponse(template));
  } catch (err) {
    console.error('Create template error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// PUT /api/bonus/admin/templates/:id — 템플릿 수정
router.put('/admin/templates/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const template = await prisma.bonusTemplate.findUnique({ where: { id } });
    if (!template) {
      res.status(404).json(errorResponse('템플릿을 찾을 수 없습니다'));
      return;
    }

    const updated = await prisma.bonusTemplate.update({
      where: { id },
      data: req.body,
    });

    res.json(successResponse(updated));
  } catch (err) {
    console.error('Update template error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// POST /api/bonus/admin/cancel/:id — 유저 보너스 강제 취소
router.post('/admin/cancel/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    const bonus = await prisma.userBonus.findUnique({ where: { id } });
    if (!bonus) {
      res.status(404).json(errorResponse('보너스를 찾을 수 없습니다'));
      return;
    }
    if (bonus.status !== 'ACTIVE') {
      res.status(400).json(errorResponse('활성 상태의 보너스만 취소할 수 있습니다'));
      return;
    }

    await prisma.$transaction(async (tx) => {
      // 상태 변경
      await tx.userBonus.update({
        where: { id },
        data: { status: 'CANCELLED', cancelled_at: new Date(), current_bonus: new Prisma.Decimal(0) },
      });

      // bonus_balance 차감
      const user = await tx.user.update({
        where: { id: bonus.user_id },
        data: { bonus_balance: { decrement: bonus.current_bonus } },
      });

      // 기록
      await tx.bonusTransaction.create({
        data: {
          user_id: bonus.user_id,
          user_bonus_id: id,
          type: 'CANCEL',
          amount: bonus.current_bonus,
          balance_after: user.bonus_balance,
          memo: '관리자 강제 취소',
        },
      });
    });

    res.json(successResponse({ message: '보너스가 취소되었습니다' }));
  } catch (err) {
    console.error('Cancel bonus error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

export default router;
