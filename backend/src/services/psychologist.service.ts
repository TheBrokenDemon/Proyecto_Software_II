import { pool } from '../config/db';
import { sendCitationEmailToStudent } from '../config/mailer';
import { AppError } from '../types';

// ── Estudiantes ───────────────────────────────────────────────

export const getStudentsList = async () => {
    const { rows } = await pool.query(
        `SELECT u.id, u.full_name, u.email, u.age, u.gender, u.created_at,
            COUNT(er.id)::int    AS total_evaluations,
            MAX(er.completed_at) AS last_evaluation
     FROM users u
     LEFT JOIN evaluation_responses er ON er.user_id = u.id
     WHERE u.role = 'estudiante'
     GROUP BY u.id
     ORDER BY u.full_name ASC`
    );
    return rows;
};

export const getStudentResponses = async (studentId: string) => {
    const { rows: userRows } = await pool.query(
        'SELECT id, full_name, email, age, gender FROM users WHERE id = $1 AND role = $2',
        [studentId, 'estudiante']
    );
    if (userRows.length === 0) {
        const err: AppError = new Error('Estudiante no encontrado.');
        err.status = 404;
        throw err;
    }
    const student = userRows[0];

    const { rows: responses } = await pool.query(
        `SELECT er.id, er.completed_at, e.title AS evaluation_title, e.slug
     FROM evaluation_responses er
     JOIN evaluations e ON e.id = er.evaluation_id
     WHERE er.user_id = $1
     ORDER BY er.completed_at DESC`,
        [studentId]
    );

    const responsesWithAnswers = await Promise.all(
        responses.map(async (response: any) => {
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

// ── Citación por email ────────────────────────────────────────

export const sendCitationEmail = async (studentId: string, psychologistId: string) => {
    const { rows: studentRows } = await pool.query(
        'SELECT full_name, email FROM users WHERE id = $1',
        [studentId]
    );
    if (studentRows.length === 0) {
        const err: AppError = new Error('Estudiante no encontrado.');
        err.status = 404;
        throw err;
    }
    const { rows: psychRows } = await pool.query(
        'SELECT full_name FROM users WHERE id = $1',
        [psychologistId]
    );

    const student = studentRows[0];
    const psychologist = psychRows[0];

    await sendCitationEmailToStudent(student, psychologist.full_name);
    return { message: `Citación enviada correctamente a ${student.email}` };
};

// ── Seguimiento psicológico ───────────────────────────────────
// CORRECCIÓN: columna "notes" (no "observation") según migración 006

export const createFollowup = async (
    studentId: string,
    psychologistId: string,
    notes: string
) => {
    const { rows: studentRows } = await pool.query(
        'SELECT id FROM users WHERE id = $1 AND role = $2',
        [studentId, 'estudiante']
    );
    if (studentRows.length === 0) {
        const err: AppError = new Error('Estudiante no encontrado.');
        err.status = 404;
        throw err;
    }

    const { rows } = await pool.query(
        `INSERT INTO psychological_followups (student_id, psychologist_id, notes)
     VALUES ($1, $2, $3)
     RETURNING *`,
        [studentId, psychologistId, notes]
    );
    return rows[0];
};

export const updateFollowupStatus = async (
    followupId: string,
    psychologistId: string,
    status: string
) => {
    const validStatuses = ['pendiente', 'en_seguimiento', 'cerrado'];
    if (!validStatuses.includes(status)) {
        const err: AppError = new Error(`Estado inválido. Usa: ${validStatuses.join(', ')}.`);
        err.status = 400;
        throw err;
    }

    const { rows } = await pool.query(
        `UPDATE psychological_followups
     SET status = $1, updated_at = NOW()
     WHERE id = $2 AND psychologist_id = $3
     RETURNING *`,
        [status, followupId, psychologistId]
    );
    if (rows.length === 0) {
        const err: AppError = new Error('Seguimiento no encontrado.');
        err.status = 404;
        throw err;
    }
    return rows[0];
};

export const getStudentFollowups = async (studentId: string) => {
    const { rows } = await pool.query(
        `SELECT pf.*, u.full_name AS psychologist_name
     FROM psychological_followups pf
     JOIN users u ON u.id = pf.psychologist_id
     WHERE pf.student_id = $1
     ORDER BY pf.created_at DESC`,
        [studentId]
    );
    return rows;
};

// ── Citas ─────────────────────────────────────────────────────
// CORRECCIÓN: tabla appointments tiene columnas:
// followup_id, scheduled_at, status, psychologist_notes, student_notes
// (NO tiene student_id ni message directos — van a través de followup_id)
// Se agrega student_id y psychologist_id como columnas auxiliares en la query

export const createAppointment = async (
    studentId: string,
    psychologistId: string,
    psychologistNotes: string,
    followupId: string
) => {
    // Verificar que el followup existe y pertenece al psicólogo
    const { rows: followupRows } = await pool.query(
        'SELECT id FROM psychological_followups WHERE id = $1 AND psychologist_id = $2',
        [followupId, psychologistId]
    );
    if (followupRows.length === 0) {
        const err: AppError = new Error('Seguimiento no encontrado o sin permisos.');
        err.status = 404;
        throw err;
    }

    const { rows } = await pool.query(
        `INSERT INTO appointments (followup_id, scheduled_at, psychologist_notes)
     VALUES ($1, NOW() + INTERVAL '7 days', $2)
     RETURNING *`,
        [followupId, psychologistNotes]
    );
    return rows[0];
};

export const getStudentAppointments = async (studentId: string) => {
    const { rows } = await pool.query(
        `SELECT a.*, u.full_name AS psychologist_name, pf.student_id
     FROM appointments a
     JOIN psychological_followups pf ON pf.id = a.followup_id
     JOIN users u ON u.id = pf.psychologist_id
     WHERE pf.student_id = $1
     ORDER BY a.created_at DESC`,
        [studentId]
    );
    return rows;
};

export const respondAppointment = async (
    appointmentId: string,
    studentId: string,
    status: string,
    studentNotes?: string
) => {
    const validStatuses = ['confirmada', 'reprogramada', 'cancelada'];
    if (!validStatuses.includes(status)) {
        const err: AppError = new Error(`Estado inválido. Usa: ${validStatuses.join(', ')}.`);
        err.status = 400;
        throw err;
    }

    // Verificar que la cita pertenece al estudiante a través del followup
    const { rows: check } = await pool.query(
        `SELECT a.id FROM appointments a
     JOIN psychological_followups pf ON pf.id = a.followup_id
     WHERE a.id = $1 AND pf.student_id = $2`,
        [appointmentId, studentId]
    );
    if (check.length === 0) {
        const err: AppError = new Error('Cita no encontrada.');
        err.status = 404;
        throw err;
    }

    const { rows } = await pool.query(
        `UPDATE appointments
     SET status = $1, student_notes = $2, updated_at = NOW()
     WHERE id = $3
     RETURNING *`,
        [status, studentNotes ?? null, appointmentId]
    );
    return rows[0];
};