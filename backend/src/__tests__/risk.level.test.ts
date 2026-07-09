/**
 * HU — Triaje de estudiantes por nivel de riesgo (semáforo)
 * PRUEBAS UNITARIAS CON JEST — riskLevelFromScore
 *
 * CAJA BLANCA: la función tiene 4 ramas (sin_datos / bajo / medio / alto);
 *   cada @test cubre una rama o una frontera exacta entre ramas.
 * CAJA NEGRA: análisis de valores límite en los umbrales 1.34 y 2.67.
 */

// Se aíslan las dependencias del módulo (BD y correo) — patrón de prueba unitaria
jest.mock('../config/db', () => ({ pool: { query: jest.fn() } }));
jest.mock('../config/mailer', () => ({ sendCitationEmail: jest.fn() }));

import { riskLevelFromScore } from '../services/psychologist.service';

describe('riskLevelFromScore — mapeo del promedio a nivel de riesgo', () => {

  test('sin evaluaciones (avg = null) -> "sin_datos"', () => {
    expect(riskLevelFromScore(null)).toBe('sin_datos');
  }); 

  test('avg = 0 (mínimo de la escala) -> "bajo"', () => {
    expect(riskLevelFromScore(0)).toBe('bajo');
  });

  test('avg = 1.33 (límite superior de bajo) -> "bajo"', () => {
    expect(riskLevelFromScore(1.33)).toBe('bajo');
  });

  test('avg = 1.34 (primer valor de medio) -> "medio"', () => {
    expect(riskLevelFromScore(1.34)).toBe('medio');
  });

  test('avg = 2.66 (límite superior de medio) -> "medio"', () => {
    expect(riskLevelFromScore(2.66)).toBe('medio');
  });

  test('avg = 2.67 (primer valor de alto) -> "alto"', () => {
    expect(riskLevelFromScore(2.67)).toBe('alto');
  });

  test('avg = 4 (máximo de la escala) -> "alto"', () => {
    expect(riskLevelFromScore(4)).toBe('alto');
  });
});
