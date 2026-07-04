import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { pool } from '../config/db';
import { sendPasswordResetEmail } from '../config/mailer';
import { AppError, RegisterPayload } from '../types';
import { UserRepository } from '../repositories/user.repository';

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

// ── Patrón Strategy: abstrae el algoritmo de hash ────────────
const hashStrategy = {
  hash:    (plain: string)                 => bcrypt.hash(String(plain), BCRYPT_ROUNDS),
  compare: (plain: string, hashed: string) => bcrypt.compare(String(plain), hashed),
};

// ── Registro ──────────────────────────────────────────────────
export const registerUser = async (payload: RegisterPayload) => {
  const { full_name, email, password, age, gender, role } = payload;

  // Patrón Repository — abstrae la query de verificación de email
  const existing = await UserRepository.findByEmail(email);
  if (existing) {
    const err: AppError = new Error('El correo ya está registrado.');
    err.status = 409;
    throw err;
  }

  // Validar edad
  if (age !== undefined && age !== null) {
    if (age < 18) {
      const err: AppError = new Error('Debes ser mayor de edad (mínimo 18 años).');
      err.status = 400;
      throw err;
    }
    if (age > 80) {
      const err: AppError = new Error('La edad no puede superar los 80 años.');
      err.status = 400;
      throw err;
    }
  }

  const password_hash = await hashStrategy.hash(password);
  const userRole = role === 'psicologo' ? 'psicologo' : 'estudiante';

  // Patrón Repository — abstrae el INSERT de usuario
  const newUser = await UserRepository.create({
    full_name: full_name.trim(),
    email: email.toLowerCase(),
    password_hash,
    age: age ?? null,
    gender: gender ?? null,
    role: userRole,
  });

  return newUser;
};

// ── Login ─────────────────────────────────────────────────────
export const loginUser = async (email: string, password: string) => {
  // Patrón Repository — abstrae la query de búsqueda por email
  const user = await UserRepository.findByEmail(email);

  if (!user) {
    const err: AppError = new Error('Correo o contraseña incorrectos.');
    err.status = 401;
    throw err;
  }

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
      id:        user.id,
      full_name: user.full_name,
      email:     user.email,
      role:      user.role,
      age:       user.age ?? null,
      gender:    user.gender ?? null,
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
  if (rows.length === 0) return;

  const user = rows[0];

  await pool.query(
    'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE',
    [user.id]
  );

  const token = crypto.randomBytes(32).toString('hex');

  await pool.query(
    `INSERT INTO password_reset_tokens (user_id, token, expires_at)
    VALUES ($1, $2, NOW() + INTERVAL '1 hour')`,
    [user.id, token]
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