/**
 * HU — Recomendaciones personalizadas (R2)
 *
 * PRUEBA DE CAJA BLANCA
 *
 * Método evaluado:
 * getRecommendations()
 *
 * Técnica:
 * Cobertura de caminos independientes
 * Análisis de decisiones y ramas internas
 *
 * Complejidad ciclomática estimada:
 * CC = 5
 *
 * Caminos evaluados:
 * P1: Usuario sin historial de evaluaciones.
 * P2: Evaluación con nivel alto y tipo sintomático agrega apoyo profesional.
 * P3: Evaluación con nivel bajo no agrega apoyo profesional.
 * P4: Evaluación desconocida utiliza catálogo por defecto.
 * P5: Nivel alto pero evaluación no sintomática no agrega apoyo profesional.
 */


import { getRecommendations } from '../services/evaluation.service';


jest.mock('../config/db', () => ({
  pool: {
    query: jest.fn()
  }
}));


import { pool } from '../config/db';



describe('getRecommendations - Prueba Caja Blanca HU R2', () => {


  beforeEach(() => {
    jest.clearAllMocks();
  });



  test('P1: estudiante sin historial devuelve lista vacía', async () => {


    (pool.query as jest.Mock)
      .mockResolvedValueOnce({
        rows: []
      });


    const result =
      await getRecommendations('user-1');


    expect(result.hasHistory)
      .toBe(false);


    expect(result.recommendations)
      .toEqual([]);


  });




  test('P2: evaluación ansiedad con nivel alto agrega apoyo profesional', async () => {


    (pool.query as jest.Mock)
      .mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            slug: 'ansiedad',
            title: 'Ansiedad',
            completed_at: new Date()
          }
        ]
      })
      .mockResolvedValueOnce({
        rows: [
          { answer: 'Siempre' },
          { answer: 'Siempre' }
        ]
      });



    const result =
      await getRecommendations('user-1');



    expect(result.hasHistory)
      .toBe(true);



    expect(result.recommendations.length)
      .toBe(4);



  });





  test('P3: evaluación bienestar emocional con nivel bajo no agrega apoyo profesional', async () => {


    (pool.query as jest.Mock)
      .mockResolvedValueOnce({
        rows: [
          {
            id: 2,
            slug: 'bienestar-emocional',
            title: 'Bienestar emocional',
            completed_at: new Date()
          }
        ]
      })
      .mockResolvedValueOnce({
        rows: [
          { answer: 'Nunca' }
        ]
      });



    const result =
      await getRecommendations('user-1');



    expect(result.hasHistory)
      .toBe(true);



    expect(result.recommendations.length)
      .toBe(3);



  });






  test('P4: evaluación desconocida utiliza catálogo por defecto', async () => {


    (pool.query as jest.Mock)
      .mockResolvedValueOnce({
        rows: [
          {
            id: 3,
            slug: 'evaluacion-desconocida',
            title: 'Evaluación desconocida',
            completed_at: new Date()
          }
        ]
      })
      .mockResolvedValueOnce({
        rows: [
          { answer: 'A veces' }
        ]
      });



    const result =
      await getRecommendations('user-1');



    expect(result.basedOn?.label)
      .toBe('bienestar emocional');



  });







  test('P5: nivel alto pero evaluación no sintomática no agrega apoyo profesional', async () => {


    (pool.query as jest.Mock)
      .mockResolvedValueOnce({
        rows: [
          {
            id: 4,
            slug: 'bienestar-emocional',
            title: 'Bienestar emocional',
            completed_at: new Date()
          }
        ]
      })
      .mockResolvedValueOnce({
        rows: [
          { answer: 'Siempre' },
          { answer: 'Siempre' }
        ]
      });



    const result =
      await getRecommendations('user-1');



    expect(result.hasHistory)
      .toBe(true);



    expect(result.recommendations.length)
      .toBe(3);



  });



});