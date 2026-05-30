require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { connectDB } = require('./config/db');

// Rutas
const authRoutes       = require('./routes/auth.routes');
const userRoutes       = require('./routes/user.routes');
const emotionalRoutes  = require('./routes/emotional.routes');
const evaluationRoutes = require('./routes/evaluation.routes');
const psychologistRoutes = require('./routes/psychologist.routes');
const app = express();

// ─── Seguridad y parseo ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health check ────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'MindCheck ULima API' });
});

// ─── Rutas de la API ─────────────────────────────────────────
app.use('/api/auth',        authRoutes);
app.use('/api/users',       userRoutes);
app.use('/api/emotional',   emotionalRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/psychologist', psychologistRoutes);
// ─── Ruta no encontrada ──────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});

// ─── Error handler global ────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('Error no controlado:', err.message);
  res.status(500).json({ message: 'Error interno del servidor.' });
});

// ─── Arranque ────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
    console.log(`  Entorno: ${process.env.NODE_ENV || 'development'}`);
  });
};

start();
