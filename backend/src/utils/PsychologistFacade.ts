// Patrón Facade — agrupa todos los servicios del psicólogo
// en una sola interfaz simplificada
import {
  getStudentsList,
  getStudentResponses,
  sendCitationEmail,
  createFollowup,
  updateFollowupStatus,
  getStudentFollowups,
  createAppointment,
  getStudentAppointments,
  respondAppointment,
} from '../services/psychologist.service';

export class PsychologistFacade {
  // Estudiantes
  static getStudents()                          { return getStudentsList(); }
  static getStudentDetail(id: string, psychId?: string) { return getStudentResponses(id, psychId); }
  static sendCitation(studentId: string, psychId: string) { return sendCitationEmail(studentId, psychId); }

  // Seguimiento
  static openFollowup(studentId: string, psychId: string, notes: string) {
    return createFollowup(studentId, psychId, notes);
  }
  static updateFollowup(followupId: string, psychId: string, status: string) {
    return updateFollowupStatus(followupId, psychId, status);
  }
  static getFollowups(studentId: string)        { return getStudentFollowups(studentId); }

  // Citas
  static scheduleAppointment(studentId: string, psychId: string, notes: string, followupId: string) {
    return createAppointment(studentId, psychId, notes, followupId);
  }
  static getAppointments(studentId: string)     { return getStudentAppointments(studentId); }
  static replyToAppointment(appointmentId: string, studentId: string, status: string, notes?: string) {
    return respondAppointment(appointmentId, studentId, status, notes);
  }
}