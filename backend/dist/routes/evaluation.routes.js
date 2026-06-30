"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const evaluation_controller_1 = require("../controllers/evaluation.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const validate_middleware_1 = require("../middlewares/validate.middleware");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate);
router.get('/', evaluation_controller_1.listEvaluations);
router.get('/history', (0, auth_middleware_1.authorize)('estudiante'), evaluation_controller_1.myHistory);
router.get('/:slug', evaluation_controller_1.getEvaluation);
router.post('/:slug/responses', (0, auth_middleware_1.authorize)('estudiante'), [
    (0, express_validator_1.body)('answers').isArray({ min: 1 }).withMessage('Debes enviar al menos una respuesta.'),
    (0, express_validator_1.body)('answers.*.question_id').notEmpty().withMessage('Cada respuesta debe tener un question_id.'),
    (0, express_validator_1.body)('answers.*.answer').notEmpty().withMessage('Cada respuesta debe tener un valor.'),
], validate_middleware_1.handleValidationErrors, evaluation_controller_1.submitResponses);
exports.default = router;
