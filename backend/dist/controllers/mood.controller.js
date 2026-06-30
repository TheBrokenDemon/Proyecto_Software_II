"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkinHistory = exports.todayCheckin = exports.createCheckin = void 0;
const mood_service_1 = require("../services/mood.service");
// POST /api/mood/checkins — crea o actualiza el ánimo de hoy
const createCheckin = async (req, res) => {
    try {
        const user = req.user;
        const { mood, note } = req.body;
        if (!Number.isInteger(mood) || mood < 1 || mood > 4) {
            res.status(400).json({ message: 'El ánimo debe ser un número del 1 al 4.' });
            return;
        }
        if (note != null && (typeof note !== 'string' || note.length > 500)) {
            res.status(400).json({ message: 'La nota debe ser texto de máximo 500 caracteres.' });
            return;
        }
        const checkin = await (0, mood_service_1.upsertTodayCheckin)(user.id, mood, note);
        res.status(201).json({ checkin });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.createCheckin = createCheckin;
// GET /api/mood/checkins/today — ánimo de hoy (o null)
const todayCheckin = async (req, res) => {
    try {
        const user = req.user;
        const checkin = await (0, mood_service_1.getTodayCheckin)(user.id);
        res.status(200).json({ checkin });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.todayCheckin = todayCheckin;
// GET /api/mood/checkins — historial reciente + racha
const checkinHistory = async (req, res) => {
    try {
        const user = req.user;
        const data = await (0, mood_service_1.getCheckinHistory)(user.id, 14);
        res.status(200).json(data);
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.checkinHistory = checkinHistory;
