import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { upsertTodayCheckin, getTodayCheckin, getCheckinHistory } from '../services/mood.service';

// POST /api/mood/checkins — crea o actualiza el ánimo de hoy
export const createCheckin = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const { mood, note } = req.body;

    if (!Number.isInteger(mood) || mood < 1 || mood > 4) {
      res.status(400).json({ message: 'El ánimo debe ser un número del 1 al 4.' });
      return;
    }
    if (note != null && (typeof note !== 'string' || note.length > 500)) {
      res.status(400).json({ message: 'La nota debe ser texto de máximo 500 caracteres.' });
      return;
    }

    const checkin = await upsertTodayCheckin(user.id, mood, note);
    res.status(201).json({ checkin });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/mood/checkins/today — ánimo de hoy (o null)
export const todayCheckin = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const checkin = await getTodayCheckin(user.id);
    res.status(200).json({ checkin });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/mood/checkins — historial reciente + racha
export const checkinHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as AuthRequest).user;
    const data = await getCheckinHistory(user.id, 14);
    res.status(200).json(data);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
