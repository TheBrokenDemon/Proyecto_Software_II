"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserFactory = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
// ── Patrón Factory: creación consistente de objetos ──────────
class UserFactory {
    static async createStudent(fullName, email, password, age, gender) {
        const hashedPassword = await bcryptjs_1.default.hash(String(password), parseInt(process.env.BCRYPT_ROUNDS || '10', 10));
        return {
            full_name: fullName.trim(),
            email: email.toLowerCase().trim(),
            password_hash: hashedPassword,
            age: age && !isNaN(Number(age)) ? parseInt(String(age), 10) : null,
            gender: gender?.toLowerCase() ?? null,
            role: 'estudiante',
        };
    }
    static async createPsychologist(fullName, email, password) {
        const hashedPassword = await bcryptjs_1.default.hash(String(password), parseInt(process.env.BCRYPT_ROUNDS || '10', 10));
        return {
            full_name: fullName.trim(),
            email: email.toLowerCase().trim(),
            password_hash: hashedPassword,
            role: 'psicologo',
        };
    }
    // Respuesta segura: nunca incluye password_hash
    static createUserResponse(dbUser, token = null) {
        return {
            user: {
                id: dbUser.id,
                full_name: dbUser.full_name,
                email: dbUser.email,
                age: dbUser.age ?? null,
                gender: dbUser.gender ?? null,
                role: dbUser.role,
            },
            token: token ?? null,
        };
    }
}
exports.UserFactory = UserFactory;
