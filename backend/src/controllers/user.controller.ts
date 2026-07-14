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
    // condición 1
    if (!theme) {
      res.status(400).json({ message: 'El tema es obligatorio.' });
      return;
    }
    if (typeof theme !== 'string') {
      res.status(400).json({ message: 'El tema debe ser texto.' });
      return;
    }
    // condición 3
    if (!validThemes.includes(theme)) {
      res.status(400).json({ message: 'Tema inválido. Opciones: institucional, naturaleza, descanso.' });
      return;
    }
    const updated = await UserRepository.updateTheme(req.user.id, theme);
    // condición 4
    if (!updated) {
      res.status(404).json({ message: 'Usuario no encontrado.' });
      return;
    }
    // condición 5 — try/catch
    res.status(200).json({ message: 'Tema actualizado.', theme: updated.theme });
  } catch (err) {
    next(err);
  }
};
