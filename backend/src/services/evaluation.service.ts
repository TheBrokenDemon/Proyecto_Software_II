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
// ════════════════════════════════════════════════════════════════
// R2 — Recomendaciones personalizadas según el estado más reciente
// ════════════════════════════════════════════════════════════════

type Level = 'bajo' | 'medio' | 'alto';

// Mapa de la escala de respuestas a un puntaje 0..4
const SCALE: Record<string, number> = {
  'Nunca': 0,
  'Casi nunca': 1,
  'A veces': 2,
  'Casi siempre': 3,
  'Siempre': 4,
};

interface Recommendation {
  icon: string;
  title: string;
  text: string;
}

// Catálogo de recomendaciones por tipo de evaluación (slug)
const RECOMMENDATION_CATALOG: Record<string, { label: string; recs: Recommendation[] }> = {
  'ansiedad': {
    label: 'ansiedad',
    recs: [
      { icon: '🧘', title: 'Respiración 4-4-4', text: 'Inhala 4s, sostén 4s y exhala 4s durante un par de minutos para calmar tu sistema nervioso.' },
      { icon: '📵', title: 'Reduce estímulos', text: 'Aleja el celular y las notificaciones un rato; el exceso de información alimenta la ansiedad.' },
      { icon: '📝', title: 'Anota tus preocupaciones', text: 'Escribir lo que te inquieta ayuda a ordenar la mente y a verlo con más distancia.' },
    ],
  },
  'estres-academico': {
    label: 'estrés académico',
    recs: [
      { icon: '🗂️', title: 'Divide y prioriza', text: 'Parte las tareas grandes en pasos pequeños y empieza por lo más urgente, no por lo más fácil.' },
      { icon: '⏱️', title: 'Técnica Pomodoro', text: 'Estudia en bloques de 25 min con descansos de 5; rinde más que estudiar horas seguidas.' },
      { icon: '🌳', title: 'Pausas reales', text: 'Programa descansos sin pantallas: una caminata corta baja el estrés y despeja la mente.' },
    ],
  },
  'calidad-sueno': {
    label: 'calidad de sueño',
    recs: [
      { icon: '🌙', title: 'Horario fijo', text: 'Acuéstate y levántate a la misma hora, incluso los fines de semana, para regular tu reloj interno.' },
      { icon: '📱', title: 'Sin pantallas antes de dormir', text: 'Evita el celular 30–60 min antes de acostarte; la luz azul retrasa el sueño.' },
      { icon: '☕', title: 'Cuida la cafeína', text: 'Evita café o bebidas energéticas por la tarde para conciliar el sueño más fácil.' },
    ],
  },
  'bienestar-emocional': {
    label: 'bienestar emocional',
    recs: [
      { icon: '🤝', title: 'Conecta con alguien', text: 'Habla con una persona de confianza; compartir cómo te sientes alivia la carga.' },
      { icon: '🏃', title: 'Mueve el cuerpo', text: 'La actividad física libera endorfinas y mejora el ánimo, aunque sea una caminata diaria.' },
      { icon: '🎯', title: 'Metas pequeñas', text: 'Cumplir objetivos pequeños cada día renueva la sensación de propósito y logro.' },
    ],
  },
};

// Promedio 0..4 de las respuestas según la escala (ignora respuestas desconocidas)
export const averageScore = (answers: string[]): number => {
  const scores = answers
    .map((a) => SCALE[a])
    .filter((n): n is number => n !== undefined);
  return scores.length ? scores.reduce((x, y) => x + y, 0) / scores.length : 0;
};

// Umbrales del nivel: <1.34 bajo · <2.67 medio · resto alto
export const computeLevel = (avg: number): Level =>
  avg < 1.34 ? 'bajo' : avg < 2.67 ? 'medio' : 'alto';

const PROFESSIONAL_REC: Recommendation = {
  icon: '💬',
  title: 'Considera apoyo profesional',
  text: 'Tus respuestas recientes muestran un nivel elevado. Hablar con un psicólogo de la universidad puede ayudarte mucho.',
};

export const getRecommendations = async (userId: string) => {
  // 1) Evaluación más reciente del estudiante
  const { rows: lastRows } = await pool.query(
    `SELECT er.id, er.completed_at, e.slug, e.title
       FROM evaluation_responses er
       JOIN evaluations e ON e.id = er.evaluation_id
      WHERE er.user_id = $1
      ORDER BY er.completed_at DESC
      LIMIT 1`,
    [userId]
  );

  // Escenario 2: sin historial → no hay nada que recomendar
  if (lastRows.length === 0) {
    return { hasHistory: false, recommendations: [] };
  }

  const last = lastRows[0];

  // 2) Respuestas de esa evaluación
  const { rows: answerRows } = await pool.query(
    'SELECT answer FROM response_answers WHERE response_id = $1',
    [last.id]
  );

  // 3) Puntaje promedio 0..4 → nivel
  const avg = averageScore(answerRows.map((r: any) => r.answer));
  const level: Level = computeLevel(avg);

  // 4) Construir recomendaciones según el tipo de test
  const catalog = RECOMMENDATION_CATALOG[last.slug] ?? RECOMMENDATION_CATALOG['bienestar-emocional'];
  const recommendations: Recommendation[] = [...catalog.recs];

  const symptomThemes = ['ansiedad', 'estres-academico', 'calidad-sueno'];
  if (level === 'alto' && symptomThemes.includes(last.slug)) {
    recommendations.push(PROFESSIONAL_REC);
  }

  return {
    hasHistory: true,
    basedOn: {
      evaluation: last.title,
      slug: last.slug,
      label: catalog.label,
      level,
      score: Math.round(avg * 10) / 10,
      completed_at: last.completed_at,
    },
    recommendations,
  };
};
