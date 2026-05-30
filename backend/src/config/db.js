const { Pool } = require('pg');

/**
 * PATRÓN: SINGLETON
 * Asegura que solo exista una instancia del pool de conexiones a PostgreSQL
 * Beneficio: Reutiliza conexiones, mejora rendimiento, evita fugas de memoria
 */
class DatabaseConnection {
  static instance = null;

  constructor() {
    if (DatabaseConnection.instance) {
      return DatabaseConnection.instance;
    }

    this.pool = new Pool({
      host:     process.env.DB_HOST,
      port:     parseInt(process.env.DB_PORT, 10),
      database: process.env.DB_NAME,
      user:     process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20,                    // Máximo de conexiones activas
      idleTimeoutMillis: 30000,   // Timeout de conexión inactiva
      connectionTimeoutMillis: 5000,
    });

    this.pool.on('error', (err) => {
      console.error('❌ Error inesperado en el pool de PostgreSQL:', err.message);
      process.exit(-1);
    });

    DatabaseConnection.instance = this;
  }

  // Método estático para obtener la instancia única
  static getInstance() {
    if (!DatabaseConnection.instance) {
      new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  // Conectar y verificar salud de la BD
  async connect() {
    const client = await this.pool.connect();
    console.log(`✓ PostgreSQL conectado → ${process.env.DB_NAME}@${process.env.DB_HOST}`);
    client.release();
  }

  // Health check para verificar disponibilidad de la BD
  async healthCheck() {
    try {
      await this.pool.query('SELECT 1');
      return { status: 'ok', database: process.env.DB_NAME };
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }

  // Obtener el pool
  getPool() {
    return this.pool;
  }
}

// Crear instancia única
const dbConnection = DatabaseConnection.getInstance();
const pool = dbConnection.getPool();

const connectDB = async () => {
  await dbConnection.connect();
};

module.exports = { pool, connectDB, DatabaseConnection };
