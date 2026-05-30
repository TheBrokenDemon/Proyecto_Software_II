const { Router } = require('express');
const { getDashboard } = require('../controllers/psychologist.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorizeRoles } = require('../middlewares/role.middleware');

const router = Router();

// Protegemos TODAS las rutas de este archivo con autenticación y verificación de rol
router.use(authenticate);
router.use(authorizeRoles('psicologo')); 
// Nota: Si a futuro hay un superadmin, podrías usar: authorizeRoles('psicologo', 'admin')

// GET /api/psychologist/dashboard
router.get('/dashboard', getDashboard);

module.exports = router;