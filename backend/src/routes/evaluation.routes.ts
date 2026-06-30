import { Router } from 'express';
import { body } from 'express-validator';
import { listEvaluations, getEvaluation, submitResponses, myHistory } from '../controllers/evaluation.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { handleValidationErrors } from '../middlewares/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', listEvaluations);
router.get('/history', authorize('estudiante'), myHistory);
router.get('/:slug', getEvaluation);

router.post('/:slug/responses',
    authorize('estudiante'),
    [
        body('answers').isArray({ min: 1 }).withMessage('Debes enviar al menos una respuesta.'),
        body('answers.*.question_id').notEmpty().withMessage('Cada respuesta debe tener un question_id.'),
        body('answers.*.answer').notEmpty().withMessage('Cada respuesta debe tener un valor.'),
    ],
    handleValidationErrors,
    submitResponses
);

export default router;