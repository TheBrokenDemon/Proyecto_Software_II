import { Response } from 'express';
import { AuthRequest } from '../types';
import { getStudentFollowups } from '../services/psychologist.service';

// GET /api/followups/mine — el estudiante lee las notas/seguimientos de su psicólogo
export const myFollowups = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const followups = await getStudentFollowups(req.user.id);
    res.status(200).json({ followups });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};