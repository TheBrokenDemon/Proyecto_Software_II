/**
 * S2-86 — Personalización de tema
 * PRUEBAS UNITARIAS — controlador updateTheme (PATCH /api/users/theme)
 *
 * CAJA BLANCA (ramas del controlador):
 *   B1: theme ausente                 -> 400
 *   B2: theme fuera de la lista blanca-> 400
 *   B3: theme en la lista blanca      -> 200 y persiste vía repositorio
 *
 * CAJA NEGRA (particiones de equivalencia sobre la entrada):
 *   Partición válida:   'institucional' | 'naturaleza' | 'descanso'  -> 200
 *   Particiones inválidas:
 *     - valor desconocido ('oscuro')            -> 400
 *     - sensibilidad a mayúsculas ('Descanso')  -> 400 (la lista es exacta)
 *     - tipo incorrecto (número)                -> 400
 *     - cadena vacía                            -> 400
 *     - ausente                                 -> 400
 */
import { Response, NextFunction } from 'express';
import { updateTheme } from '../controllers/user.controller';
import { AuthRequest } from '../types';

// Doble de prueba: se aísla la capa de datos (patrón Repository)
jest.mock('../repositories/user.repository', () => ({
  UserRepository: {
    updateTheme: jest.fn().mockImplementation(
      async (_id: string, theme: string) => ({ id: 'user-1', theme })
    ),
  },
}));
// El controlador importa otros servicios/utilidades; se neutralizan
jest.mock('../services/user.service', () => ({ getUserById: jest.fn(), updateUserProfile: jest.fn() }));
jest.mock('../utils/UserAdapter', () => ({ UserAdapter: { toResponse: jest.fn() } }));

import { UserRepository } from '../repositories/user.repository';

const mockReq = (body: any): AuthRequest =>
  ({ body, user: { id: 'user-1', role: 'estudiante' } } as unknown as AuthRequest);

const mockRes = () => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};
const mockNext: NextFunction = jest.fn();

beforeEach(() => jest.clearAllMocks());

describe('PATCH /users/theme — partición VÁLIDA (los 3 temas permitidos)', () => {

  test.each(['institucional', 'naturaleza', 'descanso'])(
    'theme "%s" -> 200 y se persiste',
    async (theme) => {
      const res = mockRes();
      await updateTheme(mockReq({ theme }), res, mockNext);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(UserRepository.updateTheme).toHaveBeenCalledWith('user-1', theme);
    }
  );
});

describe('PATCH /users/theme — particiones INVÁLIDAS', () => {

  test('theme desconocido ("oscuro") -> 400 y NO persiste', async () => {
    const res = mockRes();
    await updateTheme(mockReq({ theme: 'oscuro' }), res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(UserRepository.updateTheme).not.toHaveBeenCalled();
  });

  test('theme con mayúsculas ("Descanso") -> 400 (la lista blanca es exacta)', async () => {
    const res = mockRes();
    await updateTheme(mockReq({ theme: 'Descanso' }), res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('theme numérico (tipo inválido) -> 400', async () => {
    const res = mockRes();
    await updateTheme(mockReq({ theme: 123 }), res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('theme cadena vacía -> 400', async () => {
    const res = mockRes();
    await updateTheme(mockReq({ theme: '' }), res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('theme ausente -> 400', async () => {
    const res = mockRes();
    await updateTheme(mockReq({}), res, mockNext);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('la respuesta de éxito devuelve el tema aplicado', async () => {
    const res = mockRes();
    await updateTheme(mockReq({ theme: 'naturaleza' }), res, mockNext);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ theme: 'naturaleza' })
    );
  });
});
