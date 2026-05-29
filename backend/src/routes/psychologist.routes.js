/**
 * psychologist.routes.js
 * Rutas para el panel del psicólogo
 */
const { Router } = require('express');
const { body } = require('express-validator');
const { listStudents, studentResponses, createObservation, listObservations } = require('../controllers/psychologist.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
const { handleValidationErrors } = require('../middlewares/validate.middleware');

const router = Router();
router.use(authenticate, authorize('psicologo'));

// Listado de estudiantes
router.get('/students', listStudents);

// Detalle de evaluaciones de un estudiante
router.get('/students/:studentId', studentResponses);

// Observaciones de un estudiante
router.get('/students/:studentId/observations', listObservations);

// Registrar nueva observación (+ flag de contacto opcional)
router.post('/students/:studentId/observations',
  [
    body('text').notEmpty().withMessage('El texto de la observación es requerido.'),
    body('flag_for_contact').optional().isBoolean(),
  ],
  handleValidationErrors,
  createObservation
);

module.exports = router;
