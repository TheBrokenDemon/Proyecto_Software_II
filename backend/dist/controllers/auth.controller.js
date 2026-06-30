"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordController = exports.forgotPassword = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
// S2-39: Registro de usuario
const register = async (req, res, next) => {
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
        const user = await (0, auth_service_1.registerUser)({ full_name, email, password, age, gender });
        res.status(201).json({ message: 'Usuario registrado correctamente.', user });
    }
    catch (err) {
        next(err);
    }
};
exports.register = register;
// S2-40: Inicio de sesión
const login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            res.status(400).json({ message: 'Email y contraseña son obligatorios.' });
            return;
        }
        const result = await (0, auth_service_1.loginUser)(email, password);
        res.status(200).json(result);
    }
    catch (err) {
        next(err);
    }
};
exports.login = login;
// S2-63: Solicitar correo de recuperación
const forgotPassword = async (req, res, next) => {
    const { email } = req.body;
    try {
        if (!email) {
            res.status(400).json({ message: 'El email es obligatorio.' });
            return;
        }
        await (0, auth_service_1.requestPasswordReset)(email);
        res.status(200).json({
            message: 'Si el correo existe, recibirás un enlace para restablecer tu contraseña.',
        });
    }
    catch (err) {
        next(err);
    }
};
exports.forgotPassword = forgotPassword;
// S2-63: Restablecer contraseña
const resetPasswordController = async (req, res, next) => {
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
        await (0, auth_service_1.resetPassword)(token, newPassword);
        res.status(200).json({ message: 'Contraseña restablecida exitosamente.' });
    }
    catch (err) {
        next(err);
    }
};
exports.resetPasswordController = resetPasswordController;
