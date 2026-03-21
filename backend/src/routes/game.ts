import { Router, Request, Response } from 'express';

const router = Router();

// games.ts가 이미 전부 커버하므로 안내 응답만 반환
router.get('/', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Use /api/games' });
});

export default router;
