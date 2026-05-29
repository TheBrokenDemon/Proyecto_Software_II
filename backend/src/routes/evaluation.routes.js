const { Router } = require('express');
const { body } = require('express-validator');
const { listEvaluations, getEvaluation, submitResponses, myHistory } = require('../controllers/evaluation.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validate.middleware');

const router = Router();

router.use(authenticate);

// GET /api/evaluations → dashboard, accesible para todos los roles
router.get('/', listEvaluations);

// GET /api/evaluations/history → historial del estudiante autenticado
router.get('/history', authorize('estudiante'), myHistory);

// GET /api/evaluations/:slug → preguntas de una evaluacion
router.get('/:slug', getEvaluation);

// POST /api/evaluations/:slug/responses → enviar respuestas
router.post('/:slug/responses',
  authorize('estudiante'),
  [
    body('answers').isArray({ min: 1 }).withMessage('Debes enviar al menos una respuesta.'),
    body('answers.*.question_id').notEmpty().withMessage('Cada respuesta debe tener un question_id.'),
    body('answers.*.answer').notEmpty().withMessage('Cada respuesta debe tener un valor.'),
  ],
  handleValidationErrors,
  submitResponses
);

module.exports = router;
