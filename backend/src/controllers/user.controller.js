const { pool } = require('../config/db');
const { UserFactory } = require('../utils/Factories');

/**
 * Obtiene el perfil del usuario autenticado.
 */
exports.getProfile = async (req, res, next) => {
  try {
    // El ID del usuario se obtiene del token JWT, que el middleware 'authenticate' ya validó.
    const userId = req.user.id;

    const result = await pool.query('SELECT id, full_name, email, age, gender, role FROM users WHERE id = $1', [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // Usamos la factory para asegurar una respuesta consistente y segura.
    const userResponse = UserFactory.createUserResponse(result.rows[0]);
    res.status(200).json(userResponse);

  } catch (error) {
    next(error);
  }
};

/**
 * Actualiza el perfil del usuario autenticado.
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { full_name, age, gender } = req.body;

    // Validación básica de los datos de entrada.
    if (!full_name && !age && !gender) {
      return res.status(400).json({ message: 'No se proporcionaron datos para actualizar.' });
    }

    // Construcción dinámica de la consulta para actualizar solo los campos proporcionados.
    const fields = [];
    const values = [];
    let queryIndex = 1;

    if (full_name) { fields.push(`full_name = $${queryIndex++}`); values.push(full_name); }
    if (age) { fields.push(`age = $${queryIndex++}`); values.push(age); }
    if (gender) { fields.push(`gender = $${queryIndex++}`); values.push(gender); }

    values.push(userId); // El ID del usuario es el último parámetro para el WHERE.

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${queryIndex} RETURNING *`;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No se pudo encontrar el usuario para actualizar.' });
    }

    res.status(200).json({ message: 'Perfil actualizado con éxito' });

  } catch (error) {
    console.error('[User Controller] Error al actualizar perfil:', error);
    next(error);
  }
};