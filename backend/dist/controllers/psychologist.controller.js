"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.replyAppointment = exports.myAppointments = exports.addAppointment = exports.listFollowups = exports.patchFollowup = exports.addFollowup = exports.citateStudent = exports.studentResponses = exports.listStudents = void 0;
const psychologist_service_1 = require("../services/psychologist.service");
// ── Panel psicólogo ───────────────────────────────────────────
const listStudents = async (_req, res) => {
    try {
        const students = await (0, psychologist_service_1.getStudentsList)();
        res.status(200).json({ students });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.listStudents = listStudents;
const studentResponses = async (req, res) => {
    try {
        const data = await (0, psychologist_service_1.getStudentResponses)(req.params.studentId);
        res.status(200).json(data);
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.studentResponses = studentResponses;
const citateStudent = async (req, res) => {
    try {
        const result = await (0, psychologist_service_1.sendCitationEmail)(req.params.studentId, req.user.id);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.citateStudent = citateStudent;
// ── Seguimiento psicológico ───────────────────────────────────
// POST /api/psychologist/students/:studentId/followups
const addFollowup = async (req, res) => {
    const { notes } = req.body;
    if (!notes) {
        res.status(400).json({ message: 'Las notas son obligatorias.' });
        return;
    }
    try {
        const followup = await (0, psychologist_service_1.createFollowup)(req.params.studentId, req.user.id, notes);
        res.status(201).json({ followup });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.addFollowup = addFollowup;
// PATCH /api/psychologist/followups/:followupId
const patchFollowup = async (req, res) => {
    const { status } = req.body;
    if (!status) {
        res.status(400).json({ message: 'El estado es obligatorio.' });
        return;
    }
    try {
        const followup = await (0, psychologist_service_1.updateFollowupStatus)(req.params.followupId, req.user.id, status);
        res.status(200).json({ followup });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.patchFollowup = patchFollowup;
// GET /api/psychologist/students/:studentId/followups
const listFollowups = async (req, res) => {
    try {
        const followups = await (0, psychologist_service_1.getStudentFollowups)(req.params.studentId);
        res.status(200).json({ followups });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.listFollowups = listFollowups;
// ── Citas ─────────────────────────────────────────────────────
// POST /api/psychologist/students/:studentId/appointments
const addAppointment = async (req, res) => {
    const { psychologist_notes, followup_id } = req.body;
    if (!followup_id) {
        res.status(400).json({ message: 'El followup_id es obligatorio.' });
        return;
    }
    try {
        const appointment = await (0, psychologist_service_1.createAppointment)(req.params.studentId, req.user.id, psychologist_notes || '', followup_id);
        res.status(201).json({ appointment });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.addAppointment = addAppointment;
// GET /api/appointments  (estudiante ve sus citas)
const myAppointments = async (req, res) => {
    try {
        const appointments = await (0, psychologist_service_1.getStudentAppointments)(req.user.id);
        res.status(200).json({ appointments });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.myAppointments = myAppointments;
// PATCH /api/appointments/:appointmentId  (estudiante confirma/reprograma)
const replyAppointment = async (req, res) => {
    const { status, student_notes } = req.body;
    if (!status) {
        res.status(400).json({ message: 'El estado es obligatorio.' });
        return;
    }
    try {
        const appointment = await (0, psychologist_service_1.respondAppointment)(req.params.appointmentId, req.user.id, status, student_notes);
        res.status(200).json({ appointment });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.replyAppointment = replyAppointment;
