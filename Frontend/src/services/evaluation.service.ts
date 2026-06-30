import { API_URL, authHeaders, handleResponse } from './api';

export interface AnswerPayload {
    question_id: string;
    answer: string;
}

// S2-11: Obtener lista de evaluaciones activas
export const getEvaluations = async () => {
    const res = await fetch(`${API_URL}/evaluations`, {
        headers: authHeaders(),
    });
    const data = await handleResponse(res);
    return data.evaluations;
};

// S2-11: Obtener evaluación con preguntas por slug
export const getEvaluationBySlug = async (slug: string) => {
    const res = await fetch(`${API_URL}/evaluations/${slug}`, {
        headers: authHeaders(),
    });
    const data = await handleResponse(res);
    return data.evaluation;
};

// S2-11: Enviar respuestas de una evaluación
export const submitSurvey = async (slug: string, answers: AnswerPayload[]) => {
    const res = await fetch(`${API_URL}/evaluations/${slug}/responses`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ answers }),
    });
    return handleResponse(res);
};

// S2-66: Obtener historial de evaluaciones del usuario
export const getMyHistory = async () => {
    const res = await fetch(`${API_URL}/evaluations/history`, {
        headers: authHeaders(),
    });
    const data = await handleResponse(res);
    return data.history;
};
// R2: Recomendaciones personalizadas según el estado más reciente
export const getRecommendations = async () => {
    const res = await fetch(`${API_URL}/evaluations/recommendations`, {
        headers: authHeaders(),
    });
    return handleResponse(res);
};