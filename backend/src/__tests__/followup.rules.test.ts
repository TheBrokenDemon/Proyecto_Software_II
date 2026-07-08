/**
 * HU — Notas de seguimiento (el psicólogo escribe, el estudiante lee)
 * PRUEBAS UNITARIAS CON JEST — createFollowup y updateFollowupStatus
 *
 * CAJA BLANCA (ramas de las funciones):
 *   createFollowup:
 *     B1: estudiante no existe                       -> error 404
 *     B2: estudiante asignado a OTRO psicólogo       -> error 403 (confidencialidad)
 *     B3: estudiante asignado a MÍ                   -> crea la nota
 *     B4: estudiante SIN asignar                     -> crea la nota
 *   updateFollowupStatus:
 *     B5: estado fuera de la lista                    -> error 400 (sin tocar la BD)
 *     B6: estado válido pero el seguimiento es de otro-> error 404 (propiedad)
 *     B7: estado válido y seguimiento propio          -> actualiza
 * CAJA NEGRA: partición de estados válidos
 *     ('pendiente' | 'en_seguimiento' | 'cerrado') vs. inválidos.
 */
jest.mock('../config/db', () => ({ pool: { query: jest.fn() } }));
jest.mock('../config/mailer', () => ({ sendCitationEmail: jest.fn() }));

import { pool } from '../config/db';
import { createFollowup, updateFollowupStatus } from '../services/psychologist.service';

const q = pool.query as jest.Mock;

const studentExists = { rows: [{ id: 'est-1' }] };
const noStudent = { rows: [] };
const assignedTo = (id: string | null) => ({ rows: [{ assigned_psychologist_id: id }] });
const inserted = { rows: [{ id: 'fu-1', notes: 'Nota de prueba', status: 'pendiente' }] };
const updatedRow = (status: string) => ({ rows: [{ id: 'fu-1', status }] });
const noRows = { rows: [] };

beforeEach(() => q.mockReset());

describe('createFollowup — creación de notas con confidencialidad', () => {

  test('B1: estudiante no existe -> error 404', async () => {
    q.mockResolvedValueOnce(noStudent);
    await expect(createFollowup('est-x', 'psy-1', 'Nota'))
      .rejects.toMatchObject({ status: 404 });
  });

  test('B2: estudiante asignado a OTRO psicólogo -> error 403', async () => {
    q.mockResolvedValueOnce(studentExists)
     .mockResolvedValueOnce(assignedTo('psy-OTRO'));
    await expect(createFollowup('est-1', 'psy-1', 'Nota'))
      .rejects.toMatchObject({ status: 403 });
  });

  test('B3: estudiante asignado a MÍ -> la nota se crea', async () => {
    q.mockResolvedValueOnce(studentExists)
     .mockResolvedValueOnce(assignedTo('psy-1'))
     .mockResolvedValueOnce(inserted);
    const fu = await createFollowup('est-1', 'psy-1', 'Nota de prueba');
    expect(fu).toMatchObject({ id: 'fu-1', notes: 'Nota de prueba' });
  });

  test('B4: estudiante SIN asignar -> la nota se crea', async () => {
    q.mockResolvedValueOnce(studentExists)
     .mockResolvedValueOnce(assignedTo(null))
     .mockResolvedValueOnce(inserted);
    const fu = await createFollowup('est-1', 'psy-1', 'Nota de prueba');
    expect(fu).toMatchObject({ id: 'fu-1' });
  });
});

describe('updateFollowupStatus — estados válidos y propiedad', () => {

  test('B5: estado inválido ("archivado") -> error 400 y NO consulta la BD', async () => {
    await expect(updateFollowupStatus('fu-1', 'psy-1', 'archivado'))
      .rejects.toMatchObject({ status: 400 });
    expect(q).not.toHaveBeenCalled();
  });

  test.each(['pendiente', 'en_seguimiento', 'cerrado'])(
    'B7: estado válido "%s" en seguimiento propio -> actualiza',
    async (status) => {
      q.mockResolvedValueOnce(updatedRow(status));
      const fu = await updateFollowupStatus('fu-1', 'psy-1', status);
      expect(fu).toMatchObject({ status });
    }
  );

  test('B6: seguimiento de otro psicólogo (UPDATE sin filas) -> error 404', async () => {
    q.mockResolvedValueOnce(noRows);
    await expect(updateFollowupStatus('fu-ajeno', 'psy-1', 'cerrado'))
      .rejects.toMatchObject({ status: 404 });
  });
});
