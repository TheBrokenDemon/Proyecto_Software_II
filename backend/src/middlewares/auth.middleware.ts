import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db';
import { AuthRequest, AuthUser } from '../types';

export const authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token de acceso requerido.' });
            return;
        }

        const token = authHeader.split(' ')[1];

        let decoded: AuthUser;
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET as string) as any;
            decoded = {
                id: payload.id || payload.sub,
                email: payload.email,
                role: payload.role,
            };
        } catch {
            res.status(401).json({ message: 'Token inválido o expirado.' });
            return;
        }

        const { rows } = await pool.query(
            'SELECT id FROM sessions WHERE token = $1 AND expires_at > NOW()',
            [token]
        );
        if (rows.length === 0) {
            res.status(401).json({ message: 'Sesión no válida. Inicia sesión nuevamente.' });
            return;
        }

        (req as AuthRequest).user = decoded;
        next();
    } catch (err: any) {
        console.error('Error en authenticate:', err.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = (req as AuthRequest).user;
        if (!roles.includes(user.role)) {
            res.status(403).json({ message: 'No tienes permiso para acceder a este recurso.' });
            return;
        }
        next();
    };
};