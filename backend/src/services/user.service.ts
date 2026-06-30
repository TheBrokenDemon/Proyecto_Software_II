import { pool } from '../config/db';
import { AppError } from '../types';
import { UserQueryBuilder } from '../utils/QueryBuilder';

export const getUserById = async (userId: string) => {
    const { rows } = await pool.query(
        'SELECT id, full_name, email, age, gender, role FROM users WHERE id = $1',
        [userId]
    );
    if (rows.length === 0) {
        const err: AppError = new Error('Usuario no encontrado.');
        err.status = 404;
        throw err;
    }
    return rows[0];
};

export const updateUser = async (
  userId: string,
  data: { full_name?: string; age?: number; gender?: string }
) => {
  if (data.age !== undefined) {
    if (data.age < 18) {
      const err: AppError = new Error('Debes ser mayor de edad (mínimo 18 años).');
      err.status = 400;
      throw err;
    }
    if (data.age > 80) {
      const err: AppError = new Error('La edad no puede superar los 80 años.');
      err.status = 400;
      throw err;
    }
  }

  // Patrón Builder — construye la query dinámicamente
  const builder = new UserQueryBuilder();
  if (data.full_name)                              builder.setFullName(data.full_name);
  if (data.age !== undefined)                      builder.setAge(data.age);
  if (data.gender !== undefined && data.gender !== '') builder.setGender(data.gender);

  const { query, values } = builder.build(userId);
  const { rows } = await pool.query(query, values);
  return rows[0];
};