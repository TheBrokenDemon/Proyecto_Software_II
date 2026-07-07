import { pool } from '../config/db';

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
export const upsertTodayCheckin = async (userId: string, mood: number, note?: string | null) => {
  const { rows } = await pool.query(
    `INSERT INTO mood_checkins (user_id, mood, note)
       VALUES ($1, $2, $3)
     ON CONFLICT (user_id, checkin_date)
       DO UPDATE SET mood = EXCLUDED.mood, note = EXCLUDED.note, created_at = NOW()
     RETURNING ${SELECT_FIELDS}`,
    [userId, mood, note ?? null]
  );
  return rows[0];
};

// Check-in de hoy (o null si aún no marcó)
export const getTodayCheckin = async (userId: string) => {
  const { rows } = await pool.query(
    `SELECT ${SELECT_FIELDS}
       FROM mood_checkins
      WHERE user_id = $1 AND checkin_date = CURRENT_DATE
      LIMIT 1`,
    [userId]
  );
  return rows[0] ?? null;
};

// Historial reciente + racha de días consecutivos
export const getCheckinHistory = async (userId: string, days = 14) => {
  const { rows } = await pool.query(
    `SELECT ${SELECT_FIELDS}
       FROM mood_checkins
      WHERE user_id = $1
      ORDER BY checkin_date DESC
      LIMIT $2`,
    [userId, days]
  );
  const streak = computeStreak(rows.map((r: any) => r.checkin_date));
  return { history: rows, streak };
};

// Fecha local 'YYYY-MM-DD' sin desfase de zona horaria
const localISO = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

// Racha de días consecutivos terminando hoy (o ayer si aún no marcó hoy)
export const computeStreak = (dates: string[]): number => {
  const set = new Set(dates);
  const cursor = new Date();

  // Si no marcó hoy pero sí ayer, la racha empieza ayer
  if (!set.has(localISO(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
    if (!set.has(localISO(cursor))) return 0;
  }

  let streak = 0;
  while (set.has(localISO(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};
