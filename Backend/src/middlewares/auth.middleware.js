const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

/**
 * Middleware de autenticación.
 * Verifica el JWT del header Authorization y adjunta req.user con los datos del usuario.
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token de acceso requerido.' });
    }

    const token = authHeader.split(' ')[1];

    // Verificar firma y expiración del JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(401).json({ message: 'Token inválido o expirado.' });
    }

    // Verificar que el token esté registrado en la tabla sessions (no fue revocado)
    const { rows } = await pool.query(
      'SELECT id FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Sesión no válida. Inicia sesión nuevamente.' });
    }

    req.user = { id: decoded.sub, email: decoded.email };
    next();
  } catch (err) {
    console.error('Error en middleware authenticate:', err.message);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

module.exports = { authenticate };
