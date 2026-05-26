const { Pool } = require('pg');

const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT, 10),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err.message);
  process.exit(-1);
});

const connectDB = async () => {
  const client = await pool.connect();
  console.log(`✓ PostgreSQL conectado → ${process.env.DB_NAME}@${process.env.DB_HOST}`);
  client.release();
};

module.exports = { pool, connectDB };
