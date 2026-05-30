const express = require('express');
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware'); // Asumiendo que el middleware existe.

const router = express.Router();

// Todas las rutas en este archivo requieren autenticación.
// El middleware 'authenticate' se ejecutará primero, validará el token
// y adjuntará la información del usuario (incluyendo el ID) a `req.user`.
router.use(authenticate);

router.route('/profile')
  .get(getProfile)
  .patch(updateProfile);

module.exports = router;