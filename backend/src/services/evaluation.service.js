const { pool } = require('../config/db');
const { EvaluationFactory } = require('../utils/Factories');

/**
 * Obtiene todas las evaluaciones activas.
 */
const getActiveEvaluations = async () => {
  const { rows } = await pool.query(
    'SELECT id, title, slug, description, icon FROM evaluations WHERE is_active = TRUE ORDER BY created_at'
  );
  return rows;
};

/**
 * Obtiene una evaluación específica con sus preguntas, usando su slug.
 */
const getEvaluationWithQuestions = async (slug) => {
  // Primero, obtenemos la evaluación
  const evaluationResult = await pool.query('SELECT * FROM evaluations WHERE slug = $1', [slug]);
  if (evaluationResult.rows.length === 0) {
    const error = new Error('La evaluación no fue encontrada.');
    error.status = 404;
    throw error;
  }
  const evaluation = evaluationResult.rows[0];

  // Luego, obtenemos sus preguntas ordenadas
  const questionsResult = await pool.query(
    'SELECT id, content, type, options, required FROM questions WHERE evaluation_id = $1 ORDER BY order_index ASC',
    [evaluation.id]
  );

  evaluation.questions = questionsResult.rows;
  return evaluation;
};

/**
 * Guarda las respuestas de una evaluación para un usuario.
 */
const submitEvaluationResponses = async (userId, evaluationSlug, answers) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Obtener el ID de la evaluación a partir del slug
    const evalRes = await client.query('SELECT id FROM evaluations WHERE slug = $1', [evaluationSlug]);
    if (evalRes.rows.length === 0) {
      throw new Error('Evaluación no válida.');
    }
    const evaluationId = evalRes.rows[0].id;

    // 2. Crear una nueva entrada en la tabla de respuestas
    const responseQuery = 'INSERT INTO evaluation_responses (user_id, evaluation_id, answers) VALUES ($1, $2, $3) RETURNING id, completed_at';
    const responseValues = [userId, evaluationId, JSON.stringify(answers)];
    const responseResult = await client.query(responseQuery, responseValues);

    await client.query('COMMIT');

    return {
      message: 'Encuesta completada con éxito.',
      response: responseResult.rows[0],
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al guardar las respuestas de la encuesta:', error);
    throw new Error('No se pudieron guardar las respuestas.');
  } finally {
    client.release();
  }
};

module.exports = {
  getActiveEvaluations,
  getEvaluationWithQuestions,
  submitEvaluationResponses,
  // getMyHistory se implementaría aquí también
};