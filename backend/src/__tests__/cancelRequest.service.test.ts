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

    const result = await cancelRequest('req-1', 'user-123');

    expect(result).not.toBeNull();
    expect(result).toMatchObject({
      id: 'req-1',
      status: 'cancelada',
      reason: 'Necesito orientación',
    });
    expect(q).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE appointment_requests'),
      ['req-1', 'user-123']
    );
  });

  test('R2: solicitud ya respondida (estado "confirmada") -> retorna null', async () => {
    q.mockResolvedValueOnce(noRows);

    const result = await cancelRequest('req-1', 'user-123');

    expect(result).toBeNull();
  });

  test('R2: solicitud de otro estudiante -> retorna null', async () => {
    q.mockResolvedValueOnce(noRows);

    const result = await cancelRequest('req-1', 'user-OTRO');

    expect(result).toBeNull();
  });

  test('R2: ID inexistente -> retorna null', async () => {
    q.mockResolvedValueOnce(noRows);

    const result = await cancelRequest('no-existe', 'user-123');

    expect(result).toBeNull();
  });

  test('R1: verificación de parámetros SQL (requestId y studentId)', async () => {
    q.mockResolvedValueOnce(cancelledRow);

    await cancelRequest('req-789', 'student-456');

    expect(q).toHaveBeenCalledTimes(1);
    expect(q).toHaveBeenCalledWith(
      expect.stringContaining('WHERE id = $1 AND student_id = $2 AND status = \'solicitada\''),
      ['req-789', 'student-456']
    );
  });
});

describe('cancelRequest — pruebas destructivas (casos edge)', () => {

  describe('Caso 3: IDs malformados y valores edge', () => {

    test('BUG: requestId vacío -> query ejecuta (debería validar UUID)', async () => {
      q.mockResolvedValueOnce(noRows);

      const result = await cancelRequest('', 'user-123');

      expect(result).toBeNull();
      expect(q).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appointment_requests'),
        ['', 'user-123']
      );
    });

    test('BUG: requestId no es UUID válido -> query ejecuta (debería validar formato)', async () => {
      q.mockResolvedValueOnce(noRows);

      const result = await cancelRequest('no-es-uuid', 'user-123');

      expect(result).toBeNull();
      expect(q).toHaveBeenCalled();
    });

    test('BUG: requestId con inyección SQL tentativa -> query parametrizada (seguro)', async () => {
      q.mockResolvedValueOnce(noRows);

      const result = await cancelRequest("'; DROP TABLE appointment_requests;--", 'user-123');

      expect(result).toBeNull();
      expect(q).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appointment_requests'),
        ["'; DROP TABLE appointment_requests;--", 'user-123']
      );
    });

    test('BUG: studentId vacío -> query ejecuta (debería validar)', async () => {
      q.mockResolvedValueOnce(noRows);

      const result = await cancelRequest('req-1', '');

      expect(result).toBeNull();
      expect(q).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appointment_requests'),
        ['req-1', '']
      );
    });

    test('BUG: ambos parámetros vacíos -> query ejecuta (debería validar)', async () => {
      q.mockResolvedValueOnce(noRows);

      const result = await cancelRequest('', '');

      expect(result).toBeNull();
      expect(q).toHaveBeenCalled();
    });

    test('BUG: requestId con espacios -> query ejecuta sin trim (debería normalizar)', async () => {
      q.mockResolvedValueOnce(noRows);

      const result = await cancelRequest('  req-1  ', 'user-123');

      expect(result).toBeNull();
      expect(q).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appointment_requests'),
        ['  req-1  ', 'user-123']
      );
    });

    test('BUG: requestId con caracteres especiales -> query parametrizada (seguro)', async () => {
      q.mockResolvedValueOnce(noRows);

      const result = await cancelRequest('req-1<script>alert(1)</script>', 'user-123');

      expect(result).toBeNull();
      expect(q).toHaveBeenCalled();
    });

    test('BUG: studentId con inyección SQL tentativa -> query parametrizada (seguro)', async () => {
      q.mockResolvedValueOnce(noRows);

      const result = await cancelRequest('req-1', "'; DROP TABLE users;--");

      expect(result).toBeNull();
      expect(q).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE appointment_requests'),
        ['req-1', "'; DROP TABLE users;--"]
      );
    });
  });
});
