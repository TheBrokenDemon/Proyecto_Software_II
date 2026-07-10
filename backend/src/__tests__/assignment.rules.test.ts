/**
 * S2-73 — Asignación de estudiantes y confidencialidad
 * PRUEBAS UNITARIAS CON JEST — respondRequest (reglas de asignación y cupo)
 *
 * CAJA BLANCA: se cubren las ramas de la función:
 *   B1: la solicitud no existe                     -> null
 *   B2: status 'rechazada'                          -> NO asigna (no verifica cupo)
 *   B3: estudiante ya asignado a OTRO psicólogo     -> error 409
 *   B4: estudiante ya asignado a MÍ                 -> procede sin verificar cupo
 *   B5: sin asignar y cupo LLENO (6)                -> error 409
 *   B6: sin asignar y cupo disponible               -> asigna y procede
 * CAJA NEGRA (valores límite del cupo): con 5 acepta, con 6 rechaza.
 *
 * La base de datos se simula (mock de pool.query) respondiendo en el
 * orden en que la función consulta.
 */
jest.mock('../config/db', () => ({ pool: { query: jest.fn() } }));

import { pool } from '../config/db';
import { respondRequest, MAX_STUDENTS_PER_PSYCHOLOGIST } from '../services/appointmentRequest.service';

const q = pool.query as jest.Mock;

// Filas simuladas
const reqRow = { rows: [{ student_id: 'est-1', status: 'solicitada' }] };                    // la solicitud existe
const noReq = { rows: [] };                                             // no existe
const assignedTo = (id: string | null) => ({ rows: [{ assigned_psychologist_id: id }] });
const count = (n: number) => ({ rows: [{ total: n }] });
const updated = { rows: [{ id: 'req-1', status: 'confirmada' }] };
const ok = { rows: [] };                                                // UPDATE de asignación

beforeEach(() => q.mockReset());

describe('respondRequest — asignación, exclusividad y cupo (máx 6)', () => {

  test('B1: la solicitud no existe -> devuelve null', async () => {
    q.mockResolvedValueOnce(noReq);
    const r = await respondRequest('req-x', 'psy-1', 'confirmada');
    expect(r).toBeNull();
  });

  test('B2: al RECHAZAR no se asigna al estudiante (no consulta asignación)', async () => {
    q.mockResolvedValueOnce(reqRow)     // 1) buscar solicitud
     .mockResolvedValueOnce(updated);   // 2) actualizar solicitud
    await respondRequest('req-1', 'psy-1', 'rechazada');
    // Solo 2 consultas: nunca miró asignación ni cupo
    expect(q).toHaveBeenCalledTimes(2);
  });

  test('B3: estudiante asignado a OTRO psicólogo -> error 409', async () => {
    q.mockResolvedValueOnce(reqRow)
     .mockResolvedValueOnce(assignedTo('psy-OTRO'));
    await expect(respondRequest('req-1', 'psy-1', 'confirmada'))
      .rejects.toMatchObject({ status: 409 });
  });

  test('B4: estudiante ya asignado a MÍ -> procede sin verificar cupo', async () => {
    q.mockResolvedValueOnce(reqRow)
     .mockResolvedValueOnce(assignedTo('psy-1'))   // ya es mío
     .mockResolvedValueOnce(updated);              // actualizar solicitud
    const r = await respondRequest('req-1', 'psy-1', 'confirmada');
    expect(r).toMatchObject({ status: 'confirmada' });
    expect(q).toHaveBeenCalledTimes(3);            // nunca contó el cupo
  });

  test('B5 (límite): sin asignar y cupo LLENO (6) -> error 409', async () => {
    q.mockResolvedValueOnce(reqRow)
     .mockResolvedValueOnce(assignedTo(null))
     .mockResolvedValueOnce(count(MAX_STUDENTS_PER_PSYCHOLOGIST)); // 6
    await expect(respondRequest('req-1', 'psy-1', 'confirmada'))
      .rejects.toMatchObject({ status: 409 });
  });

  test('B6 (límite): sin asignar y cupo con 5 -> asigna y confirma', async () => {
    q.mockResolvedValueOnce(reqRow)
     .mockResolvedValueOnce(assignedTo(null))
     .mockResolvedValueOnce(count(5))   // debajo del máximo
     .mockResolvedValueOnce(ok)          // UPDATE users (asignación)
     .mockResolvedValueOnce(updated);   // UPDATE solicitud
    const r = await respondRequest('req-1', 'psy-1', 'confirmada');
    expect(r).toMatchObject({ status: 'confirmada' });
    // La 4a consulta fue la asignación del estudiante al psicólogo
    expect(q.mock.calls[3][0]).toContain('UPDATE users SET assigned_psychologist_id');
  });

  test('B6: REPROGRAMAR también asigna (misma regla que confirmar)', async () => {
    q.mockResolvedValueOnce(reqRow)
     .mockResolvedValueOnce(assignedTo(null))
     .mockResolvedValueOnce(count(0))
     .mockResolvedValueOnce(ok)
     .mockResolvedValueOnce({ rows: [{ id: 'req-1', status: 'reprogramada' }] });
    const r = await respondRequest('req-1', 'psy-1', 'reprogramada');
    expect(r).toMatchObject({ status: 'reprogramada' });
  });
});
