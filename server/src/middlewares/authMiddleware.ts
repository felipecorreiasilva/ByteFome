import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_super_segura';

export interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: 'client' | 'admin' | 'delivery';
    };
}

export function verifyAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
        return res.status(401).json({ error: 'Erro no formato do token.' });
    }

    const scheme = parts[0] as string;
    const token = parts[1] as string;

    if (!/^Bearer$/i.test(scheme)) {
        return res.status(401).json({ error: 'Token mal formatado.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err || !decoded) {
            return res.status(401).json({ error: 'Token inválido ou expirado.' });
        }

        // Atribuição segura com tipagem explícita para satisfazer o exactOptionalPropertyTypes
        const payload = decoded as JwtPayload & {
            id: number;
            email: string;
            role: 'client' | 'admin' | 'delivery';
        };

        req.user = {
            id: payload.id,
            email: payload.email,
            role: payload.role
        };

        return next();
    });
}