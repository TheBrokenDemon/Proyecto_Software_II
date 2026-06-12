import { API_URL, authHeaders, handleResponse } from './api';

export interface UpdateProfilePayload {
    full_name?: string;
    age?: number;
    gender?: string;
}

// S2-41: Obtener perfil del usuario autenticado
export const getUserProfile = async () => {
    const res = await fetch(`${API_URL}/users/profile`, {
        headers: authHeaders(),
    });
    return handleResponse(res);
};

// S2-41: Actualizar perfil
export const updateUserProfile = async (profileData: UpdateProfilePayload) => {
    const res = await fetch(`${API_URL}/users/profile`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify(profileData),
    });
    return handleResponse(res);
};