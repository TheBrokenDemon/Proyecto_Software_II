"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyHistory = exports.submitEvaluationResponses = exports.getEvaluationWithQuestions = exports.getActiveEvaluations = void 0;
const db_1 = require("../config/db");
const getActiveEvaluations = async () => {
    const { rows } = await db_1.pool.query('SELECT id, title, slug, description, icon FROM evaluations WHERE is_active = TRUE ORDER BY title ASC');
    return rows;
};
exports.getActiveEvaluations = getActiveEvaluations;
const getEvaluationWithQuestions = async (slug) => {
    const { rows: evalRows } = await db_1.pool.query('SELECT id, title, slug, description FROM evaluations WHERE slug = $1 AND is_active = TRUE', [slug]);
    if (evalRows.length === 0) {
        const err = new Error('Evaluación no encontrada.');
        err.status = 404;
        throw err;
    }
    const evaluation = evalRows[0];
    const { rows: questions } = await db_1.pool.query(`SELECT id, content, type, options, order_index, required
     FROM questions WHERE evaluation_id = $1 ORDER BY order_index ASC`, [evaluation.id]);
    return { ...evaluation, questions };
};
exports.getEvaluationWithQuestions = getEvaluationWithQuestions;
const submitEvaluationResponses = async (userId, slug, answers) => {
    const { rows: evalRows } = await db_1.pool.query('SELECT id FROM evaluations WHERE slug = $1 AND is_active = TRUE', [slug]);
    if (evalRows.length === 0) {
        const err = new Error('Evaluación no encontrada.');
        err.status = 404;
        throw err;
    }
    const evaluationId = evalRows[0].id;
    const { rows: required } = await db_1.pool.query('SELECT id FROM questions WHERE evaluation_id = $1 AND required = TRUE', [evaluationId]);
    const answeredIds = answers.map((a) => a.question_id);
    const missing = required.filter((q) => !answeredIds.includes(q.id));
    if (missing.length > 0) {
        const err = new Error('Debes responder todas las preguntas obligatorias.');
        err.status = 400;
        throw err;
    }
    const { rows: responseRows } = await db_1.pool.query('INSERT INTO evaluation_responses (user_id, evaluation_id) VALUES ($1, $2) RETURNING id', [userId, evaluationId]);
    const responseId = responseRows[0].id;
    for (const answer of answers) {
        await db_1.pool.query('INSERT INTO response_answers (response_id, question_id, answer) VALUES ($1, $2, $3)', [responseId, answer.question_id, answer.answer]);
    }
    return { response_id: responseId, message: 'Evaluación completada correctamente.' };
};
exports.submitEvaluationResponses = submitEvaluationResponses;
const getMyHistory = async (userId) => {
    const { rows } = await db_1.pool.query(`SELECT er.id, er.completed_at, e.title, e.slug
     FROM evaluation_responses er
     JOIN evaluations e ON e.id = er.evaluation_id
     WHERE er.user_id = $1
     ORDER BY er.completed_at DESC`, [userId]);
    return rows;
};
exports.getMyHistory = getMyHistory;
