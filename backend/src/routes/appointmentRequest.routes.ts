import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { requestAppointment, myRequests, cancelMyRequest } from '../controllers/appointmentRequest.controller';
import { AuthRequest } from '../types';

const router = Router();

router.use(authenticate, authorize('estudiante'));

const wrap = (fn: any) => (req: any, res: any, next: any) => fn(req as AuthRequest, res, next);

router.post('/', wrap(requestAppointment));
router.get('/mine', wrap(myRequests));
router.patch('/:id/cancel', wrap(cancelMyRequest));

export default router;