"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getUserById = void 0;
const db_1 = require("../config/db");
const getUserById = async (userId) => {
    const { rows } = await db_1.pool.query('SELECT id, full_name, email, age, gender, role FROM users WHERE id = $1', [userId]);
    if (rows.length === 0) {
        const err = new Error('Usuario no encontrado.');
        err.status = 404;
        throw err;
    }
    return rows[0];
};
exports.getUserById = getUserById;
const updateUser = async (userId, data) => {
    const fields = [];
    const values = [];
    let idx = 1;
    if (data.full_name) {
        fields.push(`full_name = $${idx++}`);
        values.push(data.full_name.trim());
    }
    if (data.age) {
        fields.push(`age = $${idx++}`);
        values.push(data.age);
    }
    if (data.gender) {
        fields.push(`gender = $${idx++}`);
        values.push(data.gender);
    }
    if (fields.length === 0) {
        const err = new Error('No se proporcionaron datos para actualizar.');
        err.status = 400;
        throw err;
    }
    values.push(userId);
    const { rows } = await db_1.pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, full_name, email, age, gender, role`, values);
    return rows[0];
};
exports.updateUser = updateUser;
