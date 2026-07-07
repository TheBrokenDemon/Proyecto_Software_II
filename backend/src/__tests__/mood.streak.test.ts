/**
 * S2-79 — Check-in diario de ánimo
 * PRUEBAS UNITARIAS DE CAJA BLANCA — computeStreak (cálculo de racha)
 *
 * Técnica: cobertura de caminos/ramas. Se diseñaron los casos mirando el
 * código de computeStreak, que tiene estas ramas:
 *   R1: no registró hoy NI ayer            -> return 0
 *   R2: no registró hoy pero SÍ ayer       -> la racha empieza a contar desde ayer
 *   R3: registró hoy                        -> la racha empieza hoy
 *   R4: bucle while                         -> suma días consecutivos hacia atrás
 *   R5: corte de racha (hueco de un día)    -> el conteo se detiene en el hueco
 */
import { computeStreak } from '../services/mood.service';

// Helper: fecha local 'YYYY-MM-DD' desplazada N días desde hoy
const daysAgo = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

describe('computeStreak — caja blanca (cobertura de ramas)', () => {

  test('R1: sin registros -> racha 0', () => {
    expect(computeStreak([])).toBe(0);
  });

  test('R1: sin registro hoy ni ayer (último hace 3 días) -> racha 0', () => {
    expect(computeStreak([daysAgo(3), daysAgo(4)])).toBe(0);
  });

  test('R3: registró solo hoy -> racha 1', () => {
    expect(computeStreak([daysAgo(0)])).toBe(1);
  });

  test('R2: no registró hoy pero sí ayer -> la racha se conserva (1)', () => {
    expect(computeStreak([daysAgo(1)])).toBe(1);
  });

  test('R4: hoy + ayer + antier consecutivos -> racha 3', () => {
    expect(computeStreak([daysAgo(0), daysAgo(1), daysAgo(2)])).toBe(3);
  });

  test('R2+R4: sin hoy, pero ayer y antier consecutivos -> racha 2', () => {
    expect(computeStreak([daysAgo(1), daysAgo(2)])).toBe(2);
  });

  test('R5: hueco corta la racha (hoy, ayer, y salto a hace 3 días) -> racha 2', () => {
    expect(computeStreak([daysAgo(0), daysAgo(1), daysAgo(3)])).toBe(2);
  });

  test('R4: orden de entrada no importa (usa Set) -> racha 3', () => {
    expect(computeStreak([daysAgo(2), daysAgo(0), daysAgo(1)])).toBe(3);
  });

  test('R4: fechas duplicadas no inflan la racha -> racha 2', () => {
    expect(computeStreak([daysAgo(0), daysAgo(0), daysAgo(1)])).toBe(2);
  });
});
