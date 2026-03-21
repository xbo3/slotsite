import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils';

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  windowMs: number;      // 시간 창 (밀리초)
  maxRequests: number;   // 최대 요청 수
  message?: string;      // 초과 시 메시지
}

/**
 * IP 기반 Rate Limiter (메모리 Map 사용, 외부 패키지 없이)
 * 주기적으로 만료된 엔트리 정리 (메모리 누수 방지)
 */
function createRateLimiter(options: RateLimitOptions) {
  const { windowMs, maxRequests, message } = options;
  const store = new Map<string, RateLimitEntry>();

  // 5분마다 만료된 엔트리 정리
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt <= now) {
        store.delete(key);
      }
    }
  }, 5 * 60 * 1000);

  return (req: Request, res: Response, next: NextFunction): void => {
    const forwarded = req.headers['x-forwarded-for'];
    const ip = typeof forwarded === 'string'
      ? forwarded.split(',')[0].trim()
      : req.ip || 'unknown';

    const now = Date.now();
    const entry = store.get(ip);

    if (!entry || entry.resetAt <= now) {
      // 새 윈도우 시작
      store.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }

    entry.count++;

    if (entry.count > maxRequests) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
      res.set('Retry-After', String(retryAfter));
      res.status(429).json(errorResponse(
        message || `요청이 너무 많습니다. ${retryAfter}초 후 다시 시도해주세요.`
      ));
      return;
    }

    next();
  };
}

// 로그인/쿠폰 적용 등 민감 API: 5회/분
export const strictLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 5,
  message: '요청 횟수를 초과했습니다. 1분 후 다시 시도해주세요.',
});

// 일반 API: 60회/분
export const normalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  message: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
});
