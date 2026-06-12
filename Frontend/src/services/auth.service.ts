import { API_URL, headers, handleResponse } from './api';

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

// S2-39: Registro de usuario
export const registerUser = async (userData: RegisterPayload) => {
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(userData),
    });
    return handleResponse(res);
};

// S2-40: Inicio de sesión
export const loginUser = async (credentials: LoginPayload) => {
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify(credentials),
    });
    return handleResponse(res);
};

// S2-63: Solicitar recuperación de contraseña
export const forgotPassword = async (email: string) => {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ email }),
    });
    return handleResponse(res);
};

// S2-63: Resetear contraseña con token
export const resetPassword = async (token: string, newPassword: string) => {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: headers(),
        body: JSON.stringify({ token, newPassword }),
    });
    return handleResponse(res);
};