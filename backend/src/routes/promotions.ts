import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { successResponse, errorResponse } from '../utils';

const router = Router();
const prisma = new PrismaClient();

// ===== 공개 API =====

// GET /api/promotions — 활성 프로모션 목록 (인증 불필요)
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const type = req.query.type as string;

    const where: any = {
      is_active: true,
      starts_at: { lte: new Date() },
      OR: [
        { ends_at: null },
        { ends_at: { gte: new Date() } },
      ],
    };

    if (type) {
      where.type = type;
    }

    const promotions = await prisma.promotion.findMany({
      where,
      orderBy: { sort_order: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        type: true,
        likes: true,
        starts_at: true,
        ends_at: true,
        sort_order: true,
        cta_text: true,
        cta_link: true,
      },
    });

    res.json(successResponse(promotions));
  } catch (err) {
    console.error('Promotions list error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// GET /api/promotions/:id — 프로모션 상세
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    // admin 라우트 경로 충돌 방지
    if (isNaN(id)) {
      res.status(400).json(errorResponse('잘못된 프로모션 ID'));
      return;
    }

    const promotion = await prisma.promotion.findUnique({ where: { id } });

    if (!promotion) {
      res.status(404).json(errorResponse('프로모션을 찾을 수 없습니다'));
      return;
    }

    res.json(successResponse(promotion));
  } catch (err) {
    console.error('Promotion detail error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// POST /api/promotions/:id/like — 좋아요 (인증 필요)
router.post('/:id/like', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    const promotion = await prisma.promotion.findUnique({ where: { id } });
    if (!promotion) {
      res.status(404).json(errorResponse('프로모션을 찾을 수 없습니다'));
      return;
    }

    const updated = await prisma.promotion.update({
      where: { id },
      data: { likes: { increment: 1 } },
    });

    res.json(successResponse({ likes: updated.likes }));
  } catch (err) {
    console.error('Promotion like error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// ===== 어드민 API =====

// POST /api/promotions/admin — 프로모션 생성
router.post('/admin', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title, description, image, type, starts_at, ends_at,
      is_active, sort_order, details, cta_text, cta_link,
    } = req.body;

    if (!title) {
      res.status(400).json(errorResponse('제목을 입력해주세요'));
      return;
    }

    const promotion = await prisma.promotion.create({
      data: {
        title,
        description: description || null,
        image: image || null,
        type: type || 'general',
        starts_at: starts_at ? new Date(starts_at) : new Date(),
        ends_at: ends_at ? new Date(ends_at) : null,
        is_active: is_active !== undefined ? is_active : true,
        sort_order: sort_order || 0,
        details: details || null,
        cta_text: cta_text || null,
        cta_link: cta_link || null,
      },
    });

    res.status(201).json(successResponse(promotion));
  } catch (err) {
    console.error('Create promotion error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// PUT /api/promotions/admin/:id — 프로모션 수정
router.put('/admin/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    const promotion = await prisma.promotion.findUnique({ where: { id } });
    if (!promotion) {
      res.status(404).json(errorResponse('프로모션을 찾을 수 없습니다'));
      return;
    }

    const data: any = { ...req.body };
    if (data.starts_at) data.starts_at = new Date(data.starts_at);
    if (data.ends_at) data.ends_at = new Date(data.ends_at);

    const updated = await prisma.promotion.update({
      where: { id },
      data,
    });

    res.json(successResponse(updated));
  } catch (err) {
    console.error('Update promotion error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// DELETE /api/promotions/admin/:id — 프로모션 삭제
router.delete('/admin/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);

    const promotion = await prisma.promotion.findUnique({ where: { id } });
    if (!promotion) {
      res.status(404).json(errorResponse('프로모션을 찾을 수 없습니다'));
      return;
    }

    await prisma.promotion.delete({ where: { id } });

    res.json(successResponse({ message: '프로모션이 삭제되었습니다' }));
  } catch (err) {
    console.error('Delete promotion error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// GET /api/promotions/admin/list — 전체 프로모션 (비활성 포함)
router.get('/admin/list', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [promotions, total] = await Promise.all([
      prisma.promotion.findMany({
        orderBy: [{ sort_order: 'asc' }, { created_at: 'desc' }],
        take: limit,
        skip: (page - 1) * limit,
      }),
      prisma.promotion.count(),
    ]);

    res.json(successResponse({
      promotions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }));
  } catch (err) {
    console.error('Admin promotions list error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

export default router;
