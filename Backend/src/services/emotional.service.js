const { pool } = require('../config/db');

// Emojis válidos que puede seleccionar el estudiante
const VALID_EMOTIONS = [
  { emoji: '😊', label: 'Feliz' },
  { emoji: '😌', label: 'Tranquilo' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😔', label: 'Triste' },
  { emoji: '😰', label: 'Ansioso' },
  { emoji: '😤', label: 'Frustrado' },
  { emoji: '😩', label: 'Agotado' },
  { emoji: '😡', label: 'Enojado' },
];

const VALID_EMOJIS = VALID_EMOTIONS.map((e) => e.emoji);

/**
 * Crea un nuevo registro emocional.
 */
const createEmotionalRecord = async (userId, { stress_level, emotion_emoji, emotion_label, notes }) => {
  if (!VALID_EMOJIS.includes(emotion_emoji)) {
    const err = new Error('Emoji no válido. Usa uno de los disponibles en la plataforma.');
    err.status = 400;
    throw err;
  }

  // Obtener el id del tipo de evaluación 'emocional'
  const typeResult = await pool.query(
    "SELECT id FROM evaluation_types WHERE slug = 'emocional' AND is_active = TRUE"
  );
  if (typeResult.rows.length === 0) {
    const err = new Error('Tipo de evaluación no disponible.');
    err.status = 503;
    throw err;
  }
  const evaluationTypeId = typeResult.rows[0].id;

  const { rows } = await pool.query(
    `INSERT INTO emotional_records
       (user_id, evaluation_type_id, stress_level, emotion_emoji, emotion_label, notes)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, stress_level, emotion_emoji, emotion_label, notes, recorded_at`,
    [userId, evaluationTypeId, stress_level, emotion_emoji, emotion_label, notes ?? null]
  );

  return rows[0];
};

/**
 * Retorna el historial de registros emocionales del usuario, paginado.
 */
const getEmotionalHistory = async (userId, { page = 1, limit = 10 } = {}) => {
  const offset = (page - 1) * limit;

  const { rows } = await pool.query(
    `SELECT id, stress_level, emotion_emoji, emotion_label, notes, recorded_at
     FROM emotional_records
     WHERE user_id = $1
     ORDER BY recorded_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const countResult = await pool.query(
    'SELECT COUNT(*) FROM emotional_records WHERE user_id = $1',
    [userId]
  );
  const total = parseInt(countResult.rows[0].count, 10);

  return {
    data: rows,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
};

/**
 * Retorna los emojis disponibles para mostrar en el frontend.
 */
const getAvailableEmotions = () => VALID_EMOTIONS;

module.exports = { createEmotionalRecord, getEmotionalHistory, getAvailableEmotions };
