import { API_URL, authHeaders, handleResponse } from './api';

export interface AppointmentRequest {
    id: string;
    reason: string;
    preferred_date: string | null;
    status: 'solicitada' | 'confirmada' | 'reprogramada' | 'rechazada' | 'cancelada';
    response_note: string | null;
    confirmed_date: string | null;
    created_at: string;
    psychologist_name?: string;
}

export const createAppointmentRequest = async (reason: string, preferred_date?: string) => {
    const res = await fetch(`${API_URL}/appointment-requests`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ reason, preferred_date: preferred_date || null }),
    });
    return handleResponse(res);
};

export const getMyAppointmentRequests = async (): Promise<{ requests: AppointmentRequest[] }> => {
    const res = await fetch(`${API_URL}/appointment-requests/mine`, { headers: authHeaders() });
    return handleResponse(res);
};

export const cancelAppointmentRequest = async (id: string) => {
    const res = await fetch(`${API_URL}/appointment-requests/${id}/cancel`, {
        method: 'PATCH',
        headers: authHeaders(),
    });
    return handleResponse(res);
};