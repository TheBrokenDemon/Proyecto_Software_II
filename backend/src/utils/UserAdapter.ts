// Patrón Adapter — convierte la respuesta cruda de PostgreSQL
// al formato seguro que espera el frontend (sin password_hash)
export class UserAdapter {
  static toResponse(dbRow: any) {
    return {
      id:        dbRow.id,
      full_name: dbRow.full_name,
      email:     dbRow.email,
      age:       dbRow.age ?? null,
      gender:    dbRow.gender ?? null,
      role:      dbRow.role,
    };
  }

  static toHistoryItem(dbRow: any) {
    return {
      id:           dbRow.id,
      title:        dbRow.title,
      slug:         dbRow.slug,
      completed_at: dbRow.completed_at,
    };
  }

  static toStudentList(dbRows: any[]) {
    return dbRows.map(row => ({
      id:                row.id,
      full_name:         row.full_name,
      email:             row.email,
      age:               row.age ?? null,
      gender:            row.gender ?? null,
      total_evaluations: row.total_evaluations,
      last_evaluation:   row.last_evaluation ?? null,
    }));
  }
}