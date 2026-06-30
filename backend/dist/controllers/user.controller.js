"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTheme = exports.updateProfile = exports.getProfile = void 0;
const user_service_1 = require("../services/user.service");
const UserAdapter_1 = require("../utils/UserAdapter");
const user_repository_1 = require("../repositories/user.repository");
// S2-41: Obtener perfil
const getProfile = async (req, res, next) => {
    try {
        const user = await (0, user_service_1.getUserById)(req.user.id);
        // Patrón Adapter — convierte el resultado de BD al formato del frontend
        res.status(200).json({ user: UserAdapter_1.UserAdapter.toResponse(user) });
    }
    catch (err) {
        next(err);
    }
};
exports.getProfile = getProfile;
// S2-41: Actualizar perfil
const updateProfile = async (req, res, next) => {
    try {
        const { full_name, age, gender } = req.body;
        const updated = await (0, user_service_1.updateUser)(req.user.id, { full_name, age, gender });
        res.status(200).json({ message: 'Perfil actualizado correctamente.', user: updated });
    }
    catch (err) {
        next(err);
    }
};
exports.updateProfile = updateProfile;
// S2-41: Actualizar tema
const updateTheme = async (req, res, next) => {
    try {
        const { theme } = req.body;
        const validThemes = ['institucional', 'naturaleza', 'descanso'];
        if (!theme || !validThemes.includes(theme)) {
            res.status(400).json({ message: 'Tema inválido.' });
            return;
        }
        const updated = await user_repository_1.UserRepository.updateTheme(req.user.id, theme);
        res.status(200).json({ message: 'Tema actualizado.', theme: updated.theme });
    }
    catch (err) {
        next(err);
    }
};
exports.updateTheme = updateTheme;
