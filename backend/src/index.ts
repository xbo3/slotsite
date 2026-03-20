import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { config } from './config';
import { errorResponse } from './utils';

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

const app = express();

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
});

export default app;
