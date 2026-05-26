const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../config/db');
const { sendPasswordResetEmail } = require('../config/mailer');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;

const registerUser = async ({ full_name, email, password, age, gender, role }) => {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    const err = new Error('El correo ya esta registrado.');
    err.status = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const userRole = role === 'psicologo' ? 'psicologo' : 'estudiante';

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
    const err = new Error('Correo o contrasena incorrectos.');
    err.status = 401;
    throw err;
  }

  const user = rows[0];
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    const err = new Error('Correo o contrasena incorrectos.');
    err.status = 401;
    throw err;
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

  return {
    token,
    user: { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
  };
};

const logoutUser = async (token) => {
  await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
};

const requestPasswordReset = async (email) => {
  const { rows } = await pool.query(
    'SELECT id, email FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  // Por seguridad respondemos igual si el correo existe o no
  if (rows.length === 0) return;

  const user = rows[0];

  // Invalidar tokens anteriores
  await pool.query(
    'UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE',
    [user.id]
  );

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

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
    const err = new Error('El enlace de recuperacion es invalido o ha expirado.');
    err.status = 400;
    throw err;
  }

  const { id: tokenId, user_id } = rows[0];
  const password_hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [password_hash, user_id]);
  await pool.query('UPDATE password_reset_tokens SET used = TRUE WHERE id = $1', [tokenId]);
  // Revocar todas las sesiones activas por seguridad
  await pool.query('DELETE FROM sessions WHERE user_id = $1', [user_id]);
};

module.exports = { registerUser, loginUser, logoutUser, requestPasswordReset, resetPassword };
