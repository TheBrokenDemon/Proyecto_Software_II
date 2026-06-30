"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Token de acceso requerido.' });
            return;
        }
        const token = authHeader.split(' ')[1];
        let decoded;
        try {
            const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            decoded = {
                id: payload.id || payload.sub,
                email: payload.email,
                role: payload.role,
            };
        }
        catch {
            res.status(401).json({ message: 'Token inválido o expirado.' });
            return;
        }
        const { rows } = await db_1.pool.query('SELECT id FROM sessions WHERE token = $1 AND expires_at > NOW()', [token]);
        if (rows.length === 0) {
            res.status(401).json({ message: 'Sesión no válida. Inicia sesión nuevamente.' });
            return;
        }
        req.user = decoded;
        next();
    }
    catch (err) {
        console.error('Error en authenticate:', err.message);
        res.status(500).json({ message: 'Error interno del servidor.' });
    }
};
exports.authenticate = authenticate;
const authorize = (...roles) => {
    return (req, res, next) => {
        const user = req.user;
        if (!roles.includes(user.role)) {
            res.status(403).json({ message: 'No tienes permiso para acceder a este recurso.' });
            return;
        }
        next();
    };
};
exports.authorize = authorize;
