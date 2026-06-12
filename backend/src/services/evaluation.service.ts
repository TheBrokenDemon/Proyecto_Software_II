import { pool } from '../config/db';
import { AnswerPayload, AppError } from '../types';

export const getActiveEvaluations = async () => {
    const { rows } = await pool.query(
        'SELECT id, title, slug, description, icon FROM evaluations WHERE is_active = TRUE ORDER BY title ASC'
    );
    return rows;
};

export const getEvaluationWithQuestions = async (slug: string) => {
    const { rows: evalRows } = await pool.query(
        'SELECT id, title, slug, description FROM evaluations WHERE slug = $1 AND is_active = TRUE',
        [slug]
    );
    if (evalRows.length === 0) {
        const err: AppError = new Error('Evaluación no encontrada.');
        err.status = 404;
        throw err;
    }
    const evaluation = evalRows[0];

    const { rows: questions } = await pool.query(
        `SELECT id, content, type, options, order_index, required
     FROM questions WHERE evaluation_id = $1 ORDER BY order_index ASC`,
        [evaluation.id]
    );
    return { ...evaluation, questions };
};

export const submitEvaluationResponses = async (
    userId: string,
    slug: string,
    answers: AnswerPayload[]
) => {
    const { rows: evalRows } = await pool.query(
        'SELECT id FROM evaluations WHERE slug = $1 AND is_active = TRUE',
        [slug]
    );
    if (evalRows.length === 0) {
        const err: AppError = new Error('Evaluación no encontrada.');
        err.status = 404;
        throw err;
    }
    const evaluationId = evalRows[0].id;

    const { rows: required } = await pool.query(
        'SELECT id FROM questions WHERE evaluation_id = $1 AND required = TRUE',
        [evaluationId]
    );
    const answeredIds = answers.map((a) => a.question_id);
    const missing = required.filter((q: any) => !answeredIds.includes(q.id));
    if (missing.length > 0) {
        const err: AppError = new Error('Debes responder todas las preguntas obligatorias.');
        err.status = 400;
        throw err;
    }

    const { rows: responseRows } = await pool.query(
        'INSERT INTO evaluation_responses (user_id, evaluation_id) VALUES ($1, $2) RETURNING id',
        [userId, evaluationId]
    );
    const responseId = responseRows[0].id;

    for (const answer of answers) {
        await pool.query(
            'INSERT INTO response_answers (response_id, question_id, answer) VALUES ($1, $2, $3)',
            [responseId, answer.question_id, answer.answer]
        );
    }

    return { response_id: responseId, message: 'Evaluación completada correctamente.' };
};

export const getMyHistory = async (userId: string) => {
    const { rows } = await pool.query(
        `SELECT er.id, er.completed_at, e.title, e.slug
     FROM evaluation_responses er
     JOIN evaluations e ON e.id = er.evaluation_id
     WHERE er.user_id = $1
     ORDER BY er.completed_at DESC`,
        [userId]
    );
    return rows;
};