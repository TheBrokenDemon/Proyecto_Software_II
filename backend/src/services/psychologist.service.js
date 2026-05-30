const { pool } = require('../config/db');

const getStudentsList = async () => {
  const { rows } = await pool.query(
    `SELECT u.id, u.full_name, u.email, u.age, u.gender, u.created_at,
            COUNT(er.id)::int        AS total_evaluations,
            MAX(er.completed_at)     AS last_evaluation
     FROM users u
     LEFT JOIN evaluation_responses er ON er.user_id = u.id
     WHERE u.role = 'estudiante'
     GROUP BY u.id
     ORDER BY u.full_name ASC`
  );
  return rows;
};

const getStudentResponses = async (studentId) => {
  const userResult = await pool.query(
    'SELECT id, full_name, email, age, gender FROM users WHERE id = $1 AND role = $2',
    [studentId, 'estudiante']
  );

  if (userResult.rows.length === 0) {
    const err = new Error('Estudiante no encontrado.');
    err.status = 404;
    throw err;
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

const sendCitationEmail = async (studentId, psychologistId) => {
  const studentResult = await pool.query(
    'SELECT full_name, email FROM users WHERE id = $1',
    [studentId]
  );
  const psychResult = await pool.query(
    'SELECT full_name FROM users WHERE id = $1',
    [psychologistId]
  );

  if (studentResult.rows.length === 0) {
    const err = new Error('Estudiante no encontrado.');
    err.status = 404;
    throw err;
  }

  const student = studentResult.rows[0];
  const psychologist = psychResult.rows[0];

  const { sendCitationEmailToStudent } = require('../config/mailer');
  await sendCitationEmailToStudent(student, psychologist.full_name);

  return { message: `Citación enviada correctamente a ${student.email}` };
};

module.exports = { getStudentsList, getStudentResponses, sendCitationEmail };