import { Response } from 'express';
import { AuthRequest } from '../types';
import { PsychologistFacade } from '../utils/PsychologistFacade';
import { listRequests, respondRequest } from '../services/appointmentRequest.service';

// ── Panel psicólogo ───────────────────────────────────────────

export const listStudents = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Patrón Facade — una sola interfaz para todos los servicios del psicólogo
    const students = await PsychologistFacade.getStudents();
    res.status(200).json({ students });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const studentResponses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await PsychologistFacade.getStudentDetail(req.params.studentId, req.user.id);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const citateStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await PsychologistFacade.sendCitation(req.params.studentId, req.user.id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ── Seguimiento psicológico ───────────────────────────────────

export const addFollowup = async (req: AuthRequest, res: Response): Promise<void> => {
  const { notes } = req.body;
  if (!notes) {
    res.status(400).json({ message: 'Las notas son obligatorias.' });
    return;
  }
  try {
    const followup = await PsychologistFacade.openFollowup(req.params.studentId, req.user.id, notes);
    res.status(201).json({ followup });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const patchFollowup = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ message: 'El estado es obligatorio.' });
    return;
  }
  try {
    const followup = await PsychologistFacade.updateFollowup(req.params.followupId, req.user.id, status);
    res.status(200).json({ followup });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const listFollowups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const followups = await PsychologistFacade.getFollowups(req.params.studentId);
    res.status(200).json({ followups });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

// ── Citas ─────────────────────────────────────────────────────

export const addAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { psychologist_notes, followup_id } = req.body;
  if (!followup_id) {
    res.status(400).json({ message: 'El followup_id es obligatorio.' });
    return;
  }
  try {
    const appointment = await PsychologistFacade.scheduleAppointment(
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

export const myAppointments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const appointments = await PsychologistFacade.getAppointments(req.user.id);
    res.status(200).json({ appointments });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const replyAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
  const { status, student_notes } = req.body;
  if (!status) {
    res.status(400).json({ message: 'El estado es obligatorio.' });
    return;
  }
  try {
    const appointment = await PsychologistFacade.replyToAppointment(
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

// ── Solicitudes de cita (iniciadas por el estudiante) ──────────
export const appointmentRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await listRequests();
    res.status(200).json({ requests });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

export const respondAppointmentRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, response_note, confirmed_date } = req.body;
    const valid = ['confirmada', 'reprogramada', 'rechazada'];
    if (!valid.includes(status)) {
      res.status(400).json({ message: 'Estado inválido.' });
      return;
    }
    const request = await respondRequest(req.params.id, req.user.id, status, response_note, confirmed_date);
    if (!request) {
      res.status(404).json({ message: 'Solicitud no encontrada.' });
      return;
    }
    res.status(200).json({ request });
  } catch (err: any) {
    res.status(err.status || 500).json({ message: err.message });
  }
};