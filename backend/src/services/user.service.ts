import { pool } from '../config/db';
import { AppError } from '../types';

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
    const fields: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (data.full_name) { fields.push(`full_name = $${idx++}`); values.push(data.full_name.trim()); }
    if (data.age) { fields.push(`age = $${idx++}`); values.push(data.age); }
    if (data.gender) { fields.push(`gender = $${idx++}`); values.push(data.gender); }

    if (fields.length === 0) {
        const err: AppError = new Error('No se proporcionaron datos para actualizar.');
        err.status = 400;
        throw err;
    }

    values.push(userId);
    const { rows } = await pool.query(
        `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, full_name, email, age, gender, role`,
        values
    );
    return rows[0];
};