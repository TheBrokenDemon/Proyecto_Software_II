import bcrypt from 'bcryptjs';
import { UserRow } from '../types';

// ── Patrón Factory: creación consistente de objetos ──────────

export class UserFactory {
    static async createStudent(
        fullName: string,
        email: string,
        password: string,
        age?: number | null,
        gender?: string | null
    ) {
        const hashedPassword = await bcrypt.hash(
            String(password),
            parseInt(process.env.BCRYPT_ROUNDS || '10', 10)
        );
        return {
            full_name: fullName.trim(),
            email: email.toLowerCase().trim(),
            password_hash: hashedPassword,
            age: age && !isNaN(Number(age)) ? parseInt(String(age), 10) : null,
            gender: gender?.toLowerCase() ?? null,
            role: 'estudiante' as const,
        };
    }

    static async createPsychologist(
        fullName: string,
        email: string,
        password: string
    ) {
        const hashedPassword = await bcrypt.hash(
            String(password),
            parseInt(process.env.BCRYPT_ROUNDS || '10', 10)
        );
        return {
            full_name: fullName.trim(),
            email: email.toLowerCase().trim(),
            password_hash: hashedPassword,
            role: 'psicologo' as const,
        };
    }

    // Respuesta segura: nunca incluye password_hash
    static createUserResponse(dbUser: Partial<UserRow>, token: string | null = null) {
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