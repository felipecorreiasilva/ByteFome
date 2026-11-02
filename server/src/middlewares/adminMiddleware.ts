import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware';

export function verifyAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Acesso negado. Apenas administradores.' });
    }
    return next();
}