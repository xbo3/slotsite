import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { successResponse, errorResponse } from '../utils';

const router = Router();
const prisma = new PrismaClient();

// ===== 유저 API =====

// GET /api/messages — 내 쪽지 목록
router.get('/', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const unreadOnly = req.query.unread_only === 'true';

    const where: any = { receiver_id: req.user!.id };
    if (unreadOnly) {
      where.is_read = false;
    }

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        where,
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        select: {
          id: true,
          title: true,
          is_read: true,
          created_at: true,
          sender: { select: { id: true, nickname: true } },
        },
      }),
      prisma.message.count({ where }),
    ]);

    res.json(successResponse({
      messages,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }));
  } catch (err) {
    console.error('Messages list error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// GET /api/messages/unread-count — 읽지 않은 쪽지 수
router.get('/unread-count', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const count = await prisma.message.count({
      where: { receiver_id: req.user!.id, is_read: false },
    });

    res.json(successResponse({ unread_count: count }));
  } catch (err) {
    console.error('Unread count error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// GET /api/messages/:id — 쪽지 상세 + 읽음 처리
router.get('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user!.id;

    const message = await prisma.message.findFirst({
      where: { id, receiver_id: userId },
      include: {
        sender: { select: { id: true, nickname: true } },
      },
    });

    if (!message) {
      res.status(404).json(errorResponse('쪽지를 찾을 수 없습니다'));
      return;
    }

    // 읽지 않았으면 읽음 처리
    if (!message.is_read) {
      await prisma.message.update({
        where: { id },
        data: { is_read: true },
      });
    }

    res.json(successResponse({ ...message, is_read: true }));
  } catch (err) {
    console.error('Message detail error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// PUT /api/messages/:id/read — 읽음 처리
router.put('/:id/read', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user!.id;

    const message = await prisma.message.findFirst({
      where: { id, receiver_id: userId },
    });

    if (!message) {
      res.status(404).json(errorResponse('쪽지를 찾을 수 없습니다'));
      return;
    }

    await prisma.message.update({
      where: { id },
      data: { is_read: true },
    });

    res.json(successResponse({ message: '읽음 처리되었습니다' }));
  } catch (err) {
    console.error('Message read error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// DELETE /api/messages/:id — 쪽지 삭제
router.delete('/:id', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user!.id;

    const message = await prisma.message.findFirst({
      where: { id, receiver_id: userId },
    });

    if (!message) {
      res.status(404).json(errorResponse('쪽지를 찾을 수 없습니다'));
      return;
    }

    await prisma.message.delete({ where: { id } });

    res.json(successResponse({ message: '쪽지가 삭제되었습니다' }));
  } catch (err) {
    console.error('Message delete error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// ===== 어드민 API =====

// POST /api/messages/admin/send — 쪽지 발송 (개별 또는 전체)
router.post('/admin/send', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { receiver_id, title, content, broadcast } = req.body;

    if (!title || !content) {
      res.status(400).json(errorResponse('제목과 내용을 입력해주세요'));
      return;
    }

    // 전체 발송
    if (broadcast) {
      const users = await prisma.user.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
      });

      const messages = await prisma.message.createMany({
        data: users.map((u) => ({
          sender_id: req.user!.id,
          receiver_id: u.id,
          title,
          content,
        })),
      });

      res.json(successResponse({ sent_count: messages.count }));
      return;
    }

    // 개별 발송
    if (!receiver_id) {
      res.status(400).json(errorResponse('receiver_id 또는 broadcast 필수'));
      return;
    }

    // 수신자 존재 확인
    const receiver = await prisma.user.findUnique({ where: { id: receiver_id } });
    if (!receiver) {
      res.status(404).json(errorResponse('수신자를 찾을 수 없습니다'));
      return;
    }

    const message = await prisma.message.create({
      data: {
        sender_id: req.user!.id,
        receiver_id,
        title,
        content,
      },
    });

    res.json(successResponse(message));
  } catch (err) {
    console.error('Admin send message error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

// GET /api/messages/admin/list — 전체 쪽지 목록
router.get('/admin/list', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const [messages, total] = await Promise.all([
      prisma.message.findMany({
        orderBy: { created_at: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
        include: {
          sender: { select: { id: true, nickname: true } },
          receiver: { select: { id: true, nickname: true, username: true } },
        },
      }),
      prisma.message.count(),
    ]);

    res.json(successResponse({
      messages,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    }));
  } catch (err) {
    console.error('Admin messages list error:', err);
    res.status(500).json(errorResponse('서버 오류'));
  }
});

export default router;
