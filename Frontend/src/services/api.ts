// ══════════════════════════════════════════
// MindCheck — Configuración base de la API
// ══════════════════════════════════════════

export const API_URL = 'http://localhost:3000/api';

export const getToken = (): string | null => localStorage.getItem('authToken');

export const authHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
});

export const headers = (): HeadersInit => ({
    'Content-Type': 'application/json',
});

// Helper: lanza error con el mensaje del backend
export const handleResponse = async (res: Response) => {
    if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Error del servidor.' }));
        throw new Error(err.message || 'Error del servidor.');
    }
    return res.json();
};