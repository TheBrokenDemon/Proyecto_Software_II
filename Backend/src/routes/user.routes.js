const { Router } = require('express');
const { body } = require('express-validator');
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validate.middleware');

const router = Router();

// Todas las rutas de usuario requieren autenticación
router.use(authenticate);

// GET /api/users/profile
router.get('/profile', getProfile);

// PATCH /api/users/profile
router.patch(
  '/profile',
  [
    body('full_name')
      .optional()
      .trim()
      .isLength({ min: 3, max: 120 }).withMessage('El nombre debe tener entre 3 y 120 caracteres.'),
    body('age')
      .optional()
      .isInt({ min: 15, max: 80 }).withMessage('La edad debe ser un número entre 15 y 80.'),
    body('gender')
      .optional()
      .isIn(['Masculino', 'Femenino', 'Otro', 'Prefiero no decirlo'])
      .withMessage('Valor de género no válido.'),
  ],
  handleValidationErrors,
  updateProfile
);

module.exports = router;
