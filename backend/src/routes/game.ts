import { Router, Request, Response } from 'express';
import { successResponse } from '../utils';

const router = Router();

// /api/game/* → /api/games 안내
// games.ts가 게임 목록/상세/카테고리/프로바이더 전부 처리
router.get('/', (_req: Request, res: Response) => {
  res.json(successResponse({
    message: 'Use /api/games for game-related APIs',
    endpoints: {
      list: 'GET /api/games',
      detail: 'GET /api/games/:id',
      categories: 'GET /api/games/categories',
      providers: 'GET /api/games/providers',
      launch: 'POST /api/games/:id/launch',
    },
  }));
});

export default router;
