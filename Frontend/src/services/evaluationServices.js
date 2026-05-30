¡Oye, cometiste un error grave de lógica! Cuando el usuario actualiza sus datos de perfil (Historia S2-41), el sistema lo desloguea o le cierra la sesión automáticamente. ¡Eso está mal! El usuario debe permanecer autenticado después de guardar sus cambios.

Corrige el código del controlador del Backend (NodeJS/Express) para que haga lo siguiente:
1. Realiza el UPDATE en la base de datos PostgreSQL usando Sequelize o query directo con los nuevos datos (teléfono, carrera, ciclo, etc.).
2. NO alteres, borres ni destruyas la sesión (req.session) ni el token JWT.
3. Asegúrate de que el password no se esté re-hasheando o alterando en este endpoint si viene vacío, ya que eso rompe la autenticación.
4. Al terminar el proceso exitosamente, responde simplemente con un HTTP 200 y los datos actualizados del usuario en formato JSON para que el Frontend los pinte, sin tumbar el estado de autenticación.

Pásame el código corregido del controlador y de la ruta PUT/PATCH.const API_URL = "http://localhost:4000/api";

const getToken = () => localStorage.getItem('authToken');

/**
 * Obtiene la lista de todas las evaluaciones activas.
 * @returns {Promise<Array>}
 */
export const getEvaluations = async () => {
  const response = await fetch(`${API_URL}/evaluations`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  if (!response.ok) throw new Error('No se pudieron cargar las evaluaciones.');
  const data = await response.json();
  return data.evaluations;
};

/**
 * Obtiene los detalles y preguntas de una evaluación específica por su slug.
 * @param {string} slug - El slug de la evaluación.
 * @returns {Promise<Object>}
 */
export const getEvaluationBySlug = async (slug) => {
  const response = await fetch(`${API_URL}/evaluations/${slug}`, {
    headers: {
      'Authorization': `Bearer ${getToken()}`,
    },
  });
  if (!response.ok) throw new Error('No se pudo cargar la encuesta.');
  const data = await response.json();
  return data.evaluation;
};

/**
 * Envía las respuestas de una encuesta al backend.
 * @param {string} slug - El slug de la evaluación.
 * @param {Array} answers - Un array de objetos { question_id, answer }.
 * @returns {Promise<Object>}
 */
export const submitSurvey = async (slug, answers) => {
  const response = await fetch(`${API_URL}/evaluations/${slug}/responses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ answers }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Error al enviar las respuestas.');
  return data;
};