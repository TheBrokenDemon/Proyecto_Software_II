const { Router } = require('express');
const { body, query } = require('express-validator');
const { createRecord, getHistory, getEmotions } = require('../controllers/emotional.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validate.middleware');

const router = Router();

router.use(authenticate);

// GET /api/emotional/emotions  → emojis disponibles para el frontend
router.get('/emotions', getEmotions);

// POST /api/emotional/records  → guardar check-in
router.post(
  '/records',
  [
    body('stress_level')
      .isIn(['bajo', 'medio', 'alto']).withMessage("El nivel de estrés debe ser 'bajo', 'medio' o 'alto'."),
    body('emotion_emoji')
      .notEmpty().withMessage('Debes seleccionar una emoción.'),
    body('emotion_label')
      .trim()
      .notEmpty().withMessage('La etiqueta de la emoción es obligatoria.'),
    body('notes')
      .optional()
      .isLength({ max: 500 }).withMessage('Las notas no pueden superar los 500 caracteres.'),
  ],
  handleValidationErrors,
  createRecord
);

// GET /api/emotional/records  → historial paginado
router.get(
  '/records',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('La página debe ser un número positivo.'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('El límite debe estar entre 1 y 50.'),
  ],
  handleValidationErrors,
  getHistory
);

module.exports = router;
