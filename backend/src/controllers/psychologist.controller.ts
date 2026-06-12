import { Response } from 'express';
import { AuthRequest } from '../types';
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

// ── Panel psicólogo ───────────────────────────────────────────

export const listStudents = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const students = await getStudentsList();
    res.status(200).json({ students });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const studentResponses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await getStudentResponses(req.params.studentId);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const citateStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await sendCitationEmail(req.params.studentId, req.user.id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ── Seguimiento psicológico ───────────────────────────────────

// POST /api/psychologist/students/:studentId/followups
export const addFollowup = async (req: AuthRequest, res: Response): Promise<void> => {
  const { notes } = req.body;
  if (!notes) {
    res.status(400).json({ message: 'Las notas son obligatorias.' });
    return;
  }
  try {
    const followup = await createFollowup(req.params.studentId, req.user.id, notes);
    res.status(201).json({ followup });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// PATCH /api/psychologist/followups/:followupId
export const patchFollowup = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ message: 'El estado es obligatorio.' });
    return;
  }
  try {
    const followup = await updateFollowupStatus(req.params.followupId, req.user.id, status);
    res.status(200).json({ followup });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// GET /api/psychologist/students/:studentId/followups
export const listFollowups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const followups = await getStudentFollowups(req.params.studentId);
    res.status(200).json({ followups });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ── Citas ─────────────────────────────────────────────────────

// POST /api/psychologist/students/:studentId/appointments
export const addAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { psychologist_notes, followup_id } = req.body;
  if (!followup_id) {
    res.status(400).json({ message: 'El followup_id es obligatorio.' });
    return;
  }
  try {
    const appointment = await createAppointment(
      req.params.studentId,
      req.user.id,
      psychologist_notes || '',
      followup_id
    );
    res.status(201).json({ appointment });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// GET /api/appointments  (estudiante ve sus citas)
export const myAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointments = await getStudentAppointments(req.user.id);
    res.status(200).json({ appointments });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// PATCH /api/appointments/:appointmentId  (estudiante confirma/reprograma)
export const replyAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, student_notes } = req.body;
  if (!status) {
    res.status(400).json({ message: 'El estado es obligatorio.' });
    return;
  }
  try {
    const appointment = await respondAppointment(
      req.params.appointmentId,
      req.user.id,
      status,
      student_notes
    );
    res.status(200).json({ appointment });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};