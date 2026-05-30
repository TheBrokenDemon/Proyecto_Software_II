const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// 1. Mockear la conexión a la base de datos
jest.mock('../config/db', () => {
  return {
    pool: {
      query: jest.fn(),
    },
    connectDB: jest.fn().mockResolvedValue(true),
  };
});

const { pool } = require('../config/db');

// 2. Importar el router del panel psicológico
const psychologistRoutes = require('../routes/psychologist.routes');

// 3. Configurar aplicación Express aislada
const app = express();
app.use(express.json());
app.use('/api/psychologist', psychologistRoutes);

describe('GET /api/psychologist/dashboard - Control de Acceso (RBAC)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Escenario 1: Acceso Autorizado (Rol Psicólogo)', () => {
    it('Debería permitir el acceso y retornar status 200', async () => {
      // Mock de JWT simulando al profesional
      jest.spyOn(jwt, 'verify').mockReturnValue({ sub: 1, email: 'psico@ulima.edu.pe' });

      // Mock de la 1° consulta (auth.middleware): La sesión está activa en la BD
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      // Mock de la 2° consulta (role.middleware): La BD confirma que tiene el rol adecuado
      pool.query.mockResolvedValueOnce({ rows: [{ role: 'psicologo' }] });

      const response = await request(app)
        .get('/api/psychologist/dashboard')
        .set('Authorization', 'Bearer mock_token_psicologo');

      // Validaciones
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Bienvenido al panel psicológico');
      expect(response.body).toHaveProperty('role', 'psicologo');

      // Verificar que ambos middlewares hicieron sus consultas respectivas
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(jwt.verify).toHaveBeenCalled();

      jwt.verify.mockRestore();
    });
  });

  describe('Escenario 2: Usuario sin permisos (Rol Estudiante)', () => {
    it('Debería bloquear el acceso y retornar status 403 Forbidden', async () => {
      // Mock de JWT simulando a un estudiante
      jest.spyOn(jwt, 'verify').mockReturnValue({ sub: 2, email: 'estudiante@ulima.edu.pe' });

      // Mock de la 1° consulta (auth.middleware): La sesión es válida y está activa
      pool.query.mockResolvedValueOnce({ rows: [{ id: 2 }] });

      // Mock de la 2° consulta (role.middleware): La BD confirma que su rol es solo 'estudiante'
      pool.query.mockResolvedValueOnce({ rows: [{ role: 'estudiante' }] });

      const response = await request(app)
        .get('/api/psychologist/dashboard')
        .set('Authorization', 'Bearer mock_token_estudiante');

      // Validaciones de seguridad
      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty(
        'message', 
        'Acceso denegado. No tienes los permisos necesarios para acceder a este panel.'
      );

      // Ambos middlewares actuaron, pero el controlador NUNCA fue ejecutado
      expect(pool.query).toHaveBeenCalledTimes(2);

      jwt.verify.mockRestore();
    });
  });

  describe('Escenario 3: QA Extra - Integridad de Datos', () => {
    it('Debería retornar 404 si la sesión es válida pero el usuario fue eliminado de la tabla users', async () => {
      jest.spyOn(jwt, 'verify').mockReturnValue({ sub: 3, email: 'fantasma@ulima.edu.pe' });

      // Sesión activa encontrada
      pool.query.mockResolvedValueOnce({ rows: [{ id: 3 }] });

      // El usuario no existe en la tabla users
      pool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/psychologist/dashboard')
        .set('Authorization', 'Bearer mock_token_fantasma');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('message', 'Usuario no encontrado.');

      jwt.verify.mockRestore();
    });
  });
});