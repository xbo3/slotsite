import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils';

export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || req.user.role !== 'ADMIN') {
    res.status(403).json(errorResponse('관리자 권한이 필요합니다'));
    return;
  }
  next();
}
