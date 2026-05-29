// Este es el archivo que permite conectar backend con frontend (registro de usuario)

// La URL base de tu API de backend. Según tu README, los endpoints están bajo /api
const API_URL = "http://localhost:4000/api";

// --- Funciones Auxiliares de Autenticación ---

const getToken = () => localStorage.getItem('authToken');

export const logoutUser = () => {
  localStorage.removeItem('authToken');
  // Opcional: llamar a un endpoint de logout en el backend si lo tienes
  // para invalidar el token en la base de datos.
};

/**
 * Registra un nuevo usuario en el backend.
 * @param {object} userData - Datos del usuario { full_name, email, password, age, gender }
 * @returns {Promise<object>} - Los datos del usuario registrado.
 */
export const registerUser = async (userData) => {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    // Lanza un error con el mensaje del backend para poder mostrarlo en la UI.
    throw new Error(errorData.message || 'Error al registrar el usuario.');
  }

  return response.json();
};

/**
 * Inicia sesión de un usuario.
 * @param {object} credentials - { email, password }
 * @returns {Promise<object>} - { token, user }
 */
export const loginUser = async (credentials) => {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al iniciar sesión.');
  }

  const data = await response.json();
  // Guardamos el token en localStorage para mantener la sesión
  if (data.token) {
    localStorage.setItem('authToken', data.token);
  }
  return data;
};

/**
 * Obtiene los datos del perfil del usuario autenticado.
 */
export const getUserProfile = async () => {
  const response = await fetch(`${API_URL}/users/profile`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  if (!response.ok) throw new Error('No se pudo obtener el perfil del usuario.');
  return response.json();
};

/**
 * Actualiza el perfil del usuario autenticado.
 * @param {object} profileData - Datos a actualizar { full_name, age, gender }
 */
export const updateUserProfile = async (profileData) => {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify(profileData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al actualizar el perfil.');
  }
  return response.json();
};
