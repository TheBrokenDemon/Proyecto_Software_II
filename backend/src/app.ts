import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { connectDB } from './config/db';
import { AppError } from './types';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import evaluationRoutes from './routes/evaluation.routes';
import psychologistRoutes from './routes/psychologist.routes';
import psychologistRegisterRoutes from './routes/psychologist-register.routes';
import appointmentRoutes from './routes/appointment.routes';
import moodRoutes from './routes/mood.routes';          
import followupRoutes from './routes/followup.routes';  
import appointmentRequestRoutes from './routes/appointmentRequest.routes';

const app = express();

// ── Seguridad y parseo ────────────────────────────────────────
app.use(helmet());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL || 'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'MindCheck ULima API v2 (TypeScript)' });
});

// ── Rutas ─────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/psychologist', psychologistRoutes);
app.use('/api/psychologist-register', psychologistRegisterRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/mood', moodRoutes);                       
app.use('/api/followups', followupRoutes);
app.use('/api/appointment-requests', appointmentRequestRoutes);

// ── 404 ───────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
    res.status(404).json({ message: 'Ruta no encontrada.' });
});

// ── Error handler global ──────────────────────────────────────
app.use((err: AppError, _req: Request, res: Response, _next: NextFunction) => {
    console.error('❌ ERROR:', err.message);
    const status = err.status || 500;
    const body: any = { message: err.message || 'Error interno del servidor.' };
    if (process.env.NODE_ENV === 'development') body.stack = err.stack;
    res.status(status).json(body);
});

// ── Arranque ──────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '4000', 10);

const start = async () => {
    await connectDB();
    app.listen(PORT, () => {
        console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
        console.log(`  Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
};

start();