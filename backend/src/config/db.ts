import { Pool } from 'pg';

// ── Patrón Singleton: una sola instancia del pool ────────────
class DatabaseConnection {
    private static instance: DatabaseConnection | null = null;
    public pool: Pool;

    private constructor() {
        this.pool = new Pool({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '5432', 10),
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        });

        this.pool.on('error', (err: Error) => {
            console.error('❌ Error inesperado en el pool de PostgreSQL:', err.message);
            process.exit(-1);
        });
    }

    static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }

    async connect(): Promise<void> {
        const client = await this.pool.connect();
        console.log(`✓ PostgreSQL conectado → ${process.env.DB_NAME}@${process.env.DB_HOST}`);
        client.release();
    }
}

const dbConnection = DatabaseConnection.getInstance();
export const pool = dbConnection.pool;

export const connectDB = async (): Promise<void> => {
    await dbConnection.connect();
};