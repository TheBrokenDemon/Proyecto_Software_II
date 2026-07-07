/**
 * S2-79 — Check-in diario de ánimo
 * PRUEBAS DE CAJA NEGRA — POST /api/mood/checkins (controlador createCheckin)
 *
 * Técnica: particiones de equivalencia y análisis de valores límite (BVA),
 * SIN mirar la implementación interna: solo entrada (body) -> salida (status, json).
 *
 *   Campo mood (entero 1..4):
 *     Partición inválida baja:  mood = 0        -> 400
 *     Límite válido inferior:   mood = 1        -> 201
 *     Límite válido superior:   mood = 4        -> 201
 *     Partición inválida alta:  mood = 5        -> 400
 *     Tipo inválido:            mood = 2.5      -> 400
 *     Ausente:                  (sin mood)      -> 400
 *
 *   Campo note (opcional, string <= 500):
 *     Límite válido:   500 caracteres           -> 201
 *     Límite inválido: 501 caracteres           -> 400
 *     Tipo inválido:   número                   -> 400
 *     Ausente:         (sin note)               -> 201
 */
import { Request, Response } from 'express';
import { createCheckin } from '../controllers/mood.controller';

// Se aísla la capa de datos: el servicio se reemplaza por un doble de prueba.
jest.mock('../services/mood.service', () => ({
  upsertTodayCheckin: jest.fn().mockResolvedValue({
    id: 'test-id', mood: 1, note: null, checkin_date: '2026-01-01', created_at: '2026-01-01',
  }),
  getTodayCheckin: jest.fn(),
  getCheckinHistory: jest.fn(),
}));

// Helpers para simular req/res de Express
const mockReq = (body: any): Request =>
  ({ body, user: { id: 'user-123', role: 'estudiante' } } as unknown as Request);

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

describe('POST /api/mood/checkins — caja negra (particiones y valores límite)', () => {

  // ── Campo mood ──────────────────────────────────────────────
  test('mood = 0 (límite inválido inferior) -> 400', async () => {
    const res = mockRes();
    await createCheckin(mockReq({ mood: 0 }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('mood = 1 (límite válido inferior) -> 201', async () => {
    const res = mockRes();
    await createCheckin(mockReq({ mood: 1 }), res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('mood = 4 (límite válido superior) -> 201', async () => {
    const res = mockRes();
    await createCheckin(mockReq({ mood: 4 }), res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('mood = 5 (límite inválido superior) -> 400', async () => {
    const res = mockRes();
    await createCheckin(mockReq({ mood: 5 }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('mood = 2.5 (no entero) -> 400', async () => {
    const res = mockRes();
    await createCheckin(mockReq({ mood: 2.5 }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('mood ausente -> 400', async () => {
    const res = mockRes();
    await createCheckin(mockReq({}), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  // ── Campo note ──────────────────────────────────────────────
  test('note de 500 caracteres (límite válido) -> 201', async () => {
    const res = mockRes();
    await createCheckin(mockReq({ mood: 3, note: 'a'.repeat(500) }), res);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('note de 501 caracteres (límite inválido) -> 400', async () => {
    const res = mockRes();
    await createCheckin(mockReq({ mood: 3, note: 'a'.repeat(501) }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('note numérica (tipo inválido) -> 400', async () => {
    const res = mockRes();
    await createCheckin(mockReq({ mood: 3, note: 12345 }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('sin note (opcional) -> 201', async () => {
    const res = mockRes();
    await createCheckin(mockReq({ mood: 2 }), res);
    expect(res.status).toHaveBeenCalledWith(201);
  });
});
