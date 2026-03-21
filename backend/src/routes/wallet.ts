import { Router, Request, Response } from 'express';

const router = Router();

// deposit.ts와 withdraw.ts가 이미 전부 커버하므로 안내 응답만 반환
router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Use /api/deposit or /api/withdraw' });
});

export default router;
