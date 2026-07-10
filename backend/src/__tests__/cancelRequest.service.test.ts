/**
 * S2-83 — Solicitud de cita por el estudiante
 * PRUEBAS UNITARIAS DE CAJA BLANCA — cancelRequest (servicio)
 *
 * Técnica: cobertura de ramas de la función cancelRequest
 * (appointmentRequest.service.ts:49-63)
 *
 *   R1: UPDATE retorna filas (coincide id + student_id + status='solicitada')
 *       -> retorna rows[0] con status "cancelada"
 *
 *   R2: UPDATE no retorna filas (solicitud ya atendida, de otro usuario, o inexistente)
 *       -> retorna null
 *
 * La base de datos se simula (mock de pool.query) respondiendo según el escenario.
 */

jest.mock('../config/db', () => ({ pool: { query: jest.fn() } }));

import { pool } from '../config/db';
import { cancelRequest } from '../services/appointmentRequest.service';

const q = pool.query as jest.Mock;

const cancelledRow = {
  rows: [{
    id: 'req-1',
    reason: 'Necesito orientación',
    preferred_date: '2026-08-15',
    status: 'cancelada',
    response_note: null,
    confirmed_date: null,
    created_at: '2026-07-01T00:00:00.000Z',
  }],
};

const noRows = { rows: [] };

beforeEach(() => q.mockReset());

describe('cancelRequest — cobertura de ramas (líneas 49-63)', () => {

  test('R1: cancelación exitosa (solicitud propia en estado "solicitada") -> retorna fila', async () => {
    q.mockResolvedValueOnce(cancelledRow);

    const result = await cancelRequest('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');

    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      id: 'req-1',
      status: 'cancelada',
      reason: 'Necesito orientación',
    });
    expect(q).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE appointment_requests'),
      ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001']
    );
  });

  test('R2: solicitud ya respondida (estado "confirmada") -> retorna null', async () => {
    q.mockResolvedValueOnce(noRows);

    const result = await cancelRequest('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');

    expect(result).toBeNull();
  });

  test('R2: solicitud de otro estudiante -> retorna null', async () => {
    q.mockResolvedValueOnce(noRows);

    const result = await cancelRequest('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002');

    expect(result).toBeNull();
  });

  test('R2: ID inexistente -> retorna null', async () => {
    q.mockResolvedValueOnce(noRows);

    const result = await cancelRequest('550e8400-e29b-41d4-a716-446655440099', '550e8400-e29b-41d4-a716-446655440001');

    expect(result).toBeNull();
  });

  test('R1: verificación de parámetros SQL (requestId y studentId)', async () => {
    q.mockResolvedValueOnce(cancelledRow);

    await cancelRequest('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');

    expect(q).toHaveBeenCalledTimes(1);
    expect(q).toHaveBeenCalledWith(
      expect.stringContaining('WHERE id = $1 AND student_id = $2 AND status = \'solicitada\''),
      ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001']
    );
  });
});

describe('cancelRequest — validación de UUIDs (Fix 3 aplicado)', () => {

  describe('Caso 3: Validación de IDs malformados', () => {

    test('FIX: requestId vacío -> error 400 (valida UUID)', async () => {
      await expect(cancelRequest('', '550e8400-e29b-41d4-a716-446655440000'))
        .rejects.toMatchObject({ status: 400, message: 'ID de solicitud inválido.' });
      expect(q).not.toHaveBeenCalled();
    });

    test('FIX: requestId no es UUID válido -> error 400', async () => {
      await expect(cancelRequest('no-es-uuid', '550e8400-e29b-41d4-a716-446655440000'))
        .rejects.toMatchObject({ status: 400, message: 'ID de solicitud inválido.' });
      expect(q).not.toHaveBeenCalled();
    });

    test('FIX: requestId con inyección SQL tentativa -> error 400 (no es UUID)', async () => {
      await expect(cancelRequest("'; DROP TABLE appointment_requests;--", '550e8400-e29b-41d4-a716-446655440000'))
        .rejects.toMatchObject({ status: 400, message: 'ID de solicitud inválido.' });
      expect(q).not.toHaveBeenCalled();
    });

    test('FIX: studentId vacío -> error 400', async () => {
      await expect(cancelRequest('550e8400-e29b-41d4-a716-446655440000', ''))
        .rejects.toMatchObject({ status: 400, message: 'ID de estudiante inválido.' });
      expect(q).not.toHaveBeenCalled();
    });

    test('FIX: ambos parámetros vacíos -> error 400 (valida requestId primero)', async () => {
      await expect(cancelRequest('', ''))
        .rejects.toMatchObject({ status: 400, message: 'ID de solicitud inválido.' });
      expect(q).not.toHaveBeenCalled();
    });

    test('FIX: requestId con espacios alrededor de UUID válido -> ejecuta query con trim', async () => {
      q.mockResolvedValueOnce(cancelledRow);

      const result = await cancelRequest('  550e8400-e29b-41d4-a716-446655440000  ', '550e8400-e29b-41d4-a716-446655440001');

      expect(result).not.toBeNull();
      expect(q).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appointment_requests'),
        ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001']
      );
    });

    test('FIX: requestId con caracteres especiales -> error 400 (no es UUID)', async () => {
      await expect(cancelRequest('req-1<script>alert(1)</script>', '550e8400-e29b-41d4-a716-446655440000'))
        .rejects.toMatchObject({ status: 400, message: 'ID de solicitud inválido.' });
      expect(q).not.toHaveBeenCalled();
    });

    test('FIX: studentId con inyección SQL tentativa -> error 400 (no es UUID)', async () => {
      await expect(cancelRequest('550e8400-e29b-41d4-a716-446655440000', "'; DROP TABLE users;--"))
        .rejects.toMatchObject({ status: 400, message: 'ID de estudiante inválido.' });
      expect(q).not.toHaveBeenCalled();
    });

    test('FIX: UUIDs válidos en formato correcto -> ejecuta query normalmente', async () => {
      q.mockResolvedValueOnce(cancelledRow);

      const result = await cancelRequest('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001');

      expect(result).not.toBeNull();
      expect(q).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appointment_requests'),
        ['550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001']
      );
    });
  });
});
