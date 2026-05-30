/**
 * PATRÓN: FACTORY
 * Centraliza la creación de objetos complejos
 * Beneficio: Lógica de creación en un lugar, fácil de testear, consistencia
 */

const bcrypt = require('bcryptjs');

/**
 * UserFactory - Crea usuarios con validaciones y transformaciones consistentes
 */
class UserFactory {
  /**
   * Crear usuario de tipo "estudiante"
   */
  static async createStudent(fullName, email, password, age, gender) {
    // Validar email duplicado, hashing, etc.
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || 10));

    return {
      full_name: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      // CORRECCIÓN: Se valida que 'age' sea un número antes de convertirlo.
      // Si no es un número válido (ej. null, undefined, ''), se asigna null.
      age: !isNaN(parseInt(age)) ? parseInt(age) : null,
      gender: gender?.toLowerCase() ?? 'prefiero no decirlo',
      role: 'estudiante',
      created_at: new Date(),
    };
  }

  /**
   * Crear usuario de tipo "psicólogo"
   */
  static async createPsychologist(fullName, email, password, professionalId) {
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || 10));

    return {
      full_name: fullName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      professional_id: professionalId,
      role: 'psicólogo',
      created_at: new Date(),
    };
  }

  /**
   * Crear objeto de respuesta de usuario (sin password)
   */
  static createUserResponse(dbUser, token = null) {
    const response = {
      user: {
        id: dbUser.id,
        full_name: dbUser.full_name,
        email: dbUser.email,
        age: dbUser.age,
        gender: dbUser.gender,
        role: dbUser.role,
      },
      token: token || null,
    };
    return response;
  }
}

/**
 * EvaluationFactory - Crea evaluaciones con estructura consistente
 */
class EvaluationFactory {
  /**
   * Crear respuesta de evaluación
   */
  static createEvaluationResponse(userId, evaluationId, answers) {
    return {
      user_id: userId,
      evaluation_id: evaluationId,
      answers: answers, // [{ question_id, answer_value }]
      completed_at: new Date(),
    };
  }

  /**
   * Crear objeto de respuesta HTTP de evaluación
   */
  static createEvaluationResponseDTO(dbResponse) {
    return {
      id: dbResponse.id,
      completed_at: dbResponse.completed_at,
      evaluation_title: dbResponse.evaluation_title,
      answers: dbResponse.answers || [],
    };
  }
}

/**
 * ObservationFactory - Crea observaciones de psicólogos
 */
class ObservationFactory {
  /**
   * Crear observación
   */
  static createObservation(studentId, psychologistId, text) {
    return {
      student_id: studentId,
      psychologist_id: psychologistId,
      text: text.trim(),
      created_at: new Date(),
    };
  }

  /**
   * Crear DTO para respuesta HTTP
   */
  static createObservationDTO(dbObservation) {
    return {
      id: dbObservation.id,
      student_id: dbObservation.student_id,
      psychologist_name: dbObservation.psychologist_name,
      text: dbObservation.text,
      created_at: dbObservation.created_at,
    };
  }
}

module.exports = {
  UserFactory,
  EvaluationFactory,
  ObservationFactory,
};
