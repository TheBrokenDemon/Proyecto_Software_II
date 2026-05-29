/**
 * Servicio para verificar la conexión con el backend
 */

const API_URL = "http://localhost:4000/api";

/**
 * Verifica si el backend está disponible
 * @returns {Promise<boolean>} - true si está conectado, false si no
 */
export const checkBackendConnection = async () => {
  try {
    const response = await fetch("http://localhost:4000/health", {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✓ Conexión con backend exitosa:', data);
      return true;
    }
    console.warn('✗ Backend respondió con status:', response.status);
    return false;
  } catch (error) {
    console.error('✗ Error conectando con backend:', error.message);
    return false;
  }
};

/**
 * Intenta reconectar al backend con reintentos
 * @param {number} maxRetries - Número máximo de intentos
 * @param {number} delayMs - Milisegundos entre intentos
 * @returns {Promise<boolean>} - true si se conectó, false si agotó reintentos
 */
export const reconnectWithRetries = async (maxRetries = 5, delayMs = 2000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    console.log(`Intento ${attempt}/${maxRetries} de conexión al backend...`);
    
    if (await checkBackendConnection()) {
      return true;
    }
    
    if (attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.error('✗ No se pudo conectar al backend después de', maxRetries, 'intentos');
  return false;
};

/**
 * Obtiene el estado actual de la API
 * @returns {Promise<object>} - Estado del servidor
 */
export const getApiStatus = async () => {
  try {
    const response = await fetch("http://localhost:4000/health");
    if (!response.ok) throw new Error('Health check falló');
    return await response.json();
  } catch (error) {
    return { status: 'error', message: error.message };
  }
};
