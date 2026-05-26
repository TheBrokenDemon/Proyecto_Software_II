const { Router } = require('express');
const { body } = require('express-validator');
const { register, login, logout, forgotPassword, resetPasswordHandler } = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validate.middleware');

const router = Router();

// POST /api/auth/register
router.post('/register',
  [
    body('full_name').trim().notEmpty().withMessage('El nombre es obligatorio.')
      .isLength({ min: 3, max: 120 }).withMessage('El nombre debe tener entre 3 y 120 caracteres.'),
    body('email').normalizeEmail().isEmail().withMessage('Ingresa un correo valido.'),
    body('password').isLength({ min: 8 }).withMessage('La contrasena debe tener al menos 8 caracteres.'),
    body('age').optional().isInt({ min: 15, max: 80 }).withMessage('La edad debe estar entre 15 y 80.'),
    body('gender').optional()
      .isIn(['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo']).withMessage('Genero no valido.'),
    body('role').optional()
      .isIn(['estudiante', 'psicologo']).withMessage('Rol no valido.'),
  ],
  handleValidationErrors,
  register
);

// POST /api/auth/login
router.post('/login',
  [
    body('email').normalizeEmail().isEmail().withMessage('Ingresa un correo valido.'),
    body('password').notEmpty().withMessage('La contrasena es obligatoria.'),
  ],
  handleValidationErrors,
  login
);

// POST /api/auth/logout
router.post('/logout', authenticate, logout);

// POST /api/auth/forgot-password
router.post('/forgot-password',
  [body('email').normalizeEmail().isEmail().withMessage('Ingresa un correo valido.')],
  handleValidationErrors,
  forgotPassword
);

// POST /api/auth/reset-password
router.post('/reset-password',
  [
    body('token').notEmpty().withMessage('Token requerido.'),
    body('new_password').isLength({ min: 8 }).withMessage('La contrasena debe tener al menos 8 caracteres.'),
  ],
  handleValidationErrors,
  resetPasswordHandler
);

module.exports = router;
