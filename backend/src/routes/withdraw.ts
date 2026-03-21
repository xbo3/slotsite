import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient, Prisma } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { successResponse, errorResponse } from '../utils';
import { subtractBalance, addBalance } from '../services/balance';
import * as bipaysService from '../services/bipays';
import { notifyWithdraw, sendTelegramMessage } from '../services/telegram';

const router = Router();
const prisma = new PrismaClient();

const MIN_WITHDRAW = 10; // 최소 출금 10 USDT
const WITHDRAW_FEE = 1;  // 수수료 1 USDT

// ===== 유저 API =====

// POST /api/withdraw/request — 출금 요청
router.post('/request', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { to_address, amount, security_password, canvas_hash, webgl_hash } = req.body;

    if (!to_address || !amount) {
      res.status(400).json(errorResponse('to_address, amount 필수'));
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount < MIN_WITHDRAW) {
      res.status(400).json(errorResponse(`최소 출금 금액은 ${MIN_WITHDRAW} USDT입니다`));
      return;
    }

    // 2차 비밀번호 검증
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }

    if (user.security_password) {
      if (!security_password) {
        res.status(400).json(errorResponse('2차 비밀번호를 입력해주세요'));
        return;
      }
      const isValid = await bcrypt.compare(security_password, user.security_password);
      if (!isValid) {
        res.status(400).json(errorResponse('2차 비밀번호가 일치하지 않습니다'));
        return;
      }
    }

    // 핑거프린트 검증: 가입 시점의 fingerprint와 현재 비교
    let fingerprintMismatch = false;
    if (canvas_hash || webgl_hash) {
      // 유저의 최초(가입 시점 근처) fingerprint 조회
      const originalFp = await prisma.userFingerprint.findFirst({
        where: { user_id: userId },
        orderBy: { created_at: 'asc' },
      });

      if (originalFp) {
        const canvasDiff = canvas_hash && originalFp.canvas_hash && canvas_hash !== originalFp.canvas_hash;
        const webglDiff = webgl_hash && originalFp.webgl_hash && webgl_hash !== originalFp.webgl_hash;

        if (canvasDiff || webglDiff) {
          fingerprintMismatch = true;
        }
      }
    }

    if (fingerprintMismatch) {
      // 핑거프린트 불일치 → 출금 보류 + 텔레그램 알림
      const forwarded = req.headers['x-forwarded-for'];
      const reqIp = typeof forwarded === 'string'
        ? forwarded.split(',')[0].trim()
        : req.ip || 'unknown';

      sendTelegramMessage(
        `🚨 <b>출금 보류 — 기기 불일치</b>\n👤 ${user.username}\n💵 ${withdrawAmount} USDT\n📍 ${to_address}\n📱 IP: ${reqIp}\n⚠️ 가입 시점과 다른 기기 fingerprint 감지\n🔒 관리자 수동 승인 필요`
      );

      // 잔액 차감은 하되 PENDING 상태로 — 관리자가 수동 승인/거절
      const totalDeduct = withdrawAmount + WITHDRAW_FEE;
      if (user.balance.lt(new Prisma.Decimal(totalDeduct.toString()))) {
        res.status(400).json(errorResponse(`잔액이 부족합니다 (필요: ${totalDeduct} USDT, 보유: ${user.balance})`));
        return;
      }
      await subtractBalance(userId, totalDeduct, 'WITHDRAW', `출금 요청 — 기기 불일치 보류 (${to_address})`);

      const withdraw = await prisma.withdrawRequest.create({
        data: {
          user_id: userId,
          to_address: to_address.trim(),
          amount: new Prisma.Decimal(withdrawAmount.toString()),
          fee: new Prisma.Decimal(WITHDRAW_FEE.toString()),
          net_amount: new Prisma.Decimal(withdrawAmount.toString()),
          admin_memo: '기기 fingerprint 불일치 — 수동 승인 필요',
        },
      });

      res.status(201).json(successResponse({
        withdraw,
        message: '출금 요청이 접수되었습니다. 보안 검증을 위해 관리자 확인 후 처리됩니다.',
        security_hold: true,
      }));
      return;
    }

    const totalDeduct = withdrawAmount + WITHDRAW_FEE;
    const netAmount = withdrawAmount;

    // 잔액 확인
    if (user.balance.lt(new Prisma.Decimal(totalDeduct.toString()))) {
      res.status(400).json(errorResponse(`잔액이 부족합니다 (필요: ${totalDeduct} USDT, 보유: ${user.balance})`));
      return;
    }

    // 잔액 즉시 차감
    await subtractBalance(userId, totalDeduct, 'WITHDRAW', `출금 요청 (${to_address})`);

    // 출금 요청 생성
    const withdraw = await prisma.withdrawRequest.create({
      data: {
        user_id: userId,
        to_address: to_address.trim(),
        amount: new Prisma.Decimal(withdrawAmount.toString()),
        fee: new Prisma.Decimal(WITHDRAW_FEE.toString()),
        net_amount: new Prisma.Decimal(netAmount.toString()),
      },
    });

    res.status(201).json(successResponse({
      withdraw,
      message: '출금 요청이 접수되었습니다. 관리자 승인 후 처리됩니다',
    }));
  } catch (err: any) {
    if (err.message === '잔액 부족') {
      res.status(400).json(errorResponse('잔액이 부족합니다'));
      return;
    }
    console.error('Withdraw request error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /api/withdraw/history — 내 출금 내역
router.get('/history', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const status = req.query.status as string;

    const where: any = { user_id: userId };
    if (status) where.status = status;

    const [withdrawals, total] = await Promise.all([
      prisma.withdrawRequest.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.withdrawRequest.count({ where }),
    ]);

    res.json(successResponse({
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    }));
  } catch (err) {
    console.error('Withdraw history error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// ===== 관리자 API =====

// PUT /api/withdraw/admin/:id/approve — 출금 승인
router.put('/admin/:id/approve', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { tx_hash } = req.body;

    const withdraw = await prisma.withdrawRequest.findUnique({ where: { id } });
    if (!withdraw) {
      res.status(404).json(errorResponse('출금 요청을 찾을 수 없습니다'));
      return;
    }

    if (withdraw.status !== 'PENDING') {
      res.status(400).json(errorResponse(`이미 처리된 요청입니다 (상태: ${withdraw.status})`));
      return;
    }

    // BiPays 연동: 승인 시 자동 출금 실행
    let bipaysResult = null;
    let newStatus: 'APPROVED' | 'PROCESSING' = 'APPROVED';

    if (bipaysService.isConfigured()) {
      try {
        // 유저의 bipays_member_id로 회원 출금
        const user = await prisma.user.findUnique({ where: { id: withdraw.user_id } });
        if (user?.bipays_member_id) {
          bipaysResult = await bipaysService.requestMemberWithdraw(
            user.bipays_member_id,
            withdraw.to_address,
            Number(withdraw.net_amount)
          );
          newStatus = 'PROCESSING'; // BiPays가 처리 중
          console.log(`[Withdraw] BiPays 출금 요청: user=${user.username}, amount=${withdraw.net_amount}, address=${withdraw.to_address}`);
        }
      } catch (bipaysErr: any) {
        console.error('[Withdraw] BiPays 출금 실패 (수동 처리 필요):', bipaysErr.message);
        // BiPays 실패해도 APPROVED 상태로 — 관리자가 수동 처리
      }
    }

    const updated = await prisma.withdrawRequest.update({
      where: { id },
      data: {
        status: newStatus,
        tx_hash: bipaysResult?.data?.tx_hash || tx_hash || null,
        reviewed_by: req.user!.id,
        reviewed_at: new Date(),
      },
    });

    // 텔레그램 알림
    const approveUser = await prisma.user.findUnique({ where: { id: withdraw.user_id }, select: { username: true } });
    if (approveUser) {
      notifyWithdraw(approveUser.username, Number(withdraw.net_amount), bipaysResult ? 'PROCESSING' : 'APPROVED');
    }

    res.json(successResponse({
      withdraw: updated,
      bipays: bipaysResult ? 'auto' : 'manual',
      message: bipaysResult ? '출금이 승인되었습니다 (BiPays 자동 처리 중)' : '출금이 승인되었습니다',
    }));
  } catch (err) {
    console.error('Withdraw approve error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// PUT /api/withdraw/admin/:id/reject — 출금 거절 (잔액 복구)
router.put('/admin/:id/reject', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { admin_memo } = req.body;

    if (!admin_memo) {
      res.status(400).json(errorResponse('거절 사유(admin_memo) 필수'));
      return;
    }

    const withdraw = await prisma.withdrawRequest.findUnique({ where: { id } });
    if (!withdraw) {
      res.status(404).json(errorResponse('출금 요청을 찾을 수 없습니다'));
      return;
    }

    if (withdraw.status !== 'PENDING' && withdraw.status !== 'APPROVED') {
      res.status(400).json(errorResponse(`이미 처리된 요청입니다 (상태: ${withdraw.status})`));
      return;
    }

    // 잔액 복구 (출금액 + 수수료)
    const refundAmount = withdraw.amount.add(withdraw.fee);
    await addBalance(withdraw.user_id, refundAmount, 'DEPOSIT', `출금 거절 환불 (요청 #${id})`);

    const updated = await prisma.withdrawRequest.update({
      where: { id },
      data: {
        status: 'REJECTED',
        admin_memo,
        reviewed_by: req.user!.id,
        reviewed_at: new Date(),
      },
    });

    res.json(successResponse({
      withdraw: updated,
      refunded: refundAmount,
      message: '출금이 거절되었습니다. 잔액이 복구되었습니다',
    }));
  } catch (err) {
    console.error('Withdraw reject error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// PUT /api/withdraw/admin/:id/complete — 출금 완료
router.put('/admin/:id/complete', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const { tx_hash } = req.body;

    const withdraw = await prisma.withdrawRequest.findUnique({ where: { id } });
    if (!withdraw) {
      res.status(404).json(errorResponse('출금 요청을 찾을 수 없습니다'));
      return;
    }

    if (withdraw.status !== 'APPROVED' && withdraw.status !== 'PROCESSING') {
      res.status(400).json(errorResponse(`완료 처리할 수 없는 상태입니다 (상태: ${withdraw.status})`));
      return;
    }

    const updated = await prisma.withdrawRequest.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        tx_hash: tx_hash || withdraw.tx_hash,
        reviewed_by: req.user!.id,
        reviewed_at: new Date(),
      },
    });

    res.json(successResponse({
      withdraw: updated,
      message: '출금이 완료 처리되었습니다',
    }));
  } catch (err) {
    console.error('Withdraw complete error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /api/withdraw/admin/list — 전체 출금 목록
router.get('/admin/list', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const status = req.query.status as string;

    const where: any = {};
    if (status) where.status = status;

    const [withdrawals, total, pendingCount] = await Promise.all([
      prisma.withdrawRequest.findMany({
        where,
        include: {
          user: { select: { id: true, username: true, nickname: true } },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.withdrawRequest.count({ where }),
      prisma.withdrawRequest.count({ where: { status: 'PENDING' } }),
    ]);

    res.json(successResponse({
      withdrawals,
      pending_count: pendingCount,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    }));
  } catch (err) {
    console.error('Withdraw list error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

export default router;
