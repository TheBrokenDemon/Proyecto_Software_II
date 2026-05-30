const { pool } = require('../config/db');

/**
 * Middleware para autorizar endpoints basándose en roles.
 * @param  {...string} allowedRoles - Array de roles permitidos (ej. 'psicologo', 'admin')
 */
const authorizeRoles = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // 1. Verificamos que el middleware previo (authenticate) haya hecho su trabajo
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Usuario no autenticado.' });
      }

      // 2. Obtenemos el rol actual directamente de la base de datos (fuente de la verdad)
      const { rows } = await pool.query(
        'SELECT role FROM users WHERE id = $1',
        [req.user.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado.' });
      }

      const userRole = rows[0].role;

      // 3. Validamos si el rol del usuario está dentro de los roles permitidos para la ruta
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          message: 'Acceso denegado. No tienes los permisos necesarios para acceder a este panel.' 
        });
      }

      // 4. (Opcional) Adjuntamos el rol al request por si el controlador lo necesita
      req.user.role = userRole;

      next();
    } catch (err) {
      console.error('Error en middleware authorizeRoles:', err.message);
      res.status(500).json({ message: 'Error interno al verificar permisos.' });
    }
  };
};

module.exports = { authorizeRoles };