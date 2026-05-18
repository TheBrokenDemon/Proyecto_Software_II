const { pool } = require('../config/db');

/**
 * Retorna el perfil del usuario autenticado (sin password_hash).
 */
const getUserProfile = async (userId) => {
  const { rows } = await pool.query(
    'SELECT id, full_name, email, age, gender, created_at FROM users WHERE id = $1',
    [userId]
  );
  if (rows.length === 0) {
    const err = new Error('Usuario no encontrado.');
    err.status = 404;
    throw err;
  }
  return rows[0];
};

/**
 * Actualiza los campos permitidos del perfil.
 * Solo actualiza los campos que vienen en el body.
 */
const updateUserProfile = async (userId, { full_name, age, gender }) => {
  const fields = [];
  const values = [];
  let idx = 1;

  if (full_name !== undefined) {
    fields.push(`full_name = $${idx++}`);
    values.push(full_name.trim());
  }
  if (age !== undefined) {
    fields.push(`age = $${idx++}`);
    values.push(age);
  }
  if (gender !== undefined) {
    fields.push(`gender = $${idx++}`);
    values.push(gender);
  }

  if (fields.length === 0) {
    const err = new Error('No se enviaron campos para actualizar.');
    err.status = 400;
    throw err;
  }

  values.push(userId);
  const { rows } = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}
     RETURNING id, full_name, email, age, gender, updated_at`,
    values
  );

  return rows[0];
};

module.exports = { getUserProfile, updateUserProfile };
