// ── auth.routes.ts ────────────────────────────────────────────
import { Router } from 'express';
import { register, login, forgotPassword, resetPasswordController } from '../controllers/auth.controller';

const router = Router();

router.post('/register', register);           // S2-39
router.post('/login', login);              // S2-40
router.post('/forgot-password', forgotPassword);     // S2-63
router.post('/reset-password', resetPasswordController); // S2-63

export default router;