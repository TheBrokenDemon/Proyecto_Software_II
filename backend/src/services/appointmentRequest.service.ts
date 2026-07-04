import { pool } from '../config/db';

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
export const createRequest = async (
  studentId: string,
  reason: string,
  preferredDate?: string | null
) => {
  const { rows } = await pool.query(
    `INSERT INTO appointment_requests (student_id, reason, preferred_date)
       VALUES ($1, $2, $3)
     RETURNING
       id, reason,
       TO_CHAR(preferred_date, 'YYYY-MM-DD') AS preferred_date,
       status, response_note,
       TO_CHAR(confirmed_date, 'YYYY-MM-DD') AS confirmed_date,
       created_at`,
    [studentId, reason, preferredDate ?? null]
  );
  return rows[0];
};
// Estudiante ve sus solicitudes (con el psicólogo que respondió, si hay)
export const getMyRequests = async (studentId: string) => {
  const { rows } = await pool.query(
    `SELECT ${FIELDS}, u.full_name AS psychologist_name
       FROM appointment_requests ar
       LEFT JOIN users u ON u.id = ar.psychologist_id
      WHERE ar.student_id = $1
      ORDER BY ar.created_at DESC`,
    [studentId]
  );
  return rows;
};

// Estudiante cancela una solicitud (solo si aún está 'solicitada')
export const cancelRequest = async (requestId: string, studentId: string) => {
  const { rows } = await pool.query(
    `UPDATE appointment_requests
        SET status = 'cancelada'
      WHERE id = $1 AND student_id = $2 AND status = 'solicitada'
      RETURNING
        id, reason,
        TO_CHAR(preferred_date, 'YYYY-MM-DD') AS preferred_date,
        status, response_note,
        TO_CHAR(confirmed_date, 'YYYY-MM-DD') AS confirmed_date,
        created_at`,
    [requestId, studentId]
  );
  return rows[0] ?? null;
};

// Psicólogo responde: confirmar / reprogramar / rechazar
export const respondRequest = async (
  requestId: string,
  psychologistId: string,
  status: 'confirmada' | 'reprogramada' | 'rechazada',
  responseNote?: string | null,
  confirmedDate?: string | null
) => {
  const { rows } = await pool.query(
    `UPDATE appointment_requests
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
        created_at`,
    [status, responseNote ?? null, confirmedDate ?? null, psychologistId, requestId]
  );
  return rows[0] ?? null;
};

// Psicólogo: lista todas las solicitudes (las 'solicitada' primero)
export const listRequests = async () => {
  const { rows } = await pool.query(
    `SELECT ${FIELDS},
            s.full_name AS student_name, s.email AS student_email
       FROM appointment_requests ar
       JOIN users s ON s.id = ar.student_id
      ORDER BY CASE ar.status WHEN 'solicitada' THEN 0 ELSE 1 END,
               ar.created_at DESC`
  );
  return rows;
};

