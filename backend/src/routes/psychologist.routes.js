const { Router } = require('express');
const { listStudents, studentResponses, citateStudent } = require('../controllers/psychologist.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authenticate, authorize('psicologo'));

router.get('/students', listStudents);
router.get('/students/:studentId', studentResponses);
router.post('/students/:studentId/citation', citateStudent);

module.exports = router;