import { Response } from 'express';
import { AuthRequest } from '../types';
import { createRequest, getMyRequests, cancelRequest } from '../services/appointmentRequest.service';

// POST /api/appointment-requests
export const requestAppointment = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const request = await createRequest(req.user.id, reason.trim(), preferred_date || null);
    res.status(201).json({ request });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/appointment-requests/mine
export const myRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await getMyRequests(req.user.id);
    res.status(200).json({ requests });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/appointment-requests/:id/cancel
export const cancelMyRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const request = await cancelRequest(req.params.id, req.user.id);
    if (!request) {
      res.status(400).json({ message: 'No se pudo cancelar (ya fue atendida o no existe).' });
      return;
    }
    res.status(200).json({ request });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};