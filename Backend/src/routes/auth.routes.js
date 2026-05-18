const { Router } = require('express');
const { body } = require('express-validator');
const { register, login, logout } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validate.middleware');

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  [
    body('full_name')
      .trim()
      .notEmpty().withMessage('El nombre completo es obligatorio.')
      .isLength({ min: 3, max: 120 }).withMessage('El nombre debe tener entre 3 y 120 caracteres.'),
    body('email')
      .normalizeEmail()
      .isEmail().withMessage('Ingresa un correo electrónico válido.'),
    body('password')
      .isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres.'),
    body('age')
      .optional()
      .isInt({ min: 15, max: 80 }).withMessage('La edad debe ser un número entre 15 y 80.'),
    body('gender')
      .optional()
      .isIn(['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo'])
      .withMessage('Valor de género no válido.'),
  ],
  handleValidationErrors,
  register
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email')
      .normalizeEmail()
      .isEmail().withMessage('Ingresa un correo electrónico válido.'),
    body('password')
      .notEmpty().withMessage('La contraseña es obligatoria.'),
  ],
  handleValidationErrors,
  login
);

// POST /api/auth/logout  (requiere token válido)
router.post('/logout', authenticate, logout);

module.exports = router;
