import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { createCheckin, todayCheckin, checkinHistory } from '../controllers/mood.controller';

const router = Router();

router.use(authenticate);

router.post('/checkins', authorize('estudiante'), createCheckin);
router.get('/checkins/today', authorize('estudiante'), todayCheckin);
router.get('/checkins', authorize('estudiante'), checkinHistory);

export default router;
