import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { getUserById, updateUser} from '../services/user.service';
import { UserAdapter } from '../utils/UserAdapter';
import { UserRepository } from '../repositories/user.repository';

// S2-41: Obtener perfil
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await getUserById(req.user.id);
    // Patrón Adapter — convierte el resultado de BD al formato del frontend
    res.status(200).json({ user: UserAdapter.toResponse(user) });
  } catch (err) {
    next(err);
  }
};

// S2-41: Actualizar perfil
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { full_name, age, gender } = req.body;
    const updated = await updateUser(req.user.id, { full_name, age, gender });
    res.status(200).json({ message: 'Perfil actualizado correctamente.', user: updated });
  } catch (err) {
    next(err);
  }
};
// S2-41: Actualizar tema
export const updateTheme = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { theme } = req.body;
    const validThemes = ['institucional', 'naturaleza', 'descanso'];
    if (!theme || !validThemes.includes(theme)) {
      res.status(400).json({ message: 'Tema inválido.' });
      return;
    }
    const updated = await UserRepository.updateTheme(req.user.id, theme);
    res.status(200).json({ message: 'Tema actualizado.', theme: updated.theme });
  } catch (err) {
    next(err);
  }
};