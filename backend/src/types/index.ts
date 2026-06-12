// ══════════════════════════════════════════
// MindCheck ULima — Tipos compartidos
// ══════════════════════════════════════════

import { Request } from 'express';

// ── Usuario autenticado en el token ──────
export interface AuthUser {
    id: string;
    email: string;
    role: 'estudiante' | 'psicologo';
}

// ── Request con usuario autenticado ──────
export interface AuthRequest extends Request {
    user: AuthUser;
}

// ── Filas de BD ──────────────────────────
export interface UserRow {
    id: string;
    full_name: string;
    email: string;
    password_hash: string;
    age: number | null;
    gender: string | null;
    role: 'estudiante' | 'psicologo';
    created_at: Date;
    updated_at: Date;
}

export interface SessionRow {
    id: string;
    user_id: string;
    token: string;
    expires_at: Date;
}

export interface EvaluationRow {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    icon: string | null;
    is_active: boolean;
}

export interface QuestionRow {
    id: string;
    evaluation_id: string;
    content: string;
    type: 'scale' | 'multiple_choice' | 'text';
    options: string[] | null;
    order_index: number;
    required: boolean;
}

export interface EvaluationResponseRow {
    id: string;
    user_id: string;
    evaluation_id: string;
    completed_at: Date;
}

export interface FollowupRow {
    id: string;
    student_id: string;
    psychologist_id: string;
    status: 'pendiente' | 'en_seguimiento' | 'cerrado';
    notes: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface AppointmentRow {
    id: string;
    followup_id: string | null;
    student_id: string;
    psychologist_id: string;
    scheduled_at: Date | null;
    status: 'pendiente' | 'confirmada' | 'reprogramada' | 'cancelada';
    psychologist_notes: string | null;
    student_notes: string | null;
    created_at: Date;
    updated_at: Date;
}

// ── Payloads de entrada ───────────────────
export interface RegisterPayload {
    full_name: string;
    email: string;
    password: string;
    age?: number;
    gender?: string;
    role?: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface AnswerPayload {
    question_id: string;
    answer: string;
}

// ── Error con status HTTP ────────────────
export interface AppError extends Error {
    status?: number;
}