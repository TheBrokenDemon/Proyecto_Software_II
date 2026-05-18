const { pool } = require('../config/db');

/**
 * Retorna los tipos de evaluación activos para mostrar en el dashboard.
 */
const getActiveEvaluationTypes = async () => {
  const { rows } = await pool.query(
    `SELECT id, name, slug, description, icon
     FROM evaluation_types
     WHERE is_active = TRUE
     ORDER BY name ASC`
  );
  return rows;
};

module.exports = { getActiveEvaluationTypes };
