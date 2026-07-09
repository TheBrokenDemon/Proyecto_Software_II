import { respondRequest, MAX_STUDENTS_PER_PSYCHOLOGIST } from '../services/appointmentRequest.service';
import { pool } from '../config/db';

// Nota: este proyecto no usa el SDK @supabase/supabase-js. El acceso a datos
// se hace mediante pool.query (pg.Pool) contra el Postgres administrado por
// Supabase, definido en '../config/db'. Por eso mockeamos ese módulo en vez
// de un cliente de supabase-js que no existe en el código fuente.
jest.mock('../config/db', () => ({
  pool: {
    query: jest.fn(),
  },
}));

const mockedQuery = pool.query as jest.Mock;

// Datos de ejemplo reutilizados entre pruebas
const REQUEST_ID = 'req-789';
const STUDENT_ID = 'student-456';
const PSYCHOLOGIST_ID = 'psych-123';
const OTHER_PSYCHOLOGIST_ID = 'psych-999';

// Fila devuelta por la actualización final de la solicitud
const buildFinalRequestRow = (status: string) => ({
  id: REQUEST_ID,
  reason: 'Consulta inicial',
  preferred_date: '2026-10-10',
  status,
  response_note: null,
  confirmed_date: null,
  created_at: '2026-07-01T00:00:00.000Z',
});

describe('HU-73: respondRequest (Unidad de Caja Blanca)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('P1: retorna null cuando la solicitud no existe (D1=T)', async () => {
    mockedQuery.mockImplementation((queryText: string) => {
      if (queryText.includes('SELECT student_id FROM appointment_requests WHERE id = $1')) {
        return Promise.resolve({ rows: [] });
      }
      return Promise.resolve({ rows: [] });
    });

    const result = await respondRequest(REQUEST_ID, PSYCHOLOGIST_ID, 'confirmada');

    expect(result).toBeNull();
    // Solo debió ejecutarse la primera consulta; no debe intentar asignar ni actualizar
    expect(mockedQuery).toHaveBeenCalledTimes(1);
  });

  it("P2: estado 'rechazada' no dispara la lógica de asignación (D2a=F, D2b=F)", async () => {
    mockedQuery.mockImplementation((queryText: string) => {
      if (queryText.includes('SELECT student_id FROM appointment_requests WHERE id = $1')) {
        return Promise.resolve({ rows: [{ student_id: STUDENT_ID }] });
      }
      if (queryText.includes('UPDATE appointment_requests')) {
        return Promise.resolve({ rows: [buildFinalRequestRow('rechazada')] });
      }
      throw new Error(`Consulta inesperada en P2: ${queryText}`);
    });

    const result = await respondRequest(REQUEST_ID, PSYCHOLOGIST_ID, 'rechazada');

    expect(result?.status).toBe('rechazada');
    // Nunca debió consultar assigned_psychologist_id ni el cupo
    expect(mockedQuery).not.toHaveBeenCalledWith(
      expect.stringContaining('SELECT assigned_psychologist_id'),
      expect.anything()
    );
  });

  it("P3: rechaza con 409 si el estudiante ya está asignado a OTRO psicólogo (D3a=T, D3b=T)", async () => {
    mockedQuery.mockImplementation((queryText: string) => {
      if (queryText.includes('SELECT student_id FROM appointment_requests WHERE id = $1')) {
        return Promise.resolve({ rows: [{ student_id: STUDENT_ID }] });
      }
      if (queryText.includes('SELECT assigned_psychologist_id FROM users WHERE id = $1')) {
        return Promise.resolve({ rows: [{ assigned_psychologist_id: OTHER_PSYCHOLOGIST_ID }] });
      }
      throw new Error(`Consulta inesperada en P3: ${queryText}`);
    });

    expect.assertions(3);
    try {
      await respondRequest(REQUEST_ID, PSYCHOLOGIST_ID, 'confirmada');
    } catch (err: any) {
      expect(err.status).toBe(409);
      expect(err.message).toContain('asignado a otro psicólogo');
    }
    // No debió intentar validar cupo ni actualizar la solicitud
    expect(mockedQuery).not.toHaveBeenCalledWith(
      expect.stringContaining('COUNT(*)'),
      expect.anything()
    );
  });

  it('P4: no reasigna ni valida cupo si el estudiante ya es del MISMO psicólogo (D3a=T, D3b=F, D4=F)', async () => {
    mockedQuery.mockImplementation((queryText: string) => {
      if (queryText.includes('SELECT student_id FROM appointment_requests WHERE id = $1')) {
        return Promise.resolve({ rows: [{ student_id: STUDENT_ID }] });
      }
      if (queryText.includes('SELECT assigned_psychologist_id FROM users WHERE id = $1')) {
        return Promise.resolve({ rows: [{ assigned_psychologist_id: PSYCHOLOGIST_ID }] });
      }
      if (queryText.includes('UPDATE appointment_requests')) {
        return Promise.resolve({ rows: [buildFinalRequestRow('confirmada')] });
      }
      throw new Error(`Consulta inesperada en P4: ${queryText}`);
    });

    const result = await respondRequest(REQUEST_ID, PSYCHOLOGIST_ID, 'confirmada');

    expect(result?.status).toBe('confirmada');
    expect(mockedQuery).not.toHaveBeenCalledWith(
      expect.stringContaining('COUNT(*)'),
      expect.anything()
    );
    expect(mockedQuery).not.toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET assigned_psychologist_id'),
      expect.anything()
    );
  });

  it('P5: rechaza con 409 al alcanzar el cupo máximo de 6 estudiantes (D4=T, D5=T)', async () => {
    mockedQuery.mockImplementation((queryText: string) => {
      if (queryText.includes('SELECT student_id FROM appointment_requests WHERE id = $1')) {
        return Promise.resolve({ rows: [{ student_id: STUDENT_ID }] });
      }
      if (queryText.includes('SELECT assigned_psychologist_id FROM users WHERE id = $1')) {
        return Promise.resolve({ rows: [{ assigned_psychologist_id: null }] });
      }
      if (queryText.includes('SELECT COUNT(*)::int AS total FROM users WHERE assigned_psychologist_id = $1')) {
        return Promise.resolve({ rows: [{ total: MAX_STUDENTS_PER_PSYCHOLOGIST }] });
      }
      throw new Error(`Consulta inesperada en P5: ${queryText}`);
    });

    expect.assertions(3);
    try {
      await respondRequest(REQUEST_ID, PSYCHOLOGIST_ID, 'confirmada');
    } catch (err: any) {
      expect(err.status).toBe(409);
      expect(err.message).toContain('cupo máximo');
    }
    expect(mockedQuery).not.toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET assigned_psychologist_id'),
      expect.anything()
    );
  });

  it('P6 (happy path): asigna al estudiante cuando hay cupo disponible con status="confirmada" (D4=T, D5=F)', async () => {
    mockedQuery.mockImplementation((queryText: string, values: any[]) => {
      if (queryText.includes('SELECT student_id FROM appointment_requests WHERE id = $1')) {
        return Promise.resolve({ rows: [{ student_id: STUDENT_ID }] });
      }
      if (queryText.includes('SELECT assigned_psychologist_id FROM users WHERE id = $1')) {
        return Promise.resolve({ rows: [{ assigned_psychologist_id: null }] });
      }
      if (queryText.includes('SELECT COUNT(*)::int AS total FROM users WHERE assigned_psychologist_id = $1')) {
        return Promise.resolve({ rows: [{ total: 3 }] });
      }
      if (queryText.includes('UPDATE users SET assigned_psychologist_id = $1 WHERE id = $2')) {
        return Promise.resolve({ rowCount: 1, rows: [] });
      }
      if (queryText.includes('UPDATE appointment_requests')) {
        return Promise.resolve({ rows: [buildFinalRequestRow('confirmada')] });
      }
      throw new Error(`Consulta inesperada en P6: ${queryText}`);
    });

    const result = await respondRequest(REQUEST_ID, PSYCHOLOGIST_ID, 'confirmada');

    expect(result?.status).toBe('confirmada');
    expect(mockedQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET assigned_psychologist_id = $1 WHERE id = $2'),
      [PSYCHOLOGIST_ID, STUDENT_ID]
    );
  });

  it("P7: asigna al estudiante con status='reprogramada', cubriendo el 2do operando del OR (D2a=F, D2b=T, D4=T, D5=F)", async () => {
    mockedQuery.mockImplementation((queryText: string) => {
      if (queryText.includes('SELECT student_id FROM appointment_requests WHERE id = $1')) {
        return Promise.resolve({ rows: [{ student_id: STUDENT_ID }] });
      }
      if (queryText.includes('SELECT assigned_psychologist_id FROM users WHERE id = $1')) {
        return Promise.resolve({ rows: [{ assigned_psychologist_id: null }] });
      }
      if (queryText.includes('SELECT COUNT(*)::int AS total FROM users WHERE assigned_psychologist_id = $1')) {
        return Promise.resolve({ rows: [{ total: 0 }] });
      }
      if (queryText.includes('UPDATE users SET assigned_psychologist_id = $1 WHERE id = $2')) {
        return Promise.resolve({ rowCount: 1, rows: [] });
      }
      if (queryText.includes('UPDATE appointment_requests')) {
        return Promise.resolve({ rows: [buildFinalRequestRow('reprogramada')] });
      }
      throw new Error(`Consulta inesperada en P7: ${queryText}`);
    });

    const result = await respondRequest(REQUEST_ID, PSYCHOLOGIST_ID, 'reprogramada');

    expect(result?.status).toBe('reprogramada');
    expect(mockedQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET assigned_psychologist_id = $1 WHERE id = $2'),
      [PSYCHOLOGIST_ID, STUDENT_ID]
    );
  });

  it("P8: no reasigna con status='reprogramada' cuando ya es del mismo psicólogo (D2a=F, D2b=T, D3a=T, D3b=F, D4=F)", async () => {
    mockedQuery.mockImplementation((queryText: string) => {
      if (queryText.includes('SELECT student_id FROM appointment_requests WHERE id = $1')) {
        return Promise.resolve({ rows: [{ student_id: STUDENT_ID }] });
      }
      if (queryText.includes('SELECT assigned_psychologist_id FROM users WHERE id = $1')) {
        return Promise.resolve({ rows: [{ assigned_psychologist_id: PSYCHOLOGIST_ID }] });
      }
      if (queryText.includes('UPDATE appointment_requests')) {
        return Promise.resolve({ rows: [buildFinalRequestRow('reprogramada')] });
      }
      throw new Error(`Consulta inesperada en P8: ${queryText}`);
    });

    const result = await respondRequest(REQUEST_ID, PSYCHOLOGIST_ID, 'reprogramada');

    expect(result?.status).toBe('reprogramada');
    expect(mockedQuery).not.toHaveBeenCalledWith(
      expect.stringContaining('COUNT(*)'),
      expect.anything()
    );
    expect(mockedQuery).not.toHaveBeenCalledWith(
      expect.stringContaining('UPDATE users SET assigned_psychologist_id'),
      expect.anything()
    );
  });
});
