import { Router, Request, Response, NextFunction } from 'express';
import { getProfile, updateProfile, updateTheme} from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { AuthRequest } from '../types';

const router = Router();

router.use(authenticate);

router.get('/profile', (req, res, next) => getProfile(req as AuthRequest, res, next));
router.patch('/profile', (req, res, next) => updateProfile(req as AuthRequest, res, next));
router.patch('/theme', (req, res, next) => updateTheme(req as AuthRequest, res, next));

export default router;