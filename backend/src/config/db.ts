import { Pool } from 'pg';

// ── Patrón Singleton: una sola instancia del pool ────────────
class DatabaseConnection {
    private static instance: DatabaseConnection | null = null;
    public pool: Pool;
    public readonly isSupabase: boolean;

    private constructor() {
        const sslMode = process.env.DB_SSLMODE || (process.env.DATABASE_URL ? 'require' : 'disable');

        const poolConfig: any = {
            max: 20,
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 5000,
        };

        // Soporte para DATABASE_URL (formato estándar, proveído por Supabase y otros)
        if (process.env.DATABASE_URL) {
            poolConfig.connectionString = process.env.DATABASE_URL;
        } else {
            poolConfig.host = process.env.DB_HOST || 'localhost';
            poolConfig.port = parseInt(process.env.DB_PORT || '5432', 10);
            poolConfig.database = process.env.DB_NAME || 'postgres';
            poolConfig.user = process.env.DB_USER || 'postgres';
            poolConfig.password = process.env.DB_PASSWORD || '';
        }

        // SSL: Supabase requiere SSL. En local se desactiva.
        //   'require'    → usa SSL sin verificar el certificado (Supabase pooler)
        //   'verify-full'→ usa SSL con verificación completa de certificado
        //   'disable'    → sin SSL (desarrollo local)
        if (sslMode !== 'disable') {
            poolConfig.ssl = { rejectUnauthorized: sslMode !== 'require' };
        }

        this.isSupabase = !!process.env.DATABASE_URL || sslMode !== 'disable';

        this.pool = new Pool(poolConfig);

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
        const host = process.env.DATABASE_URL
            ? new URL(process.env.DATABASE_URL).hostname
            : process.env.DB_HOST;
        console.log(`✓ PostgreSQL conectado → ${host}${this.isSupabase ? ' (Supabase)' : ''}`);
        client.release();
    }
}

const dbConnection = DatabaseConnection.getInstance();
export const pool = dbConnection.pool;

export const connectDB = async (): Promise<void> => {
    await dbConnection.connect();
};