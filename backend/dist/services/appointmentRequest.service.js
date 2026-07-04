"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondRequest = exports.MAX_STUDENTS_PER_PSYCHOLOGIST = exports.listRequests = exports.cancelRequest = exports.getMyRequests = exports.createRequest = void 0;
const db_1 = require("../config/db");
// ════════════════════════════════════════════════════════════════
// Solicitudes de cita (el estudiante solicita, el psicólogo responde)
// ════════════════════════════════════════════════════════════════
const FIELDS = `
  ar.id, ar.reason,
  TO_CHAR(ar.preferred_date, 'YYYY-MM-DD') AS preferred_date,
  ar.status, ar.response_note,
  TO_CHAR(ar.confirmed_date, 'YYYY-MM-DD') AS confirmed_date,
  ar.created_at
`;
// Estudiante crea una solicitud
const createRequest = async (studentId, reason, preferredDate) => {
    const { rows } = await db_1.pool.query(`INSERT INTO appointment_requests (student_id, reason, preferred_date)
       VALUES ($1, $2, $3)
     RETURNING
       id, reason,
       TO_CHAR(preferred_date, 'YYYY-MM-DD') AS preferred_date,
       status, response_note,
       TO_CHAR(confirmed_date, 'YYYY-MM-DD') AS confirmed_date,
       created_at`, [studentId, reason, preferredDate ?? null]);
    return rows[0];
};
exports.createRequest = createRequest;
// Estudiante ve sus solicitudes (con el psicólogo que respondió, si hay)
const getMyRequests = async (studentId) => {
    const { rows } = await db_1.pool.query(`SELECT ${FIELDS}, u.full_name AS psychologist_name
       FROM appointment_requests ar
       LEFT JOIN users u ON u.id = ar.psychologist_id
      WHERE ar.student_id = $1
      ORDER BY ar.created_at DESC`, [studentId]);
    return rows;
};
exports.getMyRequests = getMyRequests;
// Estudiante cancela una solicitud (solo si aún está 'solicitada')
const cancelRequest = async (requestId, studentId) => {
    const { rows } = await db_1.pool.query(`UPDATE appointment_requests
        SET status = 'cancelada'
      WHERE id = $1 AND student_id = $2 AND status = 'solicitada'
      RETURNING
       id, reason,
       TO_CHAR(preferred_date, 'YYYY-MM-DD') AS preferred_date,
       status, response_note,
       TO_CHAR(confirmed_date, 'YYYY-MM-DD') AS confirmed_date,
       created_at`, [requestId, studentId]);
    return rows[0] ?? null;
};
exports.cancelRequest = cancelRequest;
// Psicólogo: lista todas las solicitudes (las 'solicitada' primero)
const listRequests = async () => {
    const { rows } = await db_1.pool.query(`SELECT ${FIELDS},
            s.full_name AS student_name, s.email AS student_email,
            p.full_name AS psychologist_name
       FROM appointment_requests ar
       JOIN users s ON s.id = ar.student_id
       LEFT JOIN users p ON p.id = ar.psychologist_id
      ORDER BY CASE ar.status WHEN 'solicitada' THEN 0 ELSE 1 END,
               ar.created_at DESC`);
    return rows;
};
exports.listRequests = listRequests;
// Psicólogo responde: confirmar / reprogramar / rechazar
exports.MAX_STUDENTS_PER_PSYCHOLOGIST = 6;
const respondRequest = async (requestId, psychologistId, status, responseNote, confirmedDate) => {
    // 1) Ubicar la solicitud y su estudiante
    const { rows: reqRows } = await db_1.pool.query('SELECT student_id FROM appointment_requests WHERE id = $1', [requestId]);
    if (reqRows.length === 0)
        return null;
    const studentId = reqRows[0].student_id;
    // 2) Si el psicólogo ATIENDE (confirma/reprograma) → asignación + cupo
    if (status === 'confirmada' || status === 'reprogramada') {
        const { rows: sRows } = await db_1.pool.query('SELECT assigned_psychologist_id FROM users WHERE id = $1', [studentId]);
        const current = sRows[0]?.assigned_psychologist_id;
        // Ya lo atiende otro psicólogo → no puede atenderlo
        if (current && current !== psychologistId) {
            const err = new Error('Este estudiante ya está asignado a otro psicólogo.');
            err.status = 409;
            throw err;
        }
        // Sin asignar → verificar cupo y asignárselo
        if (!current) {
            const { rows: cntRows } = await db_1.pool.query('SELECT COUNT(*)::int AS total FROM users WHERE assigned_psychologist_id = $1', [psychologistId]);
            if (cntRows[0].total >= exports.MAX_STUDENTS_PER_PSYCHOLOGIST) {
                const err = new Error(`Has alcanzado tu cupo máximo de ${exports.MAX_STUDENTS_PER_PSYCHOLOGIST} estudiantes.`);
                err.status = 409;
                throw err;
            }
            await db_1.pool.query('UPDATE users SET assigned_psychologist_id = $1 WHERE id = $2', [psychologistId, studentId]);
        }
    }
    // 3) Actualizar la solicitud
    const { rows } = await db_1.pool.query(`UPDATE appointment_requests
        SET status = $1,
            response_note = $2,
            confirmed_date = $3,
            psychologist_id = $4
      WHERE id = $5
      RETURNING
        id, reason,
        TO_CHAR(preferred_date, 'YYYY-MM-DD') AS preferred_date,
        status, response_note,
        TO_CHAR(confirmed_date, 'YYYY-MM-DD') AS confirmed_date,
        created_at`, [status, responseNote ?? null, confirmedDate ?? null, psychologistId, requestId]);
    return rows[0] ?? null;
};
exports.respondRequest = respondRequest;
