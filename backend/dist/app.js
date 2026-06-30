"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const evaluation_routes_1 = __importDefault(require("./routes/evaluation.routes"));
const psychologist_routes_1 = __importDefault(require("./routes/psychologist.routes"));
const psychologist_register_routes_1 = __importDefault(require("./routes/psychologist-register.routes"));
const appointment_routes_1 = __importDefault(require("./routes/appointment.routes"));
const mood_routes_1 = __importDefault(require("./routes/mood.routes"));
const app = (0, express_1.default)();
// ── Seguridad y parseo ────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        process.env.FRONTEND_URL || 'http://localhost:5173',
    ],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', service: 'MindCheck ULima API v2 (TypeScript)' });
});
// ── Rutas ─────────────────────────────────────────────────────
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/evaluations', evaluation_routes_1.default);
app.use('/api/psychologist', psychologist_routes_1.default);
app.use('/api/psychologist-register', psychologist_register_routes_1.default);
app.use('/api/appointments', appointment_routes_1.default);
app.use('/api/mood', mood_routes_1.default);
// ── 404 ───────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ message: 'Ruta no encontrada.' });
});
// ── Error handler global ──────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('❌ ERROR:', err.message);
    const status = err.status || 500;
    const body = { message: err.message || 'Error interno del servidor.' };
    if (process.env.NODE_ENV === 'development')
        body.stack = err.stack;
    res.status(status).json(body);
});
// ── Arranque ──────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '4000', 10);
const start = async () => {
    await (0, db_1.connectDB)();
    app.listen(PORT, () => {
        console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
        console.log(`  Entorno: ${process.env.NODE_ENV || 'development'}`);
    });
};
start();
