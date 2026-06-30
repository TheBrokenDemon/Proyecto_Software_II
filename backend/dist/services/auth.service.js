"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.requestPasswordReset = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../config/db");
const mailer_1 = require("../config/mailer");
const user_repository_1 = require("../repositories/user.repository");
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);
// ── Patrón Strategy: abstrae el algoritmo de hash ────────────
const hashStrategy = {
    hash: (plain) => bcryptjs_1.default.hash(String(plain), BCRYPT_ROUNDS),
    compare: (plain, hashed) => bcryptjs_1.default.compare(String(plain), hashed),
};
// ── Registro ──────────────────────────────────────────────────
const registerUser = async (payload) => {
    const { full_name, email, password, age, gender, role } = payload;
    // Patrón Repository — abstrae la query de verificación de email
    const existing = await user_repository_1.UserRepository.findByEmail(email);
    if (existing) {
        const err = new Error('El correo ya está registrado.');
        err.status = 409;
        throw err;
    }
    // Validar edad
    if (age !== undefined && age !== null) {
        if (age < 18) {
            const err = new Error('Debes ser mayor de edad (mínimo 18 años).');
            err.status = 400;
            throw err;
        }
        if (age > 80) {
            const err = new Error('La edad no puede superar los 80 años.');
            err.status = 400;
            throw err;
        }
    }
    const password_hash = await hashStrategy.hash(password);
    const userRole = role === 'psicologo' ? 'psicologo' : 'estudiante';
    // Patrón Repository — abstrae el INSERT de usuario
    const newUser = await user_repository_1.UserRepository.create({
        full_name: full_name.trim(),
        email: email.toLowerCase(),
        password_hash,
        age: age ?? null,
        gender: gender ?? null,
        role: userRole,
    });
    return newUser;
};
exports.registerUser = registerUser;
// ── Login ─────────────────────────────────────────────────────
const loginUser = async (email, password) => {
    // Patrón Repository — abstrae la query de búsqueda por email
    const user = await user_repository_1.UserRepository.findByEmail(email);
    if (!user) {
        const err = new Error('Correo o contraseña incorrectos.');
        err.status = 401;
        throw err;
    }
    if (!user.password_hash) {
        const err = new Error('Correo o contraseña incorrectos.');
        err.status = 401;
        throw err;
    }
    const match = await hashStrategy.compare(password, user.password_hash);
    if (!match) {
        const err = new Error('Correo o contraseña incorrectos.');
        err.status = 401;
        throw err;
    }
    const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await db_1.pool.query('INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)', [user.id, token, expiresAt]);
    return {
        token,
        user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role,
            age: user.age ?? null,
            gender: user.gender ?? null,
        },
    };
};
exports.loginUser = loginUser;
// ── Logout ────────────────────────────────────────────────────
const logoutUser = async (token) => {
    await db_1.pool.query('DELETE FROM sessions WHERE token = $1', [token]);
};
exports.logoutUser = logoutUser;
// ── Recuperar contraseña ──────────────────────────────────────
const requestPasswordReset = async (email) => {
    const { rows } = await db_1.pool.query('SELECT id, email FROM users WHERE email = $1', [email.toLowerCase()]);
    if (rows.length === 0)
        return;
    const user = rows[0];
    await db_1.pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE', [user.id]);
    const token = crypto_1.default.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await db_1.pool.query('INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)', [user.id, token, expiresAt]);
    await (0, mailer_1.sendPasswordResetEmail)(user.email, token);
};
exports.requestPasswordReset = requestPasswordReset;
// ── Resetear contraseña ───────────────────────────────────────
const resetPassword = async (token, newPassword) => {
    const { rows } = await db_1.pool.query(`SELECT id, user_id FROM password_reset_tokens
     WHERE token = $1 AND used = FALSE AND expires_at > NOW()`, [token]);
    if (rows.length === 0) {
        const err = new Error('El enlace de recuperación es inválido o ha expirado.');
        err.status = 400;
        throw err;
    }
    const { id: tokenId, user_id } = rows[0];
    const password_hash = await hashStrategy.hash(newPassword);
    await db_1.pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, user_id]);
    await db_1.pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [tokenId]);
    await db_1.pool.query('DELETE FROM sessions WHERE user_id = $1', [user_id]);
};
exports.resetPassword = resetPassword;
