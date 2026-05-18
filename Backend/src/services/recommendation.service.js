const { pool } = require('../config/db');

// Emojis que se consideran señal de estado crítico cuando el estrés es alto
const CRITICAL_EMOTIONS = ['😩', '😡', '😰', '😔'];

/**
 * Determina el nivel efectivo para buscar recomendaciones.
 * Si el estrés es 'alto' y la emoción es crítica → nivel 'critico'.
 */
const resolveLevel = (stress_level, emotion_emoji) => {
  if (stress_level === 'alto' && CRITICAL_EMOTIONS.includes(emotion_emoji)) {
    return 'critico';
  }
  return stress_level; // 'bajo' | 'medio' | 'alto'
};

/**
 * Retorna recomendaciones personalizadas basadas en el último registro emocional.
 * Siempre devuelve entre 2 y 3 consejos.
 */
const getRecommendations = async (userId) => {
  // Traer el registro más reciente
  const recordResult = await pool.query(
    `SELECT stress_level, emotion_emoji
     FROM emotional_records
     WHERE user_id = $1
     ORDER BY recorded_at DESC
     LIMIT 1`,
    [userId]
  );

  if (recordResult.rows.length === 0) {
    return { level: null, recommendations: [], show_professional_alert: false };
  }

  const { stress_level, emotion_emoji } = recordResult.rows[0];
  const level = resolveLevel(stress_level, emotion_emoji);

  const { rows } = await pool.query(
    `SELECT id, advice_text, show_professional_alert
     FROM recommendations
     WHERE category = 'emocional' AND trigger_level = $1
     ORDER BY RANDOM()
     LIMIT 3`,
    [level]
  );

  const showAlert = rows.some((r) => r.show_professional_alert);

  return {
    level,
    stress_level,
    emotion_emoji,
    recommendations: rows.map((r) => ({ id: r.id, advice: r.advice_text })),
    show_professional_alert: showAlert,
  };
};

module.exports = { getRecommendations };
