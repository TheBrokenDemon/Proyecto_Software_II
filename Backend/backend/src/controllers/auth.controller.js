const { registerUser, loginUser, logoutUser, requestPasswordReset, resetPassword } = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({ message: 'Cuenta creada exitosamente.', user });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const result = await loginUser(req.body);
    res.status(200).json({ message: 'Inicio de sesion exitoso.', ...result });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    await logoutUser(token);
    res.status(200).json({ message: 'Sesion cerrada correctamente.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    await requestPasswordReset(req.body.email);
    // Siempre responde igual por seguridad
    res.status(200).json({ message: 'Si el correo esta registrado, recibiras un enlace de recuperacion.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const resetPasswordHandler = async (req, res) => {
  try {
    await resetPassword(req.body.token, req.body.new_password);
    res.status(200).json({ message: 'Contrasena actualizada correctamente. Ya puedes iniciar sesion.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { register, login, logout, forgotPassword, resetPasswordHandler };
