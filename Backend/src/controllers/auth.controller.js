const { registerUser, loginUser, logoutUser } = require('../services/auth.service');

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
    res.status(200).json({ message: 'Inicio de sesión exitoso.', ...result });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.headers['authorization'].split(' ')[1];
    await logoutUser(token);
    res.status(200).json({ message: 'Sesión cerrada correctamente.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};

module.exports = { register, login, logout };
