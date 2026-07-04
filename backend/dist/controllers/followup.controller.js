"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.myFollowups = void 0;
const psychologist_service_1 = require("../services/psychologist.service");
// GET /api/followups/mine — el estudiante lee las notas/seguimientos de su psicólogo
const myFollowups = async (req, res) => {
    try {
        const followups = await (0, psychologist_service_1.getStudentFollowups)(req.user.id);
        res.status(200).json({ followups });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
};
exports.myFollowups = myFollowups;
