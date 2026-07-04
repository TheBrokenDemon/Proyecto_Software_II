"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelMyRequest = exports.myRequests = exports.requestAppointment = void 0;
const appointmentRequest_service_1 = require("../services/appointmentRequest.service");
// POST /api/appointment-requests
const requestAppointment = async (req, res) => {
    try {
        const { reason, preferred_date } = req.body;
        if (!reason || typeof reason !== 'string' || !reason.trim()) {
            res.status(400).json({ message: 'El motivo de la cita es obligatorio.' });
            return;
        }
        if (reason.length > 1000) {
            res.status(400).json({ message: 'El motivo es demasiado largo.' });
            return;
        }
        const request = await (0, appointmentRequest_service_1.createRequest)(req.user.id, reason.trim(), preferred_date || null);
        res.status(201).json({ request });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.requestAppointment = requestAppointment;
// GET /api/appointment-requests/mine
const myRequests = async (req, res) => {
    try {
        const requests = await (0, appointmentRequest_service_1.getMyRequests)(req.user.id);
        res.status(200).json({ requests });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.myRequests = myRequests;
// PATCH /api/appointment-requests/:id/cancel
const cancelMyRequest = async (req, res) => {
    try {
        const request = await (0, appointmentRequest_service_1.cancelRequest)(req.params.id, req.user.id);
        if (!request) {
            res.status(400).json({ message: 'No se pudo cancelar (ya fue atendida o no existe).' });
            return;
        }
        res.status(200).json({ request });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.cancelMyRequest = cancelMyRequest;
