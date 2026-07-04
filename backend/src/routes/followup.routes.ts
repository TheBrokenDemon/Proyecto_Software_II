import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { myFollowups } from '../controllers/followup.controller';
import { AuthRequest } from '../types';

const router = Router();

router.use(authenticate, authorize('estudiante'));

const wrap = (fn: any) => (req: any, res: any, next: any) => fn(req as AuthRequest, res, next);

router.get('/mine', wrap(myFollowups));

export default router;