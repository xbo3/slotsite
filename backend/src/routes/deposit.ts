import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { successResponse, errorResponse } from '../utils';
import { addBalance } from '../services/balance';
import * as bipaysService from '../services/bipays';
import { notifyDeposit } from '../services/telegram';

const router = Router();
const prisma = new PrismaClient();

/**
 * 입금 시 auto_apply_on_deposit = true인 BonusTemplate 자동 적용
 */
async function autoApplyDepositBonus(userId: number, depositAmount: Prisma.Decimal): Promise<void> {
  try {
    // 이미 활성 보너스가 있으면 스킵
    const activeBonus = await prisma.userBonus.findFirst({
      where: { user_id: userId, status: 'ACTIVE' },
    });
    if (activeBonus) return;

    // auto_apply_on_deposit = true인 활성 템플릿 조회
    const templates = await prisma.bonusTemplate.findMany({
      where: { status: 'ACTIVE', auto_apply_on_deposit: true },
      orderBy: { priority: 'desc' },
    });

    for (const template of templates) {
      // 최소 입금액 조건
      if (template.min_deposit_amount && depositAmount.lt(template.min_deposit_amount)) continue;
      if (template.min_deposit.gt(0) && depositAmount.lt(template.min_deposit)) continue;
      if (template.max_deposit.gt(0) && depositAmount.gt(template.max_deposit)) continue;

      // 횟수 체크
      if (template.daily_limit > 0) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const todayCount = await prisma.userBonus.count({
          where: { user_id: userId, template_id: template.id, activated_at: { gte: todayStart } },
        });
        if (todayCount >= template.daily_limit) continue;
      }
      if (template.total_limit > 0) {
        const totalCount = await prisma.userBonus.count({
          where: { user_id: userId, template_id: template.id },
        });
        if (totalCount >= template.total_limit) continue;
      }

      // 보너스 계산
      let bonusAmount: Prisma.Decimal;
      const isLoan = !!(template.loan_percent && template.loan_percent > 0);

      if (isLoan) {
        bonusAmount = depositAmount.mul(template.loan_percent!).div(100);
      } else {
        bonusAmount = depositAmount.mul(template.bonus_percent).div(100);
        if (template.max_bonus.gt(0) && bonusAmount.gt(template.max_bonus)) {
          bonusAmount = template.max_bonus;
        }
      }

      // 웨이저 계산
      let wagerBase: Prisma.Decimal;
      if (isLoan) {
        wagerBase = depositAmount.add(bonusAmount);
      } else if (template.wager_base === 'DEPOSIT_ONLY') {
        wagerBase = depositAmount;
      } else if (template.wager_base === 'BONUS_ONLY') {
        wagerBase = bonusAmount;
      } else {
        wagerBase = depositAmount.add(bonusAmount);
      }
      const wagerRequired = wagerBase.mul(template.wager_multiplier);

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + template.validity_days);

      let maxConversion: Prisma.Decimal;
      if (template.max_conversion_amount) {
        maxConversion = template.max_conversion_amount;
      } else if (template.max_conversion.gt(0)) {
        maxConversion = template.max_conversion;
      } else {
        maxConversion = new Prisma.Decimal(999999999);
      }

      await prisma.$transaction(async (tx) => {
        const userBonus = await tx.userBonus.create({
          data: {
            user_id: userId,
            template_id: template.id,
            deposit_amount: depositAmount,
            bonus_amount: bonusAmount,
            current_bonus: bonusAmount,
            wager_required: wagerRequired,
            max_conversion: maxConversion,
            is_loan: isLoan,
            expires_at: expiresAt,
          },
        });

        const user = await tx.user.update({
          where: { id: userId },
          data: { bonus_balance: { increment: bonusAmount } },
        });

        await tx.bonusTransaction.create({
          data: {
            user_id: userId,
            user_bonus_id: userBonus.id,
            type: 'GRANT',
            amount: bonusAmount,
            balance_after: user.bonus_balance,
            memo: `${template.name} 자동 지급 (입금 ${depositAmount})`,
          },
        });
      });

      console.log(`[AutoBonus] user=${userId}, template=${template.name}, bonus=${bonusAmount}`);
      break; // 1개만 적용
    }
  } catch (err) {
    console.error('[AutoBonus] Error:', err);
  }
}

// ===== 유저 API =====

// POST /api/deposit/request — 입금 요청 (BiPays 우선, 폴백: 수동 주소 할당)
router.post('/request', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }

    // ── BiPays 연동 시도 ──
    if (bipaysService.isConfigured()) {
      try {
        // 이미 BiPays 회원이면 기존 주소 반환
        if (user.bipays_deposit_address) {
          res.json(successResponse({
            address: user.bipays_deposit_address,
            method: 'bipays',
            message: 'USDT 입금 주소입니다. 송금 후 자동으로 잔액에 반영됩니다.',
          }));
          return;
        }

        // BiPays에 회원 등록 → 입금 주소 발급
        const result = await bipaysService.registerMember(userId, user.username, user.nickname);
        const { deposit_address, member_id } = result.data;

        // DB에 저장
        await prisma.user.update({
          where: { id: userId },
          data: {
            bipays_member_id: member_id,
            bipays_deposit_address: deposit_address,
          },
        });

        console.log(`[Deposit] BiPays 회원 등록: user=${user.username}, address=${deposit_address}`);

        res.json(successResponse({
          address: deposit_address,
          method: 'bipays',
          message: 'USDT 입금 주소가 발급되었습니다. 송금 후 자동으로 잔액에 반영됩니다.',
        }));
        return;
      } catch (bipaysErr: any) {
        console.error('[Deposit] BiPays 실패, 수동 할당 폴백:', bipaysErr.message);
        // BiPays 실패 시 아래 기존 방식으로 폴백
      }
    }

    // ── 폴백: 기존 수동 지갑 주소 할당 ──

    // 이미 대기중인 입금 요청이 있는지 확인
    const existing = await prisma.depositRequest.findFirst({
      where: {
        user_id: userId,
        status: 'PENDING',
        expires_at: { gt: new Date() },
      },
    });

    if (existing) {
      res.json(successResponse({
        address: existing.wallet_address,
        deposit: existing,
        method: 'manual',
        message: '이미 대기 중인 입금 요청이 있습니다',
      }));
      return;
    }

    // 미사용 지갑 주소 할당
    const wallet = await prisma.walletAddress.findFirst({
      where: { is_assigned: false },
      orderBy: { id: 'asc' },
    });

    if (!wallet) {
      res.status(503).json(errorResponse('사용 가능한 지갑 주소가 없습니다. 관리자에게 문의해주세요'));
      return;
    }

    // 30분 만료
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    const [deposit] = await prisma.$transaction([
      prisma.depositRequest.create({
        data: {
          user_id: userId,
          wallet_address: wallet.address,
          expires_at: expiresAt,
        },
      }),
      prisma.walletAddress.update({
        where: { id: wallet.id },
        data: {
          is_assigned: true,
          user_id: userId,
          assigned_at: new Date(),
        },
      }),
    ]);

    res.status(201).json(successResponse({
      address: wallet.address,
      deposit,
      method: 'manual',
      message: '입금 주소가 할당되었습니다. 30분 내에 송금해주세요',
    }));
  } catch (err) {
    console.error('Deposit request error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /api/deposit/status/:id — 입금 상태 확인
router.get('/status/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user!.id;

    const deposit = await prisma.depositRequest.findFirst({
      where: { id, user_id: userId },
    });

    if (!deposit) {
      res.status(404).json(errorResponse('입금 요청을 찾을 수 없습니다'));
      return;
    }

    res.json(successResponse(deposit));
  } catch (err) {
    console.error('Deposit status error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /api/deposit/history — 내 입금 내역
router.get('/history', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const status = req.query.status as string;

    const where: any = { user_id: userId };
    if (status) where.status = status;

    const [deposits, total] = await Promise.all([
      prisma.depositRequest.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.depositRequest.count({ where }),
    ]);

    res.json(successResponse({
      deposits,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    }));
  } catch (err) {
    console.error('Deposit history error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// ===== 관리자 API =====

// POST /api/deposit/admin/confirm — 관리자 수동 입금 확인
router.post('/admin/confirm', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { deposit_id, amount } = req.body;

    if (!deposit_id || !amount) {
      res.status(400).json(errorResponse('deposit_id, amount 필수'));
      return;
    }

    const deposit = await prisma.depositRequest.findUnique({ where: { id: deposit_id } });
    if (!deposit) {
      res.status(404).json(errorResponse('입금 요청을 찾을 수 없습니다'));
      return;
    }

    if (deposit.status !== 'PENDING') {
      res.status(400).json(errorResponse(`이미 처리된 요청입니다 (상태: ${deposit.status})`));
      return;
    }

    const actualAmount = new Prisma.Decimal(amount.toString());

    // 입금 확인 처리 + 잔액 증가
    await prisma.depositRequest.update({
      where: { id: deposit_id },
      data: {
        status: 'CONFIRMED',
        actual_amount: actualAmount,
        confirmed_at: new Date(),
      },
    });

    const user = await addBalance(deposit.user_id, actualAmount, 'DEPOSIT', `입금 확인 (요청 #${deposit_id})`);

    // 입금 보너스 자동 지급
    await autoApplyDepositBonus(deposit.user_id, actualAmount);

    // 텔레그램 알림
    const depositUser = await prisma.user.findUnique({ where: { id: deposit.user_id }, select: { username: true } });
    if (depositUser) {
      notifyDeposit(depositUser.username, Number(actualAmount), '관리자 수동 확인');
    }

    res.json(successResponse({
      deposit_id,
      user_id: deposit.user_id,
      amount: actualAmount,
      new_balance: user.balance,
      message: '입금이 확인되었습니다',
    }));
  } catch (err) {
    console.error('Deposit confirm error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// POST /api/deposit/admin/wallets/bulk-add — 지갑 주소 일괄 등록
router.post('/admin/wallets/bulk-add', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { addresses } = req.body;

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      res.status(400).json(errorResponse('addresses 배열 필수'));
      return;
    }

    // 중복 제거
    const unique = [...new Set(addresses.map((a: string) => a.trim()).filter(Boolean))];

    // 이미 등록된 주소 확인
    const existing = await prisma.walletAddress.findMany({
      where: { address: { in: unique } },
      select: { address: true },
    });
    const existingSet = new Set(existing.map(e => e.address));

    const newAddresses = unique.filter(a => !existingSet.has(a));

    if (newAddresses.length === 0) {
      res.status(400).json(errorResponse('모든 주소가 이미 등록되어 있습니다'));
      return;
    }

    const result = await prisma.walletAddress.createMany({
      data: newAddresses.map(address => ({ address })),
    });

    res.status(201).json(successResponse({
      added: result.count,
      duplicates: unique.length - newAddresses.length,
      message: `${result.count}개 주소가 등록되었습니다`,
    }));
  } catch (err) {
    console.error('Bulk add wallets error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /api/deposit/admin/wallets — 전체 지갑 목록
router.get('/admin/wallets', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 50));
    const assigned = req.query.assigned as string; // true, false, all

    const where: any = {};
    if (assigned === 'true') where.is_assigned = true;
    else if (assigned === 'false') where.is_assigned = false;

    const [wallets, total] = await Promise.all([
      prisma.walletAddress.findMany({
        where,
        include: {
          user: { select: { id: true, username: true, nickname: true } },
        },
        orderBy: { id: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.walletAddress.count({ where }),
    ]);

    // 통계
    const [totalWallets, assignedCount, availableCount] = await Promise.all([
      prisma.walletAddress.count(),
      prisma.walletAddress.count({ where: { is_assigned: true } }),
      prisma.walletAddress.count({ where: { is_assigned: false } }),
    ]);

    res.json(successResponse({
      wallets,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
      stats: {
        total: totalWallets,
        assigned: assignedCount,
        available: availableCount,
      },
    }));
  } catch (err) {
    console.error('List wallets error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

export default router;
