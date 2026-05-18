const { Router } = require('express');
const { getEvaluations } = require('../controllers/evaluation.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router();

// GET /api/evaluations  → tarjetas del dashboard (solo usuarios autenticados)
router.get('/', authenticate, getEvaluations);

module.exports = router;
