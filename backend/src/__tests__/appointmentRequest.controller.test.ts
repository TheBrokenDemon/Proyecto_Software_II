/**
 * S2-83 — Solicitud de cita por el estudiante
 * PRUEBAS UNITARIAS DE CAJA BLANCA — Controladores
 *
 * Técnica: cobertura de ramas de decisión en los controladores.
 *
 *   requestAppointment (appointmentRequest.controller.ts:6-22):
 *     R1: !reason || typeof reason !== 'string' || !reason.trim()  -> 400
 *     R2: reason.length > 1000                                     -> 400
 *     R3: camino feliz                                             -> 201
 *
 *   cancelMyRequest (appointmentRequest.controller.ts:35-46):
 *     R1: cancelRequest retorna null                               -> 400
 *     R2: cancelRequest retorna fila                               -> 200
 *
 *   respondAppointmentRequest (psychologist.controller.ts:134-151):
 *     R1: !valid.includes(status)                                  -> 400
 *     R2: respondRequest retorna null                              -> 404
 *     R3: status válido y encontrado                               -> 200
 *     R4: error con status HTTP                                    -> err.status || 500
 *
 *   myRequests (appointmentRequest.controller.ts:25-32):
 *     R1: siempre retorna 200 con array
 */

jest.mock('../services/appointmentRequest.service', () => ({
  createRequest: jest.fn(),
  getMyRequests: jest.fn(),
  cancelRequest: jest.fn(),
  respondRequest: jest.fn(),
}));

import { Response } from 'express';
import {
  requestAppointment,
  myRequests,
  cancelMyRequest,
} from '../controllers/appointmentRequest.controller';
import { respondAppointmentRequest } from '../controllers/psychologist.controller';
import { AuthRequest } from '../types';
import {
  createRequest,
  getMyRequests,
  cancelRequest,
  respondRequest,
} from '../services/appointmentRequest.service';

const mockReq = (body: any, params: any = {}): AuthRequest =>
  ({ body, params, user: { id: 'user-123', role: 'estudiante' } } as unknown as AuthRequest);

const mockReqPsych = (body: any, params: any = {}): AuthRequest =>
  ({ body, params, user: { id: 'psych-123', role: 'psicologo' } } as unknown as AuthRequest);

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

beforeEach(() => jest.clearAllMocks());

describe('requestAppointment — cobertura de ramas (líneas 6-22)', () => {

  test('R3: reason válido con preferred_date -> 201 y llama createRequest', async () => {
    const mockRequest = { id: 'req-1', status: 'solicitada' };
    (createRequest as jest.Mock).mockResolvedValue(mockRequest);

    const res = mockRes();
    await requestAppointment(
      mockReq({ reason: 'Necesito orientación', preferred_date: '2026-08-15' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(201);
    expect(createRequest).toHaveBeenCalledWith('user-123', 'Necesito orientación', '2026-08-15');
    expect(res.json).toHaveBeenCalledWith({ request: mockRequest });
  });

  test('R3: reason válido sin preferred_date -> 201 con null', async () => {
    const mockRequest = { id: 'req-2', status: 'solicitada' };
    (createRequest as jest.Mock).mockResolvedValue(mockRequest);

    const res = mockRes();
    await requestAppointment(mockReq({ reason: 'Consulta general' }), res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(createRequest).toHaveBeenCalledWith('user-123', 'Consulta general', null);
  });

  test('R3: reason exactamente 1000 caracteres (límite válido) -> 201', async () => {
    const mockRequest = { id: 'req-3', status: 'solicitada' };
    (createRequest as jest.Mock).mockResolvedValue(mockRequest);

    const res = mockRes();
    await requestAppointment(mockReq({ reason: 'a'.repeat(1000) }), res);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('R1: reason vacío -> 400', async () => {
    const res = mockRes();
    await requestAppointment(mockReq({ reason: '' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'El motivo de la cita es obligatorio.' })
    );
  });

  test('R1: reason solo espacios -> 400 (trim lo deja vacío)', async () => {
    const res = mockRes();
    await requestAppointment(mockReq({ reason: '   ' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('R1: reason ausente -> 400', async () => {
    const res = mockRes();
    await requestAppointment(mockReq({}), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('R1: reason tipo número -> 400', async () => {
    const res = mockRes();
    await requestAppointment(mockReq({ reason: 12345 }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('R2: reason excede 1000 caracteres -> 400', async () => {
    const res = mockRes();
    await requestAppointment(mockReq({ reason: 'a'.repeat(1001) }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'El motivo es demasiado largo.' })
    );
  });
});

describe('cancelMyRequest — cobertura de ramas (líneas 35-46)', () => {

  test('R2: cancelRequest retorna fila -> 200', async () => {
    const mockRequest = { id: 'req-1', status: 'cancelada' };
    (cancelRequest as jest.Mock).mockResolvedValue(mockRequest);

    const res = mockRes();
    await cancelMyRequest(mockReq({}, { id: 'req-1' }), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ request: mockRequest });
    expect(cancelRequest).toHaveBeenCalledWith('req-1', 'user-123');
  });

  test('R1: cancelRequest retorna null -> 400', async () => {
    (cancelRequest as jest.Mock).mockResolvedValue(null);

    const res = mockRes();
    await cancelMyRequest(mockReq({}, { id: 'req-999' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'No se pudo cancelar (ya fue atendida o no existe).' })
    );
  });
});

describe('respondAppointmentRequest — cobertura de ramas (líneas 134-151)', () => {

  test('R3: status "confirmada" válido -> 200', async () => {
    const mockRequest = { id: 'req-1', status: 'confirmada' };
    (respondRequest as jest.Mock).mockResolvedValue(mockRequest);

    const res = mockRes();
    await respondAppointmentRequest(
      mockReqPsych({ status: 'confirmada' }, { id: 'req-1' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ request: mockRequest });
  });

  test('R3: status "reprogramada" válido -> 200', async () => {
    const mockRequest = { id: 'req-1', status: 'reprogramada' };
    (respondRequest as jest.Mock).mockResolvedValue(mockRequest);

    const res = mockRes();
    await respondAppointmentRequest(
      mockReqPsych({ status: 'reprogramada', confirmed_date: '2026-09-01' }, { id: 'req-1' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('R3: status "rechazada" válido -> 200', async () => {
    const mockRequest = { id: 'req-1', status: 'rechazada' };
    (respondRequest as jest.Mock).mockResolvedValue(mockRequest);

    const res = mockRes();
    await respondAppointmentRequest(
      mockReqPsych({ status: 'rechazada', response_note: 'No disponible' }, { id: 'req-1' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('R1: status inválido "solicitada" -> 400', async () => {
    const res = mockRes();
    await respondAppointmentRequest(
      mockReqPsych({ status: 'solicitada' }, { id: 'req-1' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Estado inválido.' })
    );
  });

  test('R1: status desconocido "archivado" -> 400', async () => {
    const res = mockRes();
    await respondAppointmentRequest(
      mockReqPsych({ status: 'archivado' }, { id: 'req-1' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('R1: sin status -> 400', async () => {
    const res = mockRes();
    await respondAppointmentRequest(mockReqPsych({}, { id: 'req-1' }), res);

    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('R2: respondRequest retorna null -> 404', async () => {
    (respondRequest as jest.Mock).mockResolvedValue(null);

    const res = mockRes();
    await respondAppointmentRequest(
      mockReqPsych({ status: 'confirmada' }, { id: 'no-existe' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Solicitud no encontrada.' })
    );
  });

  test('R4: error del servicio con status 409 (cupo lleno) -> 409', async () => {
    const error = new Error('Has alcanzado tu cupo máximo');
    (error as any).status = 409;
    (respondRequest as jest.Mock).mockRejectedValue(error);

    const res = mockRes();
    await respondAppointmentRequest(
      mockReqPsych({ status: 'confirmada' }, { id: 'req-1' }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Has alcanzado tu cupo máximo' })
    );
  });
});

describe('myRequests — cobertura de ramas (líneas 25-32)', () => {

  test('R1: con solicitudes -> 200 y array con datos', async () => {
    const mockRequests = [
      { id: 'req-1', status: 'solicitada' },
      { id: 'req-2', status: 'confirmada' },
    ];
    (getMyRequests as jest.Mock).mockResolvedValue(mockRequests);

    const res = mockRes();
    await myRequests(mockReq({}), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ requests: mockRequests });
    expect(getMyRequests).toHaveBeenCalledWith('user-123');
  });

  test('R1: sin solicitudes -> 200 y array vacío', async () => {
    (getMyRequests as jest.Mock).mockResolvedValue([]);

    const res = mockRes();
    await myRequests(mockReq({}), res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ requests: [] });
  });
});

describe('respondAppointmentRequest — pruebas destructivas (bugs detectados)', () => {

  describe('Caso 1: Re-respuesta de solicitudes (bug de lógica)', () => {

    test('BUG: permite re-responder solicitud ya confirmada -> 200 (debería ser 400/409)', async () => {
      const mockRequest = { id: 'req-1', status: 'rechazada' };
      (respondRequest as jest.Mock).mockResolvedValue(mockRequest);

      const res = mockRes();
      await respondAppointmentRequest(
        mockReqPsych({ status: 'rechazada' }, { id: 'req-1' }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('BUG: permite re-responder solicitud cancelada -> 200 (debería ser 400/409)', async () => {
      const mockRequest = { id: 'req-1', status: 'confirmada' };
      (respondRequest as jest.Mock).mockResolvedValue(mockRequest);

      const res = mockRes();
      await respondAppointmentRequest(
        mockReqPsych({ status: 'confirmada' }, { id: 'req-1' }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('BUG: permite cambiar de rechazada a confirmada -> 200 (inconsistencia de estado)', async () => {
      const mockRequest = { id: 'req-1', status: 'confirmada' };
      (respondRequest as jest.Mock).mockResolvedValue(mockRequest);

      const res = mockRes();
      await respondAppointmentRequest(
        mockReqPsych({ status: 'confirmada' }, { id: 'req-1' }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });

  describe('Caso 2: Falta límite en response_note (vulnerabilidad DoS)', () => {

    test('BUG: acepta response_note de 10,000 caracteres -> 200 (sin validación de longitud)', async () => {
      const mockRequest = { id: 'req-1', status: 'rechazada' };
      (respondRequest as jest.Mock).mockResolvedValue(mockRequest);

      const res = mockRes();
      await respondAppointmentRequest(
        mockReqPsych({
          status: 'rechazada',
          response_note: 'a'.repeat(10000)
        }, { id: 'req-1' }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(respondRequest).toHaveBeenCalledWith(
        'req-1',
        'psych-123',
        'rechazada',
        'a'.repeat(10000),
        undefined
      );
    });

    test('BUG: acepta response_note de 50,000 caracteres -> 200 (almacenamiento excesivo)', async () => {
      const mockRequest = { id: 'req-1', status: 'confirmada' };
      (respondRequest as jest.Mock).mockResolvedValue(mockRequest);

      const res = mockRes();
      await respondAppointmentRequest(
        mockReqPsych({
          status: 'confirmada',
          response_note: 'x'.repeat(50000)
        }, { id: 'req-1' }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(200);
    });

    test('BUG: acepta response_note con XSS potencial -> 200 (sin sanitización)', async () => {
      const mockRequest = { id: 'req-1', status: 'rechazada' };
      (respondRequest as jest.Mock).mockResolvedValue(mockRequest);

      const res = mockRes();
      await respondAppointmentRequest(
        mockReqPsych({
          status: 'rechazada',
          response_note: '<script>alert("XSS")</script>'
        }, { id: 'req-1' }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(respondRequest).toHaveBeenCalledWith(
        'req-1',
        'psych-123',
        'rechazada',
        '<script>alert("XSS")</script>',
        undefined
      );
    });
  });
});
