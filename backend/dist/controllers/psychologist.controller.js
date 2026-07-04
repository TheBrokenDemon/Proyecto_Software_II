"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondAppointmentRequest = exports.appointmentRequests = exports.replyAppointment = exports.myAppointments = exports.addAppointment = exports.listFollowups = exports.patchFollowup = exports.addFollowup = exports.citateStudent = exports.studentResponses = exports.listStudents = void 0;
const PsychologistFacade_1 = require("../utils/PsychologistFacade");
const appointmentRequest_service_1 = require("../services/appointmentRequest.service");
// ── Panel psicólogo ───────────────────────────────────────────
const listStudents = async (_req, res) => {
    try {
        // Patrón Facade — una sola interfaz para todos los servicios del psicólogo
        const students = await PsychologistFacade_1.PsychologistFacade.getStudents();
        res.status(200).json({ students });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.listStudents = listStudents;
const studentResponses = async (req, res) => {
    try {
        const data = await PsychologistFacade_1.PsychologistFacade.getStudentDetail(req.params.studentId, req.user.id);
        res.status(200).json(data);
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.studentResponses = studentResponses;
const citateStudent = async (req, res) => {
    try {
        const result = await PsychologistFacade_1.PsychologistFacade.sendCitation(req.params.studentId, req.user.id);
        res.status(200).json(result);
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.citateStudent = citateStudent;
// ── Seguimiento psicológico ───────────────────────────────────
const addFollowup = async (req, res) => {
    const { notes } = req.body;
    if (!notes) {
        res.status(400).json({ message: 'Las notas son obligatorias.' });
        return;
    }
    try {
        const followup = await PsychologistFacade_1.PsychologistFacade.openFollowup(req.params.studentId, req.user.id, notes);
        res.status(201).json({ followup });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.addFollowup = addFollowup;
const patchFollowup = async (req, res) => {
    const { status } = req.body;
    if (!status) {
        res.status(400).json({ message: 'El estado es obligatorio.' });
        return;
    }
    try {
        const followup = await PsychologistFacade_1.PsychologistFacade.updateFollowup(req.params.followupId, req.user.id, status);
        res.status(200).json({ followup });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.patchFollowup = patchFollowup;
const listFollowups = async (req, res) => {
    try {
        const followups = await PsychologistFacade_1.PsychologistFacade.getFollowups(req.params.studentId);
        res.status(200).json({ followups });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.listFollowups = listFollowups;
// ── Citas ─────────────────────────────────────────────────────
const addAppointment = async (req, res) => {
    const { psychologist_notes, followup_id } = req.body;
    if (!followup_id) {
        res.status(400).json({ message: 'El followup_id es obligatorio.' });
        return;
    }
    try {
        const appointment = await PsychologistFacade_1.PsychologistFacade.scheduleAppointment(req.params.studentId, req.user.id, psychologist_notes || '', followup_id);
        res.status(201).json({ appointment });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.addAppointment = addAppointment;
const myAppointments = async (req, res) => {
    try {
        const appointments = await PsychologistFacade_1.PsychologistFacade.getAppointments(req.user.id);
        res.status(200).json({ appointments });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.myAppointments = myAppointments;
const replyAppointment = async (req, res) => {
    const { status, student_notes } = req.body;
    if (!status) {
        res.status(400).json({ message: 'El estado es obligatorio.' });
        return;
    }
    try {
        const appointment = await PsychologistFacade_1.PsychologistFacade.replyToAppointment(req.params.appointmentId, req.user.id, status, student_notes);
        res.status(200).json({ appointment });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.replyAppointment = replyAppointment;
// ── Solicitudes de cita (iniciadas por el estudiante) ──────────
const appointmentRequests = async (req, res) => {
    try {
        const requests = await (0, appointmentRequest_service_1.listRequests)();
        res.status(200).json({ requests });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.appointmentRequests = appointmentRequests;
const respondAppointmentRequest = async (req, res) => {
    try {
        const { status, response_note, confirmed_date } = req.body;
        const valid = ['confirmada', 'reprogramada', 'rechazada'];
        if (!valid.includes(status)) {
            res.status(400).json({ message: 'Estado inválido.' });
            return;
        }
        const request = await (0, appointmentRequest_service_1.respondRequest)(req.params.id, req.user.id, status, response_note, confirmed_date);
        if (!request) {
            res.status(404).json({ message: 'Solicitud no encontrada.' });
            return;
        }
        res.status(200).json({ request });
    }
    catch (err) {
        res.status(err.status || 500).json({ message: err.message });
    }
};
exports.respondAppointmentRequest = respondAppointmentRequest;
