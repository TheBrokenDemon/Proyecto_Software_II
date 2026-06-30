import { Router } from 'express';
import {
    listStudents, studentResponses, citateStudent,
    addFollowup, patchFollowup, listFollowups, addAppointment,
} from '../controllers/psychologist.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { AuthRequest } from '../types';

const router = Router();

router.use(authenticate, authorize('psicologo'));

const wrap = (fn: any) => (req: any, res: any, next: any) => fn(req as AuthRequest, res, next);

router.get('/students', wrap(listStudents));
router.get('/students/:studentId', wrap(studentResponses));
router.post('/students/:studentId/citation', wrap(citateStudent));
router.post('/students/:studentId/followups', wrap(addFollowup));
router.get('/students/:studentId/followups', wrap(listFollowups));
router.patch('/followups/:followupId', wrap(patchFollowup));
router.post('/students/:studentId/appointments', wrap(addAppointment));

export default router;