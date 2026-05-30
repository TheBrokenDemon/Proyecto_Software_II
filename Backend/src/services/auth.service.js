const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Registra un nuevo usuario.
 * Lanza error si el correo ya existe.
 */
const registerUser = async ({ full_name, email, password, age, gender }) => {
  // Verificar duplicado de email
  const existing = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email.toLowerCase()]
  );
  if (existing.rows.length > 0) {
    const err = new Error('El correo ya está registrado.');
    err.status = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, age, gender)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, full_name, email, age, gender, created_at`,
    [full_name.trim(), email.toLowerCase(), password_hash, age ?? null, gender ?? null]
  );

  return rows[0];
};

/**
 * Valida credenciales y genera un JWT + registro en sessions.
 */
const loginUser = async ({ email, password }) => {
  const { rows } = await pool.query(
    'SELECT id, full_name, email, password_hash FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (rows.length === 0) {
    const err = new Error('Correo o contraseña incorrectos.');
    err.status = 401;
    throw err;
  }

  const user = rows[0];
  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    const err = new Error('Correo o contraseña incorrectos.');
    err.status = 401;
    throw err;
  }

  // Generar JWT
  const token = jwt.sign(
    { sub: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  // Calcular fecha de expiración para guardar en sessions
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // sincronizado con JWT_EXPIRES_IN=7d

  await pool.query(
    'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [user.id, token, expiresAt]
  );

  return {
    token,
    user: { id: user.id, full_name: user.full_name, email: user.email },
  };
};

/**
 * Cierra la sesión eliminando el token de la tabla sessions.
 */
const logoutUser = async (token) => {
  await pool.query('DELETE FROM sessions WHERE token = $1', [token]);
};

const forgotPasswordUser = async (email) => {
  const normalizedEmail = email.toLowerCase();
  
  // 1. Verificar si el usuario existe
  const { rows } = await pool.query(
    'SELECT id, full_name FROM users WHERE email = $1',
    [normalizedEmail]
  );
  if (rows.length === 0) {
    const err = new Error('No existe una cuenta asociada a este correo.');
    err.status = 404;
    throw err;
  }
  const user = rows[0];
  // 2. Generar token aleatorio (criptográficamente seguro)
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // 3. Calcular expiración (15 minutos a partir de ahora)
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 15);
  // 4. Guardar token y expiración en la base de datos
  await pool.query(
    'UPDATE users SET reset_token = $1, reset_token_expires_at = $2 WHERE id = $3',
    [resetToken, expiresAt, user.id]
  );
  // Retornamos la info para que el controlador simule el envío
  return { email: normalizedEmail, name: user.full_name, resetToken };
};
const resetPasswordUser = async ({ token, newPassword }) => {
  // 1. Buscar al usuario cuyo token coincida y NO haya expirado
  const { rows } = await pool.query(
    'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires_at > NOW()',
    [token]
  );
  if (rows.length === 0) {
    const err = new Error('El token es inválido o ha expirado.');
    err.status = 400;
    throw err;
  }
  const userId = rows[0].id;
  // 2. Encriptar la nueva contraseña
  const password_hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  // 3. Actualizar la BD y LIMPIAR los campos del token (usado 1 sola vez)
  await pool.query(
    'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires_at = NULL WHERE id = $2',
    [password_hash, userId]
  );
  // 4. (Opcional/Seguridad) Cerrar todas las sesiones activas del usuario
  await pool.query('DELETE FROM sessions WHERE user_id = $1', [userId]);
};



module.exports = { registerUser, loginUser, logoutUser, forgotPasswordUser, resetPasswordUser };
