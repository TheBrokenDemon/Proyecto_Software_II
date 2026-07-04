"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PsychologistFacade = void 0;
// Patrón Facade — agrupa todos los servicios del psicólogo
// en una sola interfaz simplificada
const psychologist_service_1 = require("../services/psychologist.service");
class PsychologistFacade {
    // Estudiantes
    static getStudents() { return (0, psychologist_service_1.getStudentsList)(); }
    static getStudentDetail(id, psychId) { return (0, psychologist_service_1.getStudentResponses)(id, psychId); }
    static sendCitation(studentId, psychId) { return (0, psychologist_service_1.sendCitationEmail)(studentId, psychId); }
    // Seguimiento
    static openFollowup(studentId, psychId, notes) {
        return (0, psychologist_service_1.createFollowup)(studentId, psychId, notes);
    }
    static updateFollowup(followupId, psychId, status) {
        return (0, psychologist_service_1.updateFollowupStatus)(followupId, psychId, status);
    }
    static getFollowups(studentId) { return (0, psychologist_service_1.getStudentFollowups)(studentId); }
    // Citas
    static scheduleAppointment(studentId, psychId, notes, followupId) {
        return (0, psychologist_service_1.createAppointment)(studentId, psychId, notes, followupId);
    }
    static getAppointments(studentId) { return (0, psychologist_service_1.getStudentAppointments)(studentId); }
    static replyToAppointment(appointmentId, studentId, status, notes) {
        return (0, psychologist_service_1.respondAppointment)(appointmentId, studentId, status, notes);
    }
}
exports.PsychologistFacade = PsychologistFacade;
