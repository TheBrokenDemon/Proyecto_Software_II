// Patrón Repository — abstrae todas las queries de BD
// en una capa separada de los servicios
import { pool } from '../config/db';

export class UserRepository {
  static async findByEmail(email: string) {
    const { rows } = await pool.query(
      'SELECT id, full_name, email, password_hash, role FROM users WHERE email = $1',
      [email.toLowerCase()]
    );
    return rows[0] || null;
  }

  static async findById(id: string) {
    const { rows } = await pool.query(
      'SELECT id, full_name, email, age, gender, role FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  }

  static async create(data: {
    full_name: string;
    email: string;
    password_hash: string;
    age?: number | null;
    gender?: string | null;
    role: string;
  }) {
    const { rows } = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, age, gender, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, full_name, email, age, gender, role, created_at`,
      [data.full_name, data.email, data.password_hash, data.age ?? null, data.gender ?? null, data.role]
    );
    return rows[0];
  }

  static async findAllStudents() {
    const { rows } = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.age, u.gender,
              COUNT(er.id)::int    AS total_evaluations,
              MAX(er.completed_at) AS last_evaluation
       FROM users u
       LEFT JOIN evaluation_responses er ON er.user_id = u.id
       WHERE u.role = 'estudiante'
       GROUP BY u.id
       ORDER BY u.full_name ASC`
    );
    return rows;
  }
  static async updateTheme(userId: string, theme: string) {
  const { rows } = await pool.query(
    `UPDATE users SET theme = $1 WHERE id = $2 RETURNING id, theme`,
    [theme, userId]
  );
  return rows[0];
}


}
