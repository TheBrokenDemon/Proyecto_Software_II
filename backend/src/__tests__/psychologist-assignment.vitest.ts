import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import app from '../app';
import { pool } from '../config/db';
import jwt from 'jsonwebtoken';

// Hacemos mock del pool de la base de datos
vi.mock('../config/db', () => ({
  connectDB: vi.fn(),
  pool: {
    query: vi.fn()
  }
}));

// Hacemos mock de jsonwebtoken
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn()
  }
}));

// Hacemos mock del mailer para evitar errores si intenta enviar correo
vi.mock('../config/mailer', () => ({
  sendCitationEmailToStudent: vi.fn()
}));

describe('HU-73: Asignación de Estudiantes y Confidencialidad (Integración)', () => {

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock general para jwt.verify para que pase la autenticación
    (jwt.verify as any).mockReturnValue({
      id: 'psych-123',
      role: 'psicologo'
    });
    
    // Mock por defecto para pool.query (necesario para la sesión del middleware)
    (pool.query as any).mockImplementation((queryText: string) => {
      if (queryText.includes('SELECT id FROM sessions')) {
        return Promise.resolve({ rows: [{ id: 'session-123' }] });
      }
      return Promise.resolve({ rows: [] });
    });
  });

  it('TC1: Debería asignar estudiante al confirmar cita (200 OK)', async () => {
    // Configuramos las respuestas esperadas en la BD para un flujo exitoso
    (pool.query as any).mockImplementation((queryText: string, values: any[]) => {
      // 1. Verificación de sesión (Middleware)
      if (queryText.includes('SELECT id FROM sessions')) {
        return Promise.resolve({ rows: [{ id: 'session-123' }] });
      }
      // 2. Ubicar la solicitud y su estudiante
      if (queryText.includes('SELECT student_id FROM appointment_requests WHERE id = $1')) {
        return Promise.resolve({ rows: [{ student_id: 'student-456' }] });
      }
      // 3. Verificar si el estudiante ya está asignado
      if (queryText.includes('SELECT assigned_psychologist_id FROM users WHERE id = $1')) {
        return Promise.resolve({ rows: [{ assigned_psychologist_id: null }] });
      }
      // 4. Verificar cupo del psicólogo (retorna 3, por lo que hay cupo)
      if (queryText.includes('SELECT COUNT(*)::int AS total FROM users WHERE assigned_psychologist_id = $1')) {
        return Promise.resolve({ rows: [{ total: 3 }] });
      }
      // 5. Actualizar asignación del estudiante (el UPDATE)
      if (queryText.includes('UPDATE users SET assigned_psychologist_id = $1 WHERE id = $2')) {
        return Promise.resolve({ rowCount: 1, rows: [] });
      }
      // 6. Actualizar el estado de la solicitud
      if (queryText.includes('UPDATE appointment_requests')) {
        return Promise.resolve({
          rows: [{
            id: 'req-789', 
            status: 'confirmada',
            reason: 'Consulta inicial', 
            preferred_date: '2026-10-10'
          }]
        });
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/psychologist/appointment-requests/req-789')
      .set('Authorization', 'Bearer fake-token-jwt')
      .send({
        status: 'confirmada'
      });

    // Aserciones
    expect(res.status).toBe(200);
    expect(res.body.request.status).toBe('confirmada');
    
    // Verificamos que el query de UPDATE de asignación fue llamado con los valores correctos
    expect(pool.query).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET assigned_psychologist_id = $1 WHERE id = $2'),
      ['psych-123', 'student-456']
    );
  });

  it('TC2: Debería rechazar si el psicólogo alcanzó el cupo máximo (409 Conflict)', async () => {
    (pool.query as any).mockImplementation((queryText: string) => {
      // 1. Verificación de sesión (Middleware)
      if (queryText.includes('SELECT id FROM sessions')) {
        return Promise.resolve({ rows: [{ id: 'session-123' }] });
      }
      // 2. Ubicar la solicitud
      if (queryText.includes('SELECT student_id FROM appointment_requests WHERE id = $1')) {
        return Promise.resolve({ rows: [{ student_id: 'student-456' }] });
      }
      // 3. Verificar si está asignado
      if (queryText.includes('SELECT assigned_psychologist_id FROM users WHERE id = $1')) {
        return Promise.resolve({ rows: [{ assigned_psychologist_id: null }] });
      }
      // 4. Verificar cupo (simulamos cupo máximo alcanzado = 6)
      if (queryText.includes('SELECT COUNT(*)::int AS total FROM users WHERE assigned_psychologist_id = $1')) {
        return Promise.resolve({ rows: [{ total: 6 }] }); 
      }
      return Promise.resolve({ rows: [] });
    });

    const res = await request(app)
      .patch('/api/psychologist/appointment-requests/req-789')
      .set('Authorization', 'Bearer fake-token-jwt')
      .send({
        status: 'confirmada'
      });

    // Aserciones
    expect(res.status).toBe(409);
    expect(res.body.message).toContain('cupo máximo');
  });

  it('TC3: Debería denegar acceso a estudiante asignado a otro (403 Forbidden)', async () => {
    (pool.query as any).mockImplementation((queryText: string) => {
      // 1. Verificación de sesión (Middleware)
      if (queryText.includes('SELECT id FROM sessions')) {
        return Promise.resolve({ rows: [{ id: 'session-123' }] });
      }
      // 2. Confidencialidad en getStudentResponses (simulamos asignado a otro psicólogo)
      if (queryText.includes('SELECT assigned_psychologist_id FROM users WHERE id = $1')) {
        return Promise.resolve({ rows: [{ assigned_psychologist_id: 'otro-psych-999' }] });
      }
      return Promise.resolve({ rows: [] });
    });

    // Hacemos un GET al perfil/notas del estudiante
    const res = await request(app)
      .get('/api/psychologist/students/student-456')
      .set('Authorization', 'Bearer fake-token-jwt');

    // Aserciones
    expect(res.status).toBe(403);
    expect(res.body.message).toContain('asignado a otro');
  });

});
