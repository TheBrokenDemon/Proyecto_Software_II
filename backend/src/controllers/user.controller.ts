import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { getUserById, updateUser } from '../services/user.service';
import { UserFactory } from '../utils/Factories';

// S2-41: Obtener perfil
export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await getUserById(req.user.id);
    res.status(200).json(UserFactory.createUserResponse(user));
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