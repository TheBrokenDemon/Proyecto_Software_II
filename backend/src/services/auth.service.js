/**
 * auth.service.js
 *
 * Patrones aplicados:
 *   - Singleton  : Pool de BD (ya singleton en config/db.js), aquí se documenta
 *   - Strategy   : hashStrategy abstrae el algoritmo de hash (extensible a argon2, etc.)
 *   - Factory    : UserFactory crea el objeto usuario normalizado
 */

const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const crypto  = require('crypto');
const { pool } = require('../config/db');
const { sendPasswordResetEmail } = require('../config/mailer');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;

// ─── Strategy Pattern: hashing ────────────────────────────────────────────────
const hashStrategy = {
  hash:    (plain)         => bcrypt.hash(plain, BCRYPT_ROUNDS),
  compare: (plain, hashed) => bcrypt.compare(plain, hashed),
};

// ─── Factory Pattern: User ────────────────────────────────────────────────────
class UserFactory {
  static fromRow(row) {
    return {
      id:        row.id,
      full_name: row.full_name,
      email:     row.email,
      role:      row.role,
    };
  }
  static normalizeRole(role) {
    return role === 'psicologo' ? 'psicologo' : 'estudiante';
  }
}

// ─── Service functions ────────────────────────────────────────────────────────

const registerUser = async ({ full_name, email, password, age, gender, role }) => {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    const err = new Error('El correo ya está registrado.'); err.status = 409; throw err;
  }
  const password_hash = await hashStrategy.hash(password);
  const userRole = UserFactory.normalizeRole(role);

  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, age, gender, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, full_name, email, age, gender, role, created_at`,
    [full_name.trim(), email.toLowerCase(), password_hash, age ?? null, gender ?? null, userRole]
  );
  return rows[0];
};

const loginUser = async ({ email, password }) => {
  const { rows } = await pool.query(
    'SELECT id, full_name, email, password_hash, role FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  if (rows.length === 0) {
    const err = new Error('Correo o contraseña incorrectos.'); err.status = 401; throw err;
  }
  const user = rows[0];
  const match = await hashStrategy.compare(password, user.password_hash);
  if (!match) {
    const err = new Error('Correo o contraseña incorrectos.'); err.status = 401; throw err;
  }

  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await pool.query(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, token, expiresAt]
  );

  return { token, user: UserFactory.fromRow(user) };
};

const logoutUser = async (token) => {
  await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
};

const requestPasswordReset = async (email) => {
  const { rows } = await pool.query(
    'SELECT id, email FROM users WHERE email = $1', [email.toLowerCase()]
  );
  if (rows.length === 0) return; // seguridad: no revelar existencia
  const user = rows[0];
  await pool.query(
    'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE', [user.id]
  );
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await pool.query(
    'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, token, expiresAt]
  );
  await sendPasswordResetEmail(user.email, token);
};

const resetPassword = async (token, newPassword) => {
  const { rows } = await pool.query(
    `SELECT id, user_id FROM password_reset_tokens
     WHERE token = $1 AND used = FALSE AND expires_at > NOW()`,
    [token]
  );
  if (rows.length === 0) {
    const err = new Error('El enlace de recuperación es inválido o ha expirado.'); err.status = 400; throw err;
  }
  const { id: tokenId, user_id } = rows[0];
  const password_hash = await hashStrategy.hash(newPassword);
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, user_id]);
  await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [tokenId]);
  await pool.query('DELETE FROM sessions WHERE user_id = $1', [user_id]);
};

module.exports = { registerUser, loginUser, logoutUser, requestPasswordReset, resetPassword };
