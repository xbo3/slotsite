import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { config } from './config';
import { errorResponse } from './utils';
import { securityHeaders } from './middleware/security';
import { strictLimiter, normalLimiter } from './middleware/rateLimit';

const prisma = new PrismaClient();

import authRouter from './routes/auth';
import walletRouter from './routes/wallet';
import gameRouter from './routes/game';
import adminRouter from './routes/admin';
import bonusRouter from './routes/bonus';
import couponRouter from './routes/coupon';
import userRouter from './routes/user';
import depositRouter from './routes/deposit';
import withdrawRouter from './routes/withdraw';
import gamesRouter from './routes/games';
import fingerprintRouter from './routes/fingerprint';
import bipaysRouter from './routes/bipays';
import webhookRouter from './routes/webhook';
import i18nRouter from './routes/i18n';
import partnerRouter from './routes/partner';
import pointsRouter from './routes/points';

const app = express();

// 보안 헤더
app.use(securityHeaders);

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate Limiting: 민감 API에 strict, 나머지에 normal
app.use('/api/auth/login', strictLimiter);
app.use('/api/auth/register', strictLimiter);
app.use('/api/coupons/apply', strictLimiter);
app.use('/api', normalLimiter);

// 라우터
app.use('/api/auth', authRouter);
app.use('/api/wallet', walletRouter);
app.use('/api/game', gameRouter);
app.use('/api/admin', adminRouter);
app.use('/api/bonus', bonusRouter);
app.use('/api/coupons', couponRouter);
app.use('/api/users', userRouter);
app.use('/api/deposit', depositRouter);
app.use('/api/withdraw', withdrawRouter);
app.use('/api/games', gamesRouter);
app.use('/api/fingerprint', fingerprintRouter);
app.use('/api/bipays', bipaysRouter);
app.use('/api/webhook', webhookRouter);
app.use('/api/i18n', i18nRouter);
app.use('/api/admin', partnerRouter);
app.use('/api/admin', pointsRouter);

// 헬스체크
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 핸들러
app.use((_req: Request, res: Response) => {
  res.status(404).json(errorResponse('요청한 리소스를 찾을 수 없습니다'));
});

// 에러 핸들러
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json(errorResponse('서버 내부 오류가 발생했습니다'));
});

// 서버 시작
app.listen(config.port, () => {
  console.log(`[SlotSite Backend] Server running on port ${config.port}`);
  console.log(`[SlotSite Backend] Health check: http://localhost:${config.port}/health`);

  // 입금 자동 만료 크론: 5분마다 30분 지난 PENDING 입금 요청 만료 처리
  setInterval(async () => {
    try {
      const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
      const result = await prisma.depositRequest.updateMany({
        where: { status: 'PENDING', created_at: { lt: thirtyMinAgo } },
        data: { status: 'EXPIRED' },
      });
      if (result.count > 0) {
        console.log(`[Cron] ${result.count}건의 입금 요청 만료 처리`);
      }
    } catch (err) {
      console.error('[Cron] 입금 만료 처리 오류:', err);
    }
  }, 5 * 60 * 1000);

  console.log('[SlotSite Backend] Deposit expiry cron started (every 5 min)');
});

export default app;
