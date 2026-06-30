"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUser = exports.getUserById = void 0;
const db_1 = require("../config/db");
const QueryBuilder_1 = require("../utils/QueryBuilder");
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
    if (data.age !== undefined) {
        if (data.age < 18) {
            const err = new Error('Debes ser mayor de edad (mínimo 18 años).');
            err.status = 400;
            throw err;
        }
        if (data.age > 80) {
            const err = new Error('La edad no puede superar los 80 años.');
            err.status = 400;
            throw err;
        }
    }
    // Patrón Builder — construye la query dinámicamente
    const builder = new QueryBuilder_1.UserQueryBuilder();
    if (data.full_name)
        builder.setFullName(data.full_name);
    if (data.age !== undefined)
        builder.setAge(data.age);
    if (data.gender !== undefined && data.gender !== '')
        builder.setGender(data.gender);
    const { query, values } = builder.build(userId);
    const { rows } = await db_1.pool.query(query, values);
    return rows[0];
};
exports.updateUser = updateUser;
