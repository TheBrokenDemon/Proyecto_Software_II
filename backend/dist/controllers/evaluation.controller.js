"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myHistory = exports.submitResponses = exports.getEvaluation = exports.listEvaluations = void 0;
const evaluation_service_1 = require("../services/evaluation.service");
const listEvaluations = async (req, res) => {
    try {
        const evaluations = await (0, evaluation_service_1.getActiveEvaluations)();
        res.status(200).json({ evaluations });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.listEvaluations = listEvaluations;
const getEvaluation = async (req, res) => {
    try {
        const evaluation = await (0, evaluation_service_1.getEvaluationWithQuestions)(req.params.slug);
        res.status(200).json({ evaluation });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.getEvaluation = getEvaluation;
const submitResponses = async (req, res) => {
    try {
        const user = req.user;
        const result = await (0, evaluation_service_1.submitEvaluationResponses)(user.id, req.params.slug, req.body.answers);
        res.status(201).json(result);
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.submitResponses = submitResponses;
const myHistory = async (req, res) => {
    try {
        const user = req.user;
        const history = await (0, evaluation_service_1.getMyHistory)(user.id);
        res.status(200).json({ history });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.myHistory = myHistory;
