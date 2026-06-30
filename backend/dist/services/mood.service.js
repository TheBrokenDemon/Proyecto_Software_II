"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCheckinHistory = exports.getTodayCheckin = exports.upsertTodayCheckin = void 0;
const db_1 = require("../config/db");
// ════════════════════════════════════════════════════════════════
// Check-in diario de ánimo (1 por día por estudiante)
// ════════════════════════════════════════════════════════════════
const SELECT_FIELDS = `
  id,
  mood,
  note,
  TO_CHAR(checkin_date, 'YYYY-MM-DD') AS checkin_date,
  created_at
`;
// Crea o actualiza el check-in de HOY (garantiza 1 por día)
const upsertTodayCheckin = async (userId, mood, note) => {
    const { rows } = await db_1.pool.query(`INSERT INTO mood_checkins (user_id, mood, note)
       VALUES ($1, $2, $3)
     ON CONFLICT (user_id, checkin_date)
       DO UPDATE SET mood = EXCLUDED.mood, note = EXCLUDED.note, created_at = NOW()
     RETURNING ${SELECT_FIELDS}`, [userId, mood, note ?? null]);
    return rows[0];
};
exports.upsertTodayCheckin = upsertTodayCheckin;
// Check-in de hoy (o null si aún no marcó)
const getTodayCheckin = async (userId) => {
    const { rows } = await db_1.pool.query(`SELECT ${SELECT_FIELDS}
       FROM mood_checkins
      WHERE user_id = $1 AND checkin_date = CURRENT_DATE
      LIMIT 1`, [userId]);
    return rows[0] ?? null;
};
exports.getTodayCheckin = getTodayCheckin;
// Historial reciente + racha de días consecutivos
const getCheckinHistory = async (userId, days = 14) => {
    const { rows } = await db_1.pool.query(`SELECT ${SELECT_FIELDS}
       FROM mood_checkins
      WHERE user_id = $1
      ORDER BY checkin_date DESC
      LIMIT $2`, [userId, days]);
    const streak = computeStreak(rows.map((r) => r.checkin_date));
    return { history: rows, streak };
};
exports.getCheckinHistory = getCheckinHistory;
// Fecha local 'YYYY-MM-DD' sin desfase de zona horaria
const localISO = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
};
// Racha de días consecutivos terminando hoy (o ayer si aún no marcó hoy)
const computeStreak = (dates) => {
    const set = new Set(dates);
    const cursor = new Date();
    // Si no marcó hoy pero sí ayer, la racha empieza ayer
    if (!set.has(localISO(cursor))) {
        cursor.setDate(cursor.getDate() - 1);
        if (!set.has(localISO(cursor)))
            return 0;
    }
    let streak = 0;
    while (set.has(localISO(cursor))) {
        streak++;
        cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
};
