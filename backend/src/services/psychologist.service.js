/**
 * psychologist.service.js
 *
 * Patrones aplicados:
 *   - Repository : Cada función abstrae el acceso a datos (capa DB)
 *   - Builder    : QueryBuilder arma queries complejas paso a paso
 */

const { pool } = require('../config/db');

// ─── Builder Pattern (ligero) ─────────────────────────────────────────────────
// Construye el SELECT de estudiantes de forma legible y extensible.
class StudentQueryBuilder {
  constructor() {
    this._fields = [
      'u.id', 'u.full_name', 'u.email', 'u.age', 'u.gender', 'u.created_at',
      'COUNT(er.id)::int AS total_evaluations',
      'MAX(er.completed_at) AS last_evaluation',
    ];
    this._joins   = ["LEFT JOIN evaluation_responses er ON er.user_id = u.id"];
    this._where   = ["u.role = 'estudiante'"];
    this._orderBy = "u.full_name ASC";
  }

  withContactFlag() {
    this._fields.push(
      'COALESCE(pf.flagged, FALSE) AS flagged_for_contact',
      'pf.flagged_at',
    );
    this._joins.push(
      "LEFT JOIN psychologist_flags pf ON pf.student_id = u.id AND pf.active = TRUE"
    );
    return this;
  }

  build() {
    return `
      SELECT ${this._fields.join(', ')}
      FROM users u
      ${this._joins.join('\n')}
      WHERE ${this._where.join(' AND ')}
      GROUP BY u.id, pf.flagged, pf.flagged_at
      ORDER BY ${this._orderBy}
    `;
  }
}

// ─── Repository Pattern ───────────────────────────────────────────────────────

const getStudentsList = async () => {
  const query = new StudentQueryBuilder().withContactFlag().build();
  const { rows } = await pool.query(query);
  return rows;
};

const getStudentResponses = async (studentId) => {
  const userResult = await pool.query(
    'SELECT id, full_name, email, age, gender FROM users WHERE id = $1 AND role = $2',
    [studentId, 'estudiante']
  );
  if (userResult.rows.length === 0) {
    const err = new Error('Estudiante no encontrado.'); err.status = 404; throw err;
  }

  const student = userResult.rows[0];

  const { rows: responses } = await pool.query(
    `SELECT er.id, er.completed_at, e.title AS evaluation_title, e.slug
     FROM evaluation_responses er
     JOIN evaluations e ON e.id = er.evaluation_id
     WHERE er.user_id = $1
     ORDER BY er.completed_at DESC`,
    [studentId]
  );

  const responsesWithAnswers = await Promise.all(
    responses.map(async (response) => {
      const { rows: answers } = await pool.query(
        `SELECT q.content AS question, q.order_index, ra.answer
         FROM response_answers ra
         JOIN questions q ON q.id = ra.question_id
         WHERE ra.response_id = $1
         ORDER BY q.order_index ASC`,
        [response.id]
      );
      return { ...response, answers };
    })
  );

  return { student, responses: responsesWithAnswers };
};

const addObservation = async (studentId, psychologistId, text) => {
  const { rows } = await pool.query(
    `INSERT INTO psychologist_observations (student_id, psychologist_id, text)
     VALUES ($1, $2, $3)
     RETURNING id, student_id, psychologist_id, text, created_at`,
    [studentId, psychologistId, text]
  );
  return rows[0];
};

const getObservations = async (studentId) => {
  const { rows } = await pool.query(
    `SELECT po.id, po.text, po.created_at,
            u.full_name AS psychologist_name
     FROM psychologist_observations po
     JOIN users u ON u.id = po.psychologist_id
     WHERE po.student_id = $1
     ORDER BY po.created_at DESC`,
    [studentId]
  );
  return rows;
};

const flagStudentForContact = async (studentId, psychologistId) => {
  await pool.query(
    `INSERT INTO psychologist_flags (student_id, psychologist_id, flagged, active, flagged_at)
     VALUES ($1, $2, TRUE, TRUE, NOW())
     ON CONFLICT (student_id) DO UPDATE SET flagged = TRUE, active = TRUE, flagged_at = NOW(), psychologist_id = $2`,
    [studentId, psychologistId]
  );
};

module.exports = { getStudentsList, getStudentResponses, addObservation, getObservations, flagStudentForContact };
