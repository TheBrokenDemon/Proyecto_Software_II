import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser, requestPasswordReset, resetPassword } from '../services/auth.service';

// S2-39: Registro de usuario
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { full_name, email, password, age, gender } = req.body;
  try {
    if (!full_name || !email || !password) {
      res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios.' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    const user = await registerUser({ full_name, email, password, age, gender });
    res.status(201).json({ message: 'Usuario registrado correctamente.', user });
  } catch (err) {
    next(err);
  }
};

// S2-40: Inicio de sesión
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email, password } = req.body;
  try {
    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
      return;
    }
    const result = await loginUser(email, password);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// S2-63: Solicitar correo de recuperación
export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { email } = req.body;
  try {
    if (!email) {
      res.status(400).json({ message: 'El email es obligatorio.' });
      return;
    }
    await requestPasswordReset(email);
    res.status(200).json({
      message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.',
    });
  } catch (err) {
    next(err);
  }
};

// S2-63: Restablecer contraseña
export const resetPasswordController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { token, newPassword } = req.body;
  try {
    if (!token || !newPassword) {
      res.status(400).json({ message: 'El token y la nueva contraseña son obligatorios.' });
      return;
    }
    if (newPassword.length < 6) {
      res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }
    await resetPassword(token, newPassword);
    res.status(200).json({ message: 'Contraseña restablecida exitosamente.' });
  } catch (err) {
    next(err);
  }
};