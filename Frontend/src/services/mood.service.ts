import { API_URL, authHeaders, handleResponse } from './api';

export interface MoodCheckin {
    id: string;
    mood: number;
    note: string | null;
    checkin_date: string;
    created_at: string;
}

// Historial reciente + racha de días consecutivos
export const getMoodHistory = async (): Promise<{ history: MoodCheckin[]; streak: number }> => {
    const res = await fetch(`${API_URL}/mood/checkins`, { headers: authHeaders() });
    return handleResponse(res);
};

// Check-in de hoy (o null)
export const getTodayMood = async (): Promise<{ checkin: MoodCheckin | null }> => {
    const res = await fetch(`${API_URL}/mood/checkins/today`, { headers: authHeaders() });
    return handleResponse(res);
};

// Crear o actualizar el ánimo de hoy
export const saveMood = async (mood: number, note?: string): Promise<{ checkin: MoodCheckin }> => {
    const res = await fetch(`${API_URL}/mood/checkins`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ mood, note: note ?? null }),
    });
    return handleResponse(res);
};