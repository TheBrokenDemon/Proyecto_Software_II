"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = exports.pool = void 0;
const pg_1 = require("pg");
// ── Patrón Singleton: una sola instancia del pool ────────────
class DatabaseConnection {
    constructor() {
        this.pool = new pg_1.Pool({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432', 10),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });
        this.pool.on('error', (err) => {
            console.error('❌ Error inesperado en el pool de PostgreSQL:', err.message);
            process.exit(-1);
        });
    }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    async connect() {
        const client = await this.pool.connect();
        console.log(`✓ PostgreSQL conectado → ${process.env.DB_NAME}@${process.env.DB_HOST}`);
        client.release();
    }
}
DatabaseConnection.instance = null;
const dbConnection = DatabaseConnection.getInstance();
exports.pool = dbConnection.pool;
const connectDB = async () => {
    await dbConnection.connect();
};
exports.connectDB = connectDB;
