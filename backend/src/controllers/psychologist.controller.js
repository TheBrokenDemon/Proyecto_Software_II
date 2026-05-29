/**
 * psychologist.controller.js
 *
 * Patrones aplicados:
 *   - Facade    : PsychologistFacade oculta la complejidad de múltiples servicios
 *   - Factory   : ResponseFactory construye respuestas HTTP estandarizadas
 */

const {
  getStudentsList,
  getStudentResponses,
  addObservation,
  getObservations,
  flagStudentForContact,
} = require('../services/psychologist.service');

// ─── Factory Pattern ──────────────────────────────────────────────────────────
class ResponseFactory {
  static success(res, data, statusCode = 200) {
    return res.status(statusCode).json({ ok: true, ...data });
  }
  static error(res, err) {
    const status = err.status || 500;
    return res.status(status).json({ ok: false, message: err.message });
  }
}

// ─── Facade Pattern ───────────────────────────────────────────────────────────
class PsychologistFacade {
  async fetchStudentList() { return getStudentsList(); }
  async fetchStudentDetail(studentId) { return getStudentResponses(studentId); }
  async registerObservation(studentId, psychologistId, text, contactFlag) {
    const obs = await addObservation(studentId, psychologistId, text);
    if (contactFlag) await flagStudentForContact(studentId, psychologistId);
    return obs;
  }
  async fetchObservations(studentId) { return getObservations(studentId); }
}

const facade = new PsychologistFacade();

const listStudents = async (_req, res) => {
  try {
    const students = await facade.fetchStudentList();
    ResponseFactory.success(res, { students });
  } catch (err) { ResponseFactory.error(res, err); }
};

const studentResponses = async (req, res) => {
  try {
    const data = await facade.fetchStudentDetail(req.params.studentId);
    ResponseFactory.success(res, data);
  } catch (err) { ResponseFactory.error(res, err); }
};

const createObservation = async (req, res) => {
  try {
    const { studentId } = req.params;
    const psychologistId = req.user.sub;
    const { text, flag_for_contact } = req.body;
    if (!text || !text.trim()) {
      return ResponseFactory.error(res, { status: 400, message: 'La observación no puede estar vacía.' });
    }
    const obs = await facade.registerObservation(studentId, psychologistId, text.trim(), flag_for_contact);
    ResponseFactory.success(res, { observation: obs }, 201);
  } catch (err) { ResponseFactory.error(res, err); }
};

const listObservations = async (req, res) => {
  try {
    const observations = await facade.fetchObservations(req.params.studentId);
    ResponseFactory.success(res, { observations });
  } catch (err) { ResponseFactory.error(res, err); }
};

module.exports = { listStudents, studentResponses, createObservation, listObservations };
