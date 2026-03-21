import { Request, Response, NextFunction } from 'express';

/**
 * 보안 헤더 미들웨어
 * X-Frame-Options, X-Content-Type-Options, X-XSS-Protection, Referrer-Policy, HSTS
 */
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}
