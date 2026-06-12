import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../config/db';
import { sendPasswordResetEmail } from '../config/mailer';
import { AppError, RegisterPayload } from '../types';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

// ── Patrón Strategy: abstrae el algoritmo de hash ────────────
const hashStrategy = {
    hash: (plain: string) => bcrypt.hash(String(plain), BCRYPT_ROUNDS),
    compare: (plain: string, hashed: string) => bcrypt.compare(String(plain), hashed),
};

// ── Registro ──────────────────────────────────────────────────
export const registerUser = async (payload: RegisterPayload) => {
    const { full_name, email, password, age, gender, role } = payload;

    const existing = await pool.query(
        'SELECT id FROM users WHERE email = $1',
        [email.toLowerCase()]
    );
    if (existing.rows.length > 0) {
        const err: AppError = new Error('El correo ya está registrado.');
        err.status = 409;
        throw err;
    }

    const password_hash = await hashStrategy.hash(password);
    const userRole = role === 'psicologo' ? 'psicologo' : 'estudiante';

    const { rows } = await pool.query(
        `INSERT INTO users (full_name, email, password_hash, age, gender, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, full_name, email, age, gender, role, created_at`,
        [full_name.trim(), email.toLowerCase(), password_hash, age ?? null, gender ?? null, userRole]
    );
    return rows[0];
};

// ── Login ─────────────────────────────────────────────────────
export const loginUser = async (email: string, password: string) => {
    const { rows } = await pool.query(
        'SELECT id, full_name, email, password_hash, role FROM users WHERE email = $1',
        [email.toLowerCase()]
    );

    if (rows.length === 0) {
        const err: AppError = new Error('Correo o contraseña incorrectos.');
        err.status = 401;
        throw err;
    }

    const user = rows[0];

    if (!user.password_hash) {
        const err: AppError = new Error('Correo o contraseña incorrectos.');
        err.status = 401;
        throw err;
    }

    const match = await hashStrategy.compare(password, user.password_hash);
    if (!match) {
        const err: AppError = new Error('Correo o contraseña incorrectos.');
        err.status = 401;
        throw err;
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await pool.query(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, token, expiresAt]
    );

    return {
        token,
        user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
        },
    };
};

// ── Logout ────────────────────────────────────────────────────
export const logoutUser = async (token: string): Promise<void> => {
    await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
};

// ── Recuperar contraseña ──────────────────────────────────────
export const requestPasswordReset = async (email: string): Promise<void> => {
    const { rows } = await pool.query(
        'SELECT id, email FROM users WHERE email = $1',
        [email.toLowerCase()]
    );
    if (rows.length === 0) return; // No revelar si el email existe

    const user = rows[0];

    await pool.query(
        'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE',
        [user.id]
    );

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await pool.query(
        'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
        [user.id, token, expiresAt]
    );

    await sendPasswordResetEmail(user.email, token);
};

// ── Resetear contraseña ───────────────────────────────────────
export const resetPassword = async (token: string, newPassword: string): Promise<void> => {
    const { rows } = await pool.query(
        `SELECT id, user_id FROM password_reset_tokens
     WHERE token = $1 AND used = FALSE AND expires_at > NOW()`,
        [token]
    );

    if (rows.length === 0) {
        const err: AppError = new Error('El enlace de recuperación es inválido o ha expirado.');
        err.status = 400;
        throw err;
    }

    const { id: tokenId, user_id } = rows[0];
    const password_hash = await hashStrategy.hash(newPassword);

    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, user_id]);
    await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [tokenId]);
    await pool.query('DELETE FROM sessions WHERE user_id = $1', [user_id]);
};