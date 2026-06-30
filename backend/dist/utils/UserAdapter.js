"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAdapter = void 0;
// Patrón Adapter — convierte la respuesta cruda de PostgreSQL
// al formato seguro que espera el frontend (sin password_hash)
class UserAdapter {
    static toResponse(dbRow) {
        return {
            id: dbRow.id,
            full_name: dbRow.full_name,
            email: dbRow.email,
            age: dbRow.age ?? null,
            gender: dbRow.gender ?? null,
            role: dbRow.role,
        };
    }
    static toHistoryItem(dbRow) {
        return {
            id: dbRow.id,
            title: dbRow.title,
            slug: dbRow.slug,
            completed_at: dbRow.completed_at,
        };
    }
    static toStudentList(dbRows) {
        return dbRows.map(row => ({
            id: row.id,
            full_name: row.full_name,
            email: row.email,
            age: row.age ?? null,
            gender: row.gender ?? null,
            total_evaluations: row.total_evaluations,
            last_evaluation: row.last_evaluation ?? null,
        }));
    }
}
exports.UserAdapter = UserAdapter;
