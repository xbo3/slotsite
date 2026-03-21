import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware } from '../middleware/auth';
import { adminMiddleware } from '../middleware/admin';
import { successResponse, errorResponse } from '../utils';
import { parseUserAgent } from '../utils/uaParser';
import crypto from 'crypto';

const router = Router();
const prisma = new PrismaClient();

// ===== POST /api/fingerprint — 핑거프린트 수집 (인증 불필요) =====
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;

    // IP 추출
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.ip || 'unknown';

    // UA 파싱
    const rawUA = req.headers['user-agent'] || '';
    const parsed = parseUserAgent(rawUA);

    // JWT에서 user_id 추출 (있으면)
    let userId: number | null = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const jwt = await import('jsonwebtoken');
        const { config } = await import('../config');
        const token = authHeader.split(' ')[1];
        const decoded = jwt.default.verify(token, config.jwt.secret) as any;
        userId = decoded.id || null;
      } catch (e) {
        // 토큰 만료/무효 — 무시, 비로그인으로 처리
      }
    }

    // body에서 user_id가 넘어오면 JWT 결과를 우선
    if (body.user_id && !userId) {
      // 프론트에서 user_id 보내도 JWT 없으면 무시 (보안)
    }

    // session_id: 비로그인이면 생성
    let sessionId = body.session_id || null;
    if (!userId && !sessionId) {
      sessionId = crypto.randomUUID();
    }

    // 중복 체크: 같은 user_id + canvas_hash 조합이 최근 1시간 내 있으면 update
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    let existing = null;

    if (userId && body.canvas_hash) {
      existing = await prisma.userFingerprint.findFirst({
        where: {
          user_id: userId,
          canvas_hash: body.canvas_hash,
          created_at: { gte: oneHourAgo },
        },
        orderBy: { created_at: 'desc' },
      });
    } else if (sessionId && body.canvas_hash) {
      existing = await prisma.userFingerprint.findFirst({
        where: {
          session_id: sessionId,
          canvas_hash: body.canvas_hash,
          created_at: { gte: oneHourAgo },
        },
        orderBy: { created_at: 'desc' },
      });
    }

    const fingerprintData = {
      user_id: userId,
      session_id: sessionId,

      // 네트워크
      ip_address: ip,
      country: body.country || null,
      region: body.region || null,
      city: body.city || null,
      isp: body.isp || null,

      // 브라우저/OS (서버 파싱 결과 사용, 프론트 값은 fallback)
      user_agent: rawUA || null,
      browser: parsed.browser,
      browser_version: parsed.browser_version,
      os: parsed.os,
      os_version: parsed.os_version,
      device_type: parsed.device_type,
      device_model: parsed.device_model || body.device_model || null,

      // 화면
      screen_width: body.screen_width ? parseInt(body.screen_width) : null,
      screen_height: body.screen_height ? parseInt(body.screen_height) : null,
      viewport_width: body.viewport_width ? parseInt(body.viewport_width) : null,
      viewport_height: body.viewport_height ? parseInt(body.viewport_height) : null,
      pixel_ratio: body.pixel_ratio ? parseFloat(body.pixel_ratio) : null,
      color_depth: body.color_depth ? parseInt(body.color_depth) : null,

      // 시스템
      language: body.language || null,
      languages: body.languages || null,
      timezone: body.timezone || null,
      timezone_offset: body.timezone_offset != null ? parseInt(body.timezone_offset) : null,
      platform: body.platform || null,

      // 하드웨어
      cpu_cores: body.cpu_cores ? parseInt(body.cpu_cores) : null,
      memory_gb: body.memory_gb ? parseFloat(body.memory_gb) : null,
      touch_support: body.touch_support != null ? Boolean(body.touch_support) : null,
      max_touch: body.max_touch ? parseInt(body.max_touch) : null,

      // 네트워크 상세
      connection_type: body.connection_type || null,
      downlink: body.downlink ? parseFloat(body.downlink) : null,

      // 핑거프린트
      canvas_hash: body.canvas_hash || null,
      webgl_hash: body.webgl_hash || null,
      audio_hash: body.audio_hash || null,
      font_hash: body.font_hash || null,

      // 브라우저 기능
      cookies_enabled: body.cookies_enabled != null ? Boolean(body.cookies_enabled) : null,
      do_not_track: body.do_not_track != null ? Boolean(body.do_not_track) : null,
      adblock: body.adblock != null ? Boolean(body.adblock) : null,
      webgl_vendor: body.webgl_vendor || null,
      webgl_renderer: body.webgl_renderer || null,

      // 방문 정보
      referrer: body.referrer || null,
      landing_page: body.landing_page || null,
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,

      // 배터리
      battery_level: body.battery_level != null ? parseFloat(body.battery_level) : null,
      battery_charging: body.battery_charging != null ? Boolean(body.battery_charging) : null,
    };

    let fingerprint;
    if (existing) {
      fingerprint = await prisma.userFingerprint.update({
        where: { id: existing.id },
        data: {
          ...fingerprintData,
          visit_count: existing.visit_count + 1,
          page_views: (existing.page_views || 0) + 1,
        },
      });
    } else {
      fingerprint = await prisma.userFingerprint.create({
        data: {
          ...fingerprintData,
          visit_count: 1,
          page_views: 1,
        },
      });
    }

    res.json(successResponse({
      id: fingerprint.id,
      session_id: fingerprint.session_id,
    }));
  } catch (err) {
    console.error('Fingerprint collect error:', err);
    res.status(500).json(errorResponse('핑거프린트 수집 중 오류가 발생했습니다'));
  }
});

// ===== 관리자 API =====

// GET /api/fingerprint/admin/list — 전체 핑거프린트 목록
router.get('/admin/list', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    // 필터
    const where: any = {};
    if (req.query.user_id) where.user_id = parseInt(req.query.user_id as string);
    if (req.query.ip) where.ip_address = req.query.ip as string;
    if (req.query.device_type) where.device_type = req.query.device_type as string;

    if (req.query.from || req.query.to) {
      where.created_at = {};
      if (req.query.from) where.created_at.gte = new Date(req.query.from as string);
      if (req.query.to) where.created_at.lte = new Date(req.query.to as string);
    }

    const [fingerprints, total] = await Promise.all([
      prisma.userFingerprint.findMany({
        where,
        include: {
          user: {
            select: { id: true, username: true, nickname: true },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.userFingerprint.count({ where }),
    ]);

    res.json(successResponse({
      fingerprints,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.ceil(total / limit),
      },
    }));
  } catch (err) {
    console.error('Admin fingerprints list error:', err);
    res.status(500).json(errorResponse('핑거프린트 목록 조회 실패'));
  }
});

// GET /api/fingerprint/admin/duplicates — 다중 계정 탐지
router.get('/admin/duplicates', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    // canvas_hash가 같은데 user_id가 다른 케이스 찾기
    const canvasDuplicates = await prisma.$queryRaw`
      SELECT canvas_hash, COUNT(DISTINCT user_id) as user_count,
             array_agg(DISTINCT user_id) as user_ids
      FROM "UserFingerprint"
      WHERE canvas_hash IS NOT NULL AND user_id IS NOT NULL
      GROUP BY canvas_hash
      HAVING COUNT(DISTINCT user_id) > 1
      ORDER BY user_count DESC
      LIMIT 100
    ` as any[];

    // webgl_hash가 같은데 user_id가 다른 케이스
    const webglDuplicates = await prisma.$queryRaw`
      SELECT webgl_hash, COUNT(DISTINCT user_id) as user_count,
             array_agg(DISTINCT user_id) as user_ids
      FROM "UserFingerprint"
      WHERE webgl_hash IS NOT NULL AND user_id IS NOT NULL
      GROUP BY webgl_hash
      HAVING COUNT(DISTINCT user_id) > 1
      ORDER BY user_count DESC
      LIMIT 100
    ` as any[];

    // IP가 같은데 user_id가 다른 케이스
    const ipDuplicates = await prisma.$queryRaw`
      SELECT ip_address, COUNT(DISTINCT user_id) as user_count,
             array_agg(DISTINCT user_id) as user_ids
      FROM "UserFingerprint"
      WHERE ip_address IS NOT NULL AND user_id IS NOT NULL
      GROUP BY ip_address
      HAVING COUNT(DISTINCT user_id) > 1
      ORDER BY user_count DESC
      LIMIT 100
    ` as any[];

    // user_ids에 해당하는 유저 정보 모으기
    const allUserIds = new Set<number>();
    [...canvasDuplicates, ...webglDuplicates, ...ipDuplicates].forEach((d: any) => {
      if (d.user_ids) d.user_ids.forEach((id: number) => allUserIds.add(id));
    });

    const users = allUserIds.size > 0
      ? await prisma.user.findMany({
          where: { id: { in: Array.from(allUserIds) } },
          select: { id: true, username: true, nickname: true, status: true, created_at: true },
        })
      : [];

    const userMap: Record<number, any> = {};
    users.forEach(u => { userMap[u.id] = u; });

    res.json(successResponse({
      canvas_duplicates: canvasDuplicates.map((d: any) => ({
        canvas_hash: d.canvas_hash,
        user_count: Number(d.user_count),
        users: (d.user_ids || []).map((id: number) => userMap[id] || { id }),
      })),
      webgl_duplicates: webglDuplicates.map((d: any) => ({
        webgl_hash: d.webgl_hash,
        user_count: Number(d.user_count),
        users: (d.user_ids || []).map((id: number) => userMap[id] || { id }),
      })),
      ip_duplicates: ipDuplicates.map((d: any) => ({
        ip_address: d.ip_address,
        user_count: Number(d.user_count),
        users: (d.user_ids || []).map((id: number) => userMap[id] || { id }),
      })),
    }));
  } catch (err) {
    console.error('Admin duplicates error:', err);
    res.status(500).json(errorResponse('다중 계정 탐지 조회 실패'));
  }
});

// GET /api/fingerprint/admin/users/:id — 특정 유저의 핑거프린트 이력
router.get('/admin/users/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      res.status(400).json(errorResponse('유효하지 않은 유저 ID'));
      return;
    }

    const fingerprints = await prisma.userFingerprint.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      take: 100,
    });

    // 같은 canvas_hash를 가진 다른 유저 찾기
    const canvasHashes = fingerprints
      .map(f => f.canvas_hash)
      .filter((h): h is string => h !== null);

    let relatedUsers: any[] = [];
    if (canvasHashes.length > 0) {
      const uniqueHashes = [...new Set(canvasHashes)];
      relatedUsers = await prisma.userFingerprint.findMany({
        where: {
          canvas_hash: { in: uniqueHashes },
          user_id: { not: userId },
        },
        select: {
          user_id: true,
          canvas_hash: true,
          ip_address: true,
          created_at: true,
          user: {
            select: { id: true, username: true, nickname: true },
          },
        },
        distinct: ['user_id'],
      });
    }

    res.json(successResponse({
      user_id: userId,
      fingerprints,
      related_users: relatedUsers,
    }));
  } catch (err) {
    console.error('Admin user fingerprints error:', err);
    res.status(500).json(errorResponse('유저 핑거프린트 조회 실패'));
  }
});

// ===== 블랙리스트 API =====

// POST /api/fingerprint/admin/blacklist — canvas_hash 블랙리스트 추가
router.post('/admin/blacklist', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const { canvas_hash, reason } = req.body;

    if (!canvas_hash) {
      res.status(400).json(errorResponse('canvas_hash 필수'));
      return;
    }

    // 이미 블랙리스트에 있는지 체크
    const existing = await prisma.fingerprintBlacklist.findUnique({
      where: { canvas_hash },
    });
    if (existing) {
      res.status(400).json(errorResponse('이미 블랙리스트에 등록된 fingerprint입니다'));
      return;
    }

    const blacklist = await prisma.fingerprintBlacklist.create({
      data: {
        canvas_hash,
        reason: reason || null,
        blocked_by: req.user!.id,
      },
    });

    // 이 canvas_hash를 사용하는 유저 목록 조회
    const affectedUsers = await prisma.userFingerprint.findMany({
      where: { canvas_hash },
      select: { user_id: true },
      distinct: ['user_id'],
    });
    const affectedUserIds = affectedUsers
      .map(u => u.user_id)
      .filter((id): id is number => id !== null);

    res.status(201).json(successResponse({
      blacklist,
      affected_user_ids: affectedUserIds,
      message: `블랙리스트 등록 완료. 영향받는 유저 ${affectedUserIds.length}명`,
    }));
  } catch (err) {
    console.error('Blacklist add error:', err);
    res.status(500).json(errorResponse('블랙리스트 등록 실패'));
  }
});

// GET /api/fingerprint/admin/blacklist — 블랙리스트 목록
router.get('/admin/blacklist', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [blacklist, total] = await Promise.all([
      prisma.fingerprintBlacklist.findMany({
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      prisma.fingerprintBlacklist.count(),
    ]);

    res.json(successResponse({
      blacklist,
      pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
    }));
  } catch (err) {
    console.error('Blacklist list error:', err);
    res.status(500).json(errorResponse('블랙리스트 조회 실패'));
  }
});

// DELETE /api/fingerprint/admin/blacklist/:id — 블랙리스트 해제
router.delete('/admin/blacklist/:id', authMiddleware, adminMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json(errorResponse('유효하지 않은 ID'));
      return;
    }

    const entry = await prisma.fingerprintBlacklist.findUnique({ where: { id } });
    if (!entry) {
      res.status(404).json(errorResponse('블랙리스트 항목을 찾을 수 없습니다'));
      return;
    }

    await prisma.fingerprintBlacklist.delete({ where: { id } });
    res.json(successResponse({ message: '블랙리스트에서 해제되었습니다' }));
  } catch (err) {
    console.error('Blacklist delete error:', err);
    res.status(500).json(errorResponse('블랙리스트 해제 실패'));
  }
});

export default router;
