import { Router } from 'express';
import { myAppointments, replyAppointment } from '../controllers/psychologist.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { AuthRequest } from '../types';

const router = Router();

router.use(authenticate, authorize('estudiante'));

const wrap = (fn: any) => (req: any, res: any, next: any) => fn(req as AuthRequest, res, next);

router.get('/', wrap(myAppointments));
router.patch('/:appointmentId', wrap(replyAppointment));

export default router;