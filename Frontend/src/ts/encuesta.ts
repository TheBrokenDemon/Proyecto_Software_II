// La URL base de tu API de backend.
const API_URL = "http://localhost:3000/api";

const getToken = () => localStorage.getItem("authToken");

/**
 * Obtiene la lista de todas las evaluaciones activas desde el backend.
 * @returns {Promise<any[]>} - Un array de objetos de evaluación.
 */
export const getEvaluations = async () => {
  const res = await fetch(`${API_URL}/evaluations`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Error en el servidor al obtener encuestas." }));
    throw new Error(errorData.message || "No se pudieron obtener las encuestas.");
  }

  const data = await res.json();
  return data.evaluations; // Devuelve el array de evaluaciones
};

/**
 * Obtiene los detalles de una encuesta específica por su slug.
 */
export const getEvaluationBySlug = async (slug: string) => {
  const res = await fetch(`${API_URL}/evaluations/${slug}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Error al cargar la evaluación." }));
    throw new Error(errorData.message || "No se pudo obtener la evaluación.");
  }
  const data = await res.json();
  return data.evaluation; // Devuelve el objeto de la evaluación directamente
};

/**
 * Envía las respuestas de una encuesta completada.
 */
export const submitSurvey = async (
  slug: string,
  answers: { question_id: string; answer: string }[]
) => {
  const res = await fetch(`${API_URL}/evaluations/${slug}/responses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify({ answers }),
  });

  if (!res.ok) {
    const errorData = await res
      .json()
      .catch(() => ({ message: "Error al enviar las respuestas." }));
    throw new Error(errorData.message || "No se pudieron enviar las respuestas.");
  }
  return res.json();
};