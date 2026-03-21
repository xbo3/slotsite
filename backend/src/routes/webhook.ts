import { Router, Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { addBalance } from '../services/balance';
import * as bipaysService from '../services/bipays';
import { notifyDeposit, notifyWithdraw } from '../services/telegram';

const router = Router();
const prisma = new PrismaClient();

/**
 * 입금 시 auto_apply_on_deposit = true인 BonusTemplate 자동 적용
 * - 활성 보너스가 이미 있으면 스킵
 * - min_deposit_amount 조건 확인
 * - priority 높은 템플릿 우선 적용 (1개만)
 */
async function autoApplyDepositBonus(userId: number, depositAmount: Prisma.Decimal): Promise<void> {
  try {
    // 이미 활성 보너스가 있으면 스킵
    const activeBonus = await prisma.userBonus.findFirst({
      where: { user_id: userId, status: 'ACTIVE' },
    });
    if (activeBonus) return;

    // auto_apply_on_deposit = true인 활성 템플릿 조회 (priority 높은 순)
    const templates = await prisma.bonusTemplate.findMany({
      where: {
        status: 'ACTIVE',
        auto_apply_on_deposit: true,
      },
      orderBy: { priority: 'desc' },
    });

    for (const template of templates) {
      // 최소 입금액 조건 확인
      if (template.min_deposit_amount && depositAmount.lt(template.min_deposit_amount)) {
        continue;
      }

      // 기존 min_deposit/max_deposit 조건도 확인
      if (template.min_deposit.gt(0) && depositAmount.lt(template.min_deposit)) {
        continue;
      }
      if (template.max_deposit.gt(0) && depositAmount.gt(template.max_deposit)) {
        continue;
      }

      // 일일/총 사용 횟수 체크
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
      if (template.loan_percent && template.loan_percent > 0) {
        // 대출 보너스
        bonusAmount = depositAmount.mul(template.loan_percent).div(100);
      } else {
        // 일반 보너스
        bonusAmount = depositAmount.mul(template.bonus_percent).div(100);
        if (template.max_bonus.gt(0) && bonusAmount.gt(template.max_bonus)) {
          bonusAmount = template.max_bonus;
        }
      }

      const isLoan = !!(template.loan_percent && template.loan_percent > 0);

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

      // 만료일
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + template.validity_days);

      // 최대 전환액
      let maxConversion: Prisma.Decimal;
      if (template.max_conversion_amount) {
        maxConversion = template.max_conversion_amount;
      } else if (template.max_conversion.gt(0)) {
        maxConversion = template.max_conversion;
      } else {
        maxConversion = new Prisma.Decimal(999999999);
      }

      // 트랜잭션으로 생성
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

      console.log(`[AutoBonus] user=${userId}, template=${template.name}, bonus=${bonusAmount}, loan=${isLoan}`);
      break; // 1개만 적용
    }
  } catch (err) {
    console.error('[AutoBonus] Error:', err);
    // 보너스 자동 지급 실패해도 입금 처리는 정상 진행
  }
}

// POST /api/webhook/bipays — BiPays 웹훅 수신 (서명 검증)
router.post('/bipays', async (req: Request, res: Response): Promise<void> => {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    const body = req.body;

    // 서명 검증
    if (signature && !bipaysService.verifyWebhookSignature(body, signature)) {
      console.error('[Webhook] 서명 검증 실패');
      res.status(403).json({ success: false, error: 'Invalid signature' });
      return;
    }

    const { event, data } = body;
    console.log(`[Webhook] event=${event}`, JSON.stringify(data || body).substring(0, 200));

    // BiPays는 event 없이 flat하게 보낼 수도 있음 — 호환 처리
    const eventType = event || body.event_type || (body.member_id && body.amount ? 'deposit' : 'unknown');
    const eventData = data || body;

    switch (eventType) {
      case 'deposit':
      case 'deposit.confirmed': {
        const { member_id, username, amount, tx_hash, txid } = eventData;
        const txHash = tx_hash || txid;

        if (!member_id || !amount) {
          console.error('[Webhook] deposit: member_id or amount missing');
          res.json({ success: true, message: 'Missing data, skipped' });
          return;
        }

        // 유저 찾기
        const user = await prisma.user.findFirst({
          where: { bipays_member_id: member_id },
        });

        if (!user) {
          console.error(`[Webhook] User not found: bipays_member_id=${member_id}`);
          res.json({ success: true, message: 'User not found, skipped' });
          return;
        }

        // 중복 입금 방지 (같은 txHash)
        if (txHash) {
          const dup = await prisma.depositRequest.findFirst({ where: { tx_hash: txHash } });
          if (dup) {
            console.log(`[Webhook] Duplicate tx_hash=${txHash}, skipped`);
            res.json({ success: true, message: 'Already processed' });
            return;
          }
        }

        const depositAmount = new Prisma.Decimal(amount.toString());

        // DepositRequest 생성 + 즉시 확인
        await prisma.depositRequest.create({
          data: {
            user_id: user.id,
            wallet_address: `bipays:${member_id}`,
            actual_amount: depositAmount,
            status: 'CONFIRMED',
            confirmed_at: new Date(),
            tx_hash: txHash || null,
            expires_at: new Date(Date.now() + 30 * 60 * 1000),
          },
        });

        // 잔액 증가
        await addBalance(user.id, depositAmount, 'DEPOSIT', `BiPays 입금 (tx: ${txHash || 'N/A'})`);

        // 입금 보너스 자동 지급
        await autoApplyDepositBonus(user.id, depositAmount);

        console.log(`[Webhook] Deposit confirmed: user=${user.username}, amount=${amount} USDT, tx=${txHash}`);

        // 텔레그램 알림
        notifyDeposit(user.username, Number(depositAmount), 'BiPays USDT');

        res.json({ success: true, message: 'Deposit processed' });
        return;
      }

      case 'deposit.pending': {
        console.log(`[Webhook] Deposit pending:`, eventData);
        res.json({ success: true, message: 'Pending noted' });
        return;
      }

      case 'withdraw.completed': {
        const { tx_hash, txid, withdrawal_id } = eventData;
        const txHash = tx_hash || txid;

        if (withdrawal_id || txHash) {
          // tx_hash로 WithdrawRequest 찾아서 COMPLETED
          const withdraw = await prisma.withdrawRequest.findFirst({
            where: txHash ? { tx_hash: txHash } : { id: withdrawal_id },
          });

          if (withdraw && withdraw.status !== 'COMPLETED') {
            await prisma.withdrawRequest.update({
              where: { id: withdraw.id },
              data: { status: 'COMPLETED', tx_hash: txHash || withdraw.tx_hash },
            });
            console.log(`[Webhook] Withdraw completed: id=${withdraw.id}, tx=${txHash}`);

            // 텔레그램 알림
            const wUser = await prisma.user.findUnique({ where: { id: withdraw.user_id }, select: { username: true } });
            if (wUser) {
              notifyWithdraw(wUser.username, Number(withdraw.net_amount), 'COMPLETED');
            }
          }
        }

        res.json({ success: true, message: 'Withdraw completed' });
        return;
      }

      case 'withdraw.failed': {
        const { withdrawal_id, tx_hash, amount, fee } = eventData;

        if (withdrawal_id) {
          const withdraw = await prisma.withdrawRequest.findUnique({ where: { id: withdrawal_id } });
          if (withdraw && withdraw.status !== 'COMPLETED' && withdraw.status !== 'REJECTED') {
            // 상태 REJECTED로 변경
            await prisma.withdrawRequest.update({
              where: { id: withdraw.id },
              data: { status: 'REJECTED', admin_memo: 'BiPays 출금 실패' },
            });

            // 잔액 복구 (출금액 + 수수료)
            const refundAmount = withdraw.amount.add(withdraw.fee);
            await addBalance(withdraw.user_id, refundAmount, 'DEPOSIT', `출금 실패 환불 (요청 #${withdraw.id})`);

            console.log(`[Webhook] Withdraw failed, refunded: id=${withdraw.id}, amount=${refundAmount}`);
          }
        }

        res.json({ success: true, message: 'Withdraw failure handled' });
        return;
      }

      default:
        console.log(`[Webhook] Unknown event: ${eventType}`);
        res.json({ success: true, message: `Event ${eventType} received` });
        return;
    }
  } catch (err) {
    console.error('[Webhook] Error:', err);
    // 항상 200 반환 (BiPays 재시도 방지)
    res.json({ success: false, error: 'Internal error' });
  }
});

export default router;
