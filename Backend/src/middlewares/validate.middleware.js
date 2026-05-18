const { validationResult } = require('express-validator');

/**
 * Middleware que corta el request si express-validator encontró errores.
 * Usar después de los arrays de validación en las rutas.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Datos inválidos. Revisa los campos e intenta nuevamente.',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

module.exports = { handleValidationErrors };
