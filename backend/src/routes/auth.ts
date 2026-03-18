import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config';
import { authMiddleware } from '../middleware/auth';
import { successResponse, errorResponse } from '../utils';

const router = Router();
const prisma = new PrismaClient();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, nickname, phone } = req.body;

    if (!username || !password || !nickname) {
      res.status(400).json(errorResponse('username, password, nickname은 필수입니다'));
      return;
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      res.status(400).json(errorResponse('이미 존재하는 아이디입니다'));
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        nickname,
        phone: phone || null,
      },
    });

    res.status(201).json(successResponse({
      id: user.id,
      username: user.username,
      nickname: user.nickname,
    }));
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json(errorResponse('아이디와 비밀번호를 입력해주세요'));
      return;
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      res.status(401).json(errorResponse('아이디 또는 비밀번호가 일치하지 않습니다'));
      return;
    }

    if (user.status === 'BLOCKED') {
      res.status(403).json(errorResponse('차단된 계정입니다'));
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json(errorResponse('아이디 또는 비밀번호가 일치하지 않습니다'));
      return;
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn as jwt.SignOptions['expiresIn'] }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    // 로그인 기록 저장
    await prisma.loginLog.create({
      data: {
        user_id: user.id,
        ip_address: req.ip || req.headers['x-forwarded-for'] as string || 'unknown',
        user_agent: req.headers['user-agent'] || null,
        device: /Mobile|Android|iPhone/i.test(req.headers['user-agent'] || '') ? 'Mobile' : 'PC',
      },
    });

    res.json(successResponse({
      token,
      user: {
        id: user.id,
        username: user.username,
        nickname: user.nickname,
        role: user.role,
        balance: user.balance,
        bonus_balance: user.bonus_balance,
      },
    }));
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response): void => {
  res.json(successResponse({ message: '로그아웃 되었습니다' }));
});

// GET /api/auth/me
router.get('/me', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        username: true,
        nickname: true,
        phone: true,
        role: true,
        status: true,
        balance: true,
        bonus_balance: true,
        created_at: true,
        last_login: true,
      },
    });

    if (!user) {
      res.status(404).json(errorResponse('유저를 찾을 수 없습니다'));
      return;
    }

    res.json(successResponse(user));
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json(errorResponse('서버 오류가 발생했습니다'));
  }
});

export default router;
