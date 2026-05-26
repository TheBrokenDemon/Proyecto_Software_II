const { Router } = require('express');
const { listStudents, studentResponses } = require('../controllers/psychologist.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = Router();

// Solo psicologos pueden acceder a estas rutas
router.use(authenticate, authorize('psicologo'));

// GET /api/psychologist/students → lista de estudiantes con resumen
router.get('/students', listStudents);

// GET /api/psychologist/students/:studentId → respuestas de un estudiante
router.get('/students/:studentId', studentResponses);

module.exports = router;
