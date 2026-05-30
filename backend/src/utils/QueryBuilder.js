/**
 * PATRÓN: BUILDER
 * Construye queries SQL complejas de forma segura y legible
 * Beneficio: Reutilizable, fácil de mantener, previene SQL injection
 */

/**
 * QueryBuilder - Construye queries dinámicamente de forma segura
 */
class QueryBuilder {
  constructor(table) {
    this.table = table;
    this._select = [];
    this._joins = [];
    this._where = [];
    this._params = [];
    this._orderBy = [];
    this._groupBy = [];
    this._limit = null;
    this._paramCounter = 1;
  }

  /**
   * Selecciona campos específicos
   */
  select(...fields) {
    this._select = fields.length > 0 ? fields : ['*'];
    return this;
  }

  /**
   * Agrega un JOIN
   */
  join(table, condition) {
    this._joins.push(`JOIN ${table} ON ${condition}`);
    return this;
  }

  /**
   * Agrega un LEFT JOIN
   */
  leftJoin(table, condition) {
    this._joins.push(`LEFT JOIN ${table} ON ${condition}`);
    return this;
  }

  /**
   * Agrega una condición WHERE con parámetro seguro
   */
  where(column, operator, value) {
    this._where.push(`${column} ${operator} $${this._paramCounter++}`);
    this._params.push(value);
    return this;
  }

  /**
   * Agrega AND condición
   */
  and(column, operator, value) {
    return this.where(column, operator, value);
  }

  /**
   * Agrega OR condición
   */
  or(condition, value) {
    this._where.push(`OR ${condition} $${this._paramCounter++}`);
    this._params.push(value);
    return this;
  }

  /**
   * Agrega GROUP BY
   */
  groupBy(...columns) {
    this._groupBy = columns;
    return this;
  }

  /**
   * Agrega ORDER BY
   */
  orderBy(column, direction = 'ASC') {
    this._orderBy.push(`${column} ${direction}`);
    return this;
  }

  /**
   * Agrega LIMIT
   */
  limit(count) {
    this._limit = count;
    return this;
  }

  /**
   * Construye la query final
   */
  build() {
    const selectClause = this._select.length > 0 ? this._select.join(', ') : '*';
    const fromClause = `FROM ${this.table}`;
    const joinClause = this._joins.length > 0 ? this._joins.join('\n') : '';
    const whereClause = this._where.length > 0 ? `WHERE ${this._where.join(' AND ')}` : '';
    const groupByClause = this._groupBy.length > 0 ? `GROUP BY ${this._groupBy.join(', ')}` : '';
    const orderByClause = this._orderBy.length > 0 ? `ORDER BY ${this._orderBy.join(', ')}` : '';
    const limitClause = this._limit ? `LIMIT ${this._limit}` : '';

    const query = [
      `SELECT ${selectClause}`,
      fromClause,
      joinClause,
      whereClause,
      groupByClause,
      orderByClause,
      limitClause,
    ]
      .filter((clause) => clause)
      .join('\n');

    return query;
  }

  /**
   * Obtiene los parámetros en orden
   */
  getParams() {
    return this._params;
  }

  /**
   * Obtiene query y params para usar con pool.query()
   */
  getQueryAndParams() {
    return {
      query: this.build(),
      params: this.getParams(),
    };
  }
}

/**
 * Ejemplo de uso:
 * 
 * const query = new QueryBuilder('users')
 *   .select('id', 'full_name', 'email', 'role')
 *   .leftJoin('evaluation_responses', 'evaluation_responses.user_id = users.id')
 *   .where('role', '=', 'estudiante')
 *   .where('created_at', '>', new Date('2024-01-01'))
 *   .groupBy('users.id')
 *   .orderBy('users.full_name', 'ASC')
 *   .limit(50)
 *   .build();
 */

module.exports = {
  QueryBuilder,
};
