/**
 * HU — Recomendaciones personalizadas (R2)
 * PRUEBAS UNITARIAS DE CAJA BLANCA — averageScore y computeLevel
 *
 * Técnica: cobertura de ramas + análisis de valores límite en los umbrales.
 * Código bajo prueba (evaluation.service.ts):
 *   averageScore: mapea la escala Nunca..Siempre a 0..4 y promedia
 *     R1: lista vacía            -> 0
 *     R2: respuestas conocidas   -> promedio correcto
 *     R3: respuestas desconocidas-> se ignoran
 *   computeLevel: avg < 1.34 'bajo' | avg < 2.67 'medio' | resto 'alto'
 *     Límites exactos: 1.33 / 1.34 / 2.66 / 2.67
 */
import { averageScore, computeLevel } from '../services/evaluation.service';

// Se evita conexión real: el módulo importa pool, pero estas funciones no lo usan.
jest.mock('../config/db', () => ({ pool: { query: jest.fn() } }));

describe('averageScore — caja blanca (mapeo de escala y promedio)', () => {

  test('R1: sin respuestas -> promedio 0', () => {
    expect(averageScore([])).toBe(0);
  });

  test('R2: todas "Nunca" -> 0', () => {
    expect(averageScore(['Nunca', 'Nunca'])).toBe(0);
  });

  test('R2: todas "Siempre" -> 4', () => {
    expect(averageScore(['Siempre', 'Siempre'])).toBe(4);
  });

  test('R2: mezcla Nunca(0) y Siempre(4) -> promedio 2', () => {
    expect(averageScore(['Nunca', 'Siempre'])).toBe(2);
  });

  test('R3: respuestas desconocidas se ignoran ("Siempre" + basura -> 4)', () => {
    expect(averageScore(['Siempre', 'respuesta-invalida'])).toBe(4);
  });
});

describe('computeLevel — caja blanca (valores límite en los umbrales)', () => {

  test('avg = 0 -> nivel bajo', () => {
    expect(computeLevel(0)).toBe('bajo');
  });

  test('avg = 1.33 (límite superior de bajo) -> bajo', () => {
    expect(computeLevel(1.33)).toBe('bajo');
  });

  test('avg = 1.34 (primer valor de medio) -> medio', () => {
    expect(computeLevel(1.34)).toBe('medio');
  });

  test('avg = 2.66 (límite superior de medio) -> medio', () => {
    expect(computeLevel(2.66)).toBe('medio');
  });

  test('avg = 2.67 (primer valor de alto) -> alto', () => {
    expect(computeLevel(2.67)).toBe('alto');
  });

  test('avg = 4 (máximo de la escala) -> alto', () => {
    expect(computeLevel(4)).toBe('alto');
  });
});
