import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { successResponse, errorResponse } from '../utils';
import { addBalance } from '../services/balance';
import * as bipaysService from '../services/bipays';

const router = Router();
const prisma = new PrismaClient();

// ===== 콜백 (BiPays → SlotSite) =====

// POST /api/bipays/callback — BiPays 입금 웹훅 수신
router.post('/callback', async (req: Request, res: Response): Promise<void> => {
  try {
    const { event, member_id, username, amount, tx_hash, timestamp } = req.body;

    console.log(`[BiPays Callback] event=${event}, member_id=${member_id}, username=${username}, amount=${amount}, tx_hash=${tx_hash}`);

    if (event === 'deposit') {
      if (!member_id || !amount) {
        res.status(400).json({ success: false, error: 'member_id and amount required' });
        return;
      }

      // member_id로 슬롯사이트 유저 찾기 (bipays_member_id 필드)
      const user = await prisma.user.findFirst({
        where: { bipays_member_id: member_id },
      });

      if (!user) {
        console.error(`[BiPays Callback] User not found for member_id=${member_id}`);
        // 200 리턴해서 bipays가 재시도 안 하게
        res.json({ success: true, message: 'User not found, skipped' });
        return;
      }

      // 중복 입금 방지 (같은 tx_hash 확인)
      if (tx_hash) {
        const existing = await prisma.depositRequest.findFirst({
          where: { tx_hash },
        });
        if (existing) {
          console.log(`[BiPays Callback] Duplicate tx_hash=${tx_hash}, skipped`);
          res.json({ success: true, message: 'Already processed' });
          return;
        }
      }

      const depositAmount = new Prisma.Decimal(amount.toString());

      // 입금 요청 레코드 생성 + 즉시 확인
      await prisma.depositRequest.create({
        data: {
          user_id: user.id,
          wallet_address: `bipays:${member_id}`,
          actual_amount: depositAmount,
          status: 'CONFIRMED',
          confirmed_at: new Date(),
          tx_hash: tx_hash || null,
          expires_at: new Date(Date.now() + 30 * 60 * 1000),
        },
      });

      // 유저 잔액 증가
      await addBalance(user.id, depositAmount, 'DEPOSIT', `BiPays 입금 (tx: ${tx_hash || 'N/A'})`);

      console.log(`[BiPays Callback] Deposit confirmed: user=${user.username}, amount=${amount} USDT`);

      res.json({ success: true, message: 'Deposit processed' });
    } else {
      // 알 수 없는 이벤트도 200 리턴
      console.log(`[BiPays Callback] Unknown event: ${event}`);
      res.json({ success: true, message: `Event ${event} received` });
    }
  } catch (err) {
    console.error('[BiPays Callback] Error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ===== 유저 API (BiPays 연동) =====

// POST /api/bipays/register — 유저를 BiPays에 회원 등록 (입금 주소 발급)
router.post('/register', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }

    // 이미 등록된 유저인지 확인
    if (user.bipays_member_id) {
      // 이미 등록됨 → 기존 주소 반환
      res.json(successResponse({
        member_id: user.bipays_member_id,
        deposit_address: user.bipays_deposit_address,
        message: '이미 등록된 입금 주소가 있습니다',
      }));
      return;
    }

    // BiPays에 회원 등록
    const result = await bipaysService.registerMember(userId, user.username, user.nickname);
    const { deposit_address, member_id } = result.data;

    // 유저 DB에 bipays 정보 저장
    await prisma.user.update({
      where: { id: userId },
      data: {
        bipays_member_id: member_id,
        bipays_deposit_address: deposit_address,
      },
    });

    res.json(successResponse({
      member_id,
      deposit_address,
      message: 'USDT 입금 주소가 발급되었습니다',
    }));
  } catch (err: any) {
    console.error('[BiPays Register] Error:', err);
    res.status(500).json(errorResponse(err.message || '서버 오류가 발생했습니다'));
  }
});

// GET /api/bipays/deposit-address — 내 입금 주소 조회
router.get('/deposit-address', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { bipays_member_id: true, bipays_deposit_address: true },
    });

    if (!user || !user.bipays_deposit_address) {
      res.status(404).json(errorResponse('입금 주소가 없습니다. 먼저 등록해주세요'));
      return;
    }

    res.json(successResponse({
      member_id: user.bipays_member_id,
      deposit_address: user.bipays_deposit_address,
    }));
  } catch (err) {
    console.error('[BiPays Deposit Address] Error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /api/bipays/deposits — 내 BiPays 입금 내역
router.get('/deposits', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { bipays_member_id: true },
    });

    if (!user?.bipays_member_id) {
      res.json(successResponse({ deposits: [] }));
      return;
    }

    const result = await bipaysService.getDeposits(user.bipays_member_id);
    res.json(successResponse({ deposits: result.data }));
  } catch (err) {
    console.error('[BiPays Deposits] Error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// ===== 관리자 API =====

// GET /api/bipays/admin/balance — BiPays 업체 잔액 조회
router.get('/admin/balance', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await bipaysService.getBalance();
    res.json(successResponse(result.data));
  } catch (err) {
    console.error('[BiPays Admin Balance] Error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /api/bipays/admin/members — BiPays 등록 회원 목록
router.get('/admin/members', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    const result = await bipaysService.getMembers(limit, offset);
    res.json(successResponse(result.data));
  } catch (err) {
    console.error('[BiPays Admin Members] Error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /api/bipays/admin/deposits — 전체 입금 내역
router.get('/admin/deposits', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const result = await bipaysService.getDeposits(undefined, limit);
    res.json(successResponse(result.data));
  } catch (err) {
    console.error('[BiPays Admin Deposits] Error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// GET /api/bipays/admin/withdrawals — 출금 내역
router.get('/admin/withdrawals', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const status = req.query.status as string;
    const limit = parseInt(req.query.limit as string) || 50;
    const result = await bipaysService.getWithdrawals(status, limit);
    res.json(successResponse(result.data));
  } catch (err) {
    console.error('[BiPays Admin Withdrawals] Error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

export default router;
