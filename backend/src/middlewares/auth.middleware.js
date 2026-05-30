const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token de acceso requerido.' });
    }

    const token = authHeader.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('TOKEN DECODED:', decoded);
    } catch {
      return res.status(401).json({ message: 'Token invalido o expirado.' });
    }

    const { rows } = await pool.query(
      'SELECT id FROM sessions WHERE token = $1 AND expires_at > NOW()',
      [token]
    );
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Sesion no valida. Inicia sesion nuevamente.' });
    }

    req.user = { id: decoded.id || decoded.sub, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    console.error('Error en authenticate:', err.message);
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permiso para acceder a este recurso.' });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
