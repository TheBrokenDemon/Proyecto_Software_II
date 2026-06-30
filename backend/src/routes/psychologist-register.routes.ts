import { Router, Request, Response, NextFunction } from 'express';
import { UserFactory } from '../utils/Factories';
import { pool } from '../config/db';

const router = Router();

// POST /api/psychologist-register
// Registro de psicólogos — en producción proteger con auth de admin
router.post('/', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { full_name, email, password } = req.body;

    try {
        if (!full_name || !email || !password) {
            res.status(400).json({ message: 'Nombre, email y contraseña son obligatorios.' });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ message: 'La contraseña debe tener mínimo 6 caracteres.' });
            return;
        }
        if (!email.includes('@')) {
            res.status(400).json({ message: 'Email inválido.' });
            return;
        }

        const existing = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email.toLowerCase().trim()]
        );
        if (existing.rows.length > 0) {
            res.status(409).json({ message: 'El email ya está registrado.' });
            return;
        }

        // CORRECCIÓN: UserFactory.createPsychologist ya hashea la contraseña
        // No importa si tiene letras, números o símbolos — bcrypt lo acepta todo
        const payload = await UserFactory.createPsychologist(full_name, email, password);

        const { rows } = await pool.query(
            `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, full_name, email, role`,
            [payload.full_name, payload.email, payload.password_hash, payload.role]
        );

        res.status(201).json({
            message: 'Psicólogo registrado exitosamente.',
            psychologist: rows[0],
        });
    } catch (err) {
        next(err);
    }
});

export default router;