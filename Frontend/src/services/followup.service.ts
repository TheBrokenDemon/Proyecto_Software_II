import { API_URL, authHeaders, handleResponse } from './api';

export interface Followup {
    id: string;
    notes: string;
    status: string;
    created_at: string;
    psychologist_name?: string;
}

// El estudiante lee las notas/seguimientos de su psicólogo
export const getMyFollowups = async (): Promise<{ followups: Followup[] }> => {
    const res = await fetch(`${API_URL}/followups/mine`, { headers: authHeaders() });
    return handleResponse(res);
};