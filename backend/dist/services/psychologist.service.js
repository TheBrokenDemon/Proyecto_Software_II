"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondAppointment = exports.getStudentAppointments = exports.createAppointment = exports.getStudentFollowups = exports.updateFollowupStatus = exports.createFollowup = exports.sendCitationEmail = exports.getStudentResponses = exports.getStudentsList = void 0;
const db_1 = require("../config/db");
const mailer_1 = require("../config/mailer");
// ── Estudiantes ───────────────────────────────────────────────
const getStudentsList = async () => {
    const { rows } = await db_1.pool.query(`WITH latest_response AS (
            SELECT DISTINCT ON (er.user_id) er.user_id, er.id AS response_id
              FROM evaluation_responses er
             ORDER BY er.user_id, er.completed_at DESC
         ),
         risk AS (
            SELECT lr.user_id,
                   AVG(CASE ra.answer
                         WHEN 'Nunca'        THEN 0
                         WHEN 'Casi nunca'   THEN 1
                         WHEN 'A veces'      THEN 2
                         WHEN 'Casi siempre' THEN 3
                         WHEN 'Siempre'      THEN 4
                       END) AS avg_score
              FROM latest_response lr
              JOIN response_answers ra ON ra.response_id = lr.response_id
             GROUP BY lr.user_id
         )
         SELECT u.id, u.full_name, u.email, u.age, u.gender, u.created_at,
                COUNT(er.id)::int    AS total_evaluations,
                MAX(er.completed_at) AS last_evaluation,
                r.avg_score
           FROM users u
           LEFT JOIN evaluation_responses er ON er.user_id = u.id
           LEFT JOIN risk r ON r.user_id = u.id
          WHERE u.role = 'estudiante'
          GROUP BY u.id, r.avg_score
          ORDER BY u.full_name ASC`);
    // Mapea el promedio a un nivel de riesgo (mismo criterio que la R2)
    return rows.map((row) => {
        const avg = row.avg_score !== null ? Number(row.avg_score) : null;
        let risk_level;
        if (avg === null)
            risk_level = 'sin_datos';
        else if (avg < 1.34)
            risk_level = 'bajo';
        else if (avg < 2.67)
            risk_level = 'medio';
        else
            risk_level = 'alto';
        const { avg_score, ...rest } = row;
        return { ...rest, risk_level };
    });
};
exports.getStudentsList = getStudentsList;
const getStudentResponses = async (studentId) => {
    const { rows: userRows } = await db_1.pool.query('SELECT id, full_name, email, age, gender FROM users WHERE id = $1 AND role = $2', [studentId, 'estudiante']);
    if (userRows.length === 0) {
        const err = new Error('Estudiante no encontrado.');
        err.status = 404;
        throw err;
    }
    const student = userRows[0];
    const { rows: responses } = await db_1.pool.query(`SELECT er.id, er.completed_at, e.title AS evaluation_title, e.slug
     FROM evaluation_responses er
     JOIN evaluations e ON e.id = er.evaluation_id
     WHERE er.user_id = $1
     ORDER BY er.completed_at DESC`, [studentId]);
    const responsesWithAnswers = await Promise.all(responses.map(async (response) => {
        const { rows: answers } = await db_1.pool.query(`SELECT q.content AS question, q.order_index, ra.answer
         FROM response_answers ra
         JOIN questions q ON q.id = ra.question_id
         WHERE ra.response_id = $1
         ORDER BY q.order_index ASC`, [response.id]);
        return { ...response, answers };
    }));
    // Check-ins de ánimo recientes del estudiante (carita + nota)
    const { rows: moodCheckins } = await db_1.pool.query(`SELECT mood, note, TO_CHAR(checkin_date, 'YYYY-MM-DD') AS checkin_date
           FROM mood_checkins
          WHERE user_id = $1
          ORDER BY checkin_date DESC
          LIMIT 14`, [studentId]);
    return { student, responses: responsesWithAnswers, moodCheckins };
};
exports.getStudentResponses = getStudentResponses;
// ── Citación por email ────────────────────────────────────────
const sendCitationEmail = async (studentId, psychologistId) => {
    const { rows: studentRows } = await db_1.pool.query('SELECT full_name, email FROM users WHERE id = $1', [studentId]);
    if (studentRows.length === 0) {
        const err = new Error('Estudiante no encontrado.');
        err.status = 404;
        throw err;
    }
    const { rows: psychRows } = await db_1.pool.query('SELECT full_name FROM users WHERE id = $1', [psychologistId]);
    const student = studentRows[0];
    const psychologist = psychRows[0];
    await (0, mailer_1.sendCitationEmailToStudent)(student, psychologist.full_name);
    return { message: `Citación enviada correctamente a ${student.email}` };
};
exports.sendCitationEmail = sendCitationEmail;
// ── Seguimiento psicológico ───────────────────────────────────
// CORRECCIÓN: columna "notes" (no "observation") según migración 006
const createFollowup = async (studentId, psychologistId, notes) => {
    const { rows: studentRows } = await db_1.pool.query('SELECT id FROM users WHERE id = $1 AND role = $2', [studentId, 'estudiante']);
    if (studentRows.length === 0) {
        const err = new Error('Estudiante no encontrado.');
        err.status = 404;
        throw err;
    }
    const { rows } = await db_1.pool.query(`INSERT INTO psychological_followups (student_id, psychologist_id, notes)
     VALUES ($1, $2, $3)
     RETURNING *`, [studentId, psychologistId, notes]);
    return rows[0];
};
exports.createFollowup = createFollowup;
const updateFollowupStatus = async (followupId, psychologistId, status) => {
    const validStatuses = ['pendiente', 'en_seguimiento', 'cerrado'];
    if (!validStatuses.includes(status)) {
        const err = new Error(`Estado inválido. Usa: ${validStatuses.join(', ')}.`);
        err.status = 400;
        throw err;
    }
    const { rows } = await db_1.pool.query(`UPDATE psychological_followups
     SET status = $1, updated_at = NOW()
     WHERE id = $2 AND psychologist_id = $3
     RETURNING *`, [status, followupId, psychologistId]);
    if (rows.length === 0) {
        const err = new Error('Seguimiento no encontrado.');
        err.status = 404;
        throw err;
    }
    return rows[0];
};
exports.updateFollowupStatus = updateFollowupStatus;
const getStudentFollowups = async (studentId) => {
    const { rows } = await db_1.pool.query(`SELECT pf.*, u.full_name AS psychologist_name
     FROM psychological_followups pf
     JOIN users u ON u.id = pf.psychologist_id
     WHERE pf.student_id = $1
     ORDER BY pf.created_at DESC`, [studentId]);
    return rows;
};
exports.getStudentFollowups = getStudentFollowups;
// ── Citas ─────────────────────────────────────────────────────
// CORRECCIÓN: tabla appointments tiene columnas:
// followup_id, scheduled_at, status, psychologist_notes, student_notes
// (NO tiene student_id ni message directos — van a través de followup_id)
// Se agrega student_id y psychologist_id como columnas auxiliares en la query
const createAppointment = async (studentId, psychologistId, psychologistNotes, followupId) => {
    // Verificar que el followup existe y pertenece al psicólogo
    const { rows: followupRows } = await db_1.pool.query('SELECT id FROM psychological_followups WHERE id = $1 AND psychologist_id = $2', [followupId, psychologistId]);
    if (followupRows.length === 0) {
        const err = new Error('Seguimiento no encontrado o sin permisos.');
        err.status = 404;
        throw err;
    }
    const { rows } = await db_1.pool.query(`INSERT INTO appointments (followup_id, scheduled_at, psychologist_notes)
     VALUES ($1, NOW() + INTERVAL '7 days', $2)
     RETURNING *`, [followupId, psychologistNotes]);
    return rows[0];
};
exports.createAppointment = createAppointment;
const getStudentAppointments = async (studentId) => {
    const { rows } = await db_1.pool.query(`SELECT a.*, u.full_name AS psychologist_name, pf.student_id
     FROM appointments a
     JOIN psychological_followups pf ON pf.id = a.followup_id
     JOIN users u ON u.id = pf.psychologist_id
     WHERE pf.student_id = $1
     ORDER BY a.created_at DESC`, [studentId]);
    return rows;
};
exports.getStudentAppointments = getStudentAppointments;
const respondAppointment = async (appointmentId, studentId, status, studentNotes) => {
    const validStatuses = ['confirmada', 'reprogramada', 'cancelada'];
    if (!validStatuses.includes(status)) {
        const err = new Error(`Estado inválido. Usa: ${validStatuses.join(', ')}.`);
        err.status = 400;
        throw err;
    }
    // Verificar que la cita pertenece al estudiante a través del followup
    const { rows: check } = await db_1.pool.query(`SELECT a.id FROM appointments a
     JOIN psychological_followups pf ON pf.id = a.followup_id
     WHERE a.id = $1 AND pf.student_id = $2`, [appointmentId, studentId]);
    if (check.length === 0) {
        const err = new Error('Cita no encontrada.');
        err.status = 404;
        throw err;
    }
    const { rows } = await db_1.pool.query(`UPDATE appointments
     SET status = $1, student_notes = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`, [status, studentNotes ?? null, appointmentId]);
    return rows[0];
};
exports.respondAppointment = respondAppointment;
