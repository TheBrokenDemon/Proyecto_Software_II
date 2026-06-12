"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = void 0;
const user_service_1 = require("../services/user.service");
const Factories_1 = require("../utils/Factories");
// S2-41: Obtener perfil
const getProfile = async (req, res, next) => {
    try {
        const user = await (0, user_service_1.getUserById)(req.user.id);
        res.status(200).json(Factories_1.UserFactory.createUserResponse(user));
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
