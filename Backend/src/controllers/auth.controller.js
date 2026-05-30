const { registerUser, loginUser, logoutUser, forgotPasswordUser, resetPasswordUser} = require('../services/auth.service');

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

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await forgotPasswordUser(email);
    
    // MOCK DEL ENVÍO DE CORREO (Simulación en consola)
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/recovery?token=${result.resetToken}`;
    
    console.log(`\n======================================================`);
    console.log(`📧 [EMAIL SIMULADO] Para: ${result.name} <${result.email}>`);
    console.log(`Asunto: Recuperación de Contraseña - MindCheck ULima`);
    console.log(`Enlace de restablecimiento (Válido por 15 min):`);
    console.log(`👉 ${resetLink}`);
    console.log(`======================================================\n`);
    res.status(200).json({ message: 'Si el correo existe, hemos enviado un enlace de recuperación.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await resetPasswordUser({ token, newPassword });
    res.status(200).json({ message: 'Contraseña restablecida exitosamente. Ahora puedes iniciar sesión.' });
  } catch (err) {
    res.status(err.status || 500).json({ message: err.message });
  }
};


module.exports = { register, login, logout, forgotPassword, resetPassword };
