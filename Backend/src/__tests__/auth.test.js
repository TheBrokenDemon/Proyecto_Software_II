const request = require('supertest');
const express = require('express');

// Agregar esta línea para que Jest tenga una llave maestra
process.env.JWT_SECRET = 'llave_de_prueba_para_jest';

// 1. Mockear el pool de conexión antes de importar servicios y rutas
jest.mock('../config/db', () => {
  return {
    pool: {
      query: jest.fn(),
    },
    connectDB: jest.fn().mockResolvedValue(true),
  };
});

// Importar el mock para poder controlar sus retornos en cada test
const { pool } = require('../config/db');

// Importar el router real que queremos probar
const authRoutes = require('../routes/auth.routes');

// Configurar una aplicación Express aislada para pruebas
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('POST /api/auth/register - Pruebas de Integración (Registro de Estudiante)', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Escenario 1: Registro Exitoso', () => {
    it('Debería registrar un nuevo usuario con datos correctos y retornar un status 201', async () => {
      const nuevoEstudiante = {
        full_name: 'Ana García',
        email: 'ana@ulima.edu.pe',
        password: 'mipassword123',
        age: 21,
        gender: 'Femenino'
      };

      // Mock de la primera consulta: SELECT id FROM users WHERE email = $1 (Retorna vacío = no existe duplicado)
      pool.query.mockResolvedValueOnce({ rows: [] });

      // Mock de la segunda consulta: INSERT INTO users ... RETURNING ...
      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            full_name: 'Ana García',
            email: 'ana@ulima.edu.pe',
            age: 21,
            gender: 'Femenino',
            created_at: new Date().toISOString()
          }
        ]
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(nuevoEstudiante);

      // Verificaciones de la respuesta HTTP
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('message', 'Cuenta creada exitosamente.');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toEqual(
        expect.objectContaining({
          id: 1,
          full_name: 'Ana García',
          email: 'ana@ulima.edu.pe',
          age: 21,
          gender: 'Femenino'
        })
      );

      // Verificación de llamadas internas a la base de datos mockeada
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(pool.query.mock.calls[0][1]).toEqual(['ana@ulima.edu.pe']); // Valida email sanitizado/minúscula
    });
  });

  describe('Escenario 2: Registro Fallido (Correo Duplicado)', () => {
    it('Debería retornar un error 409 cuando el correo electrónico ya se encuentra registrado', async () => {
      const estudianteDuplicado = {
        full_name: 'Ana García',
        email: 'ana@ulima.edu.pe',
        password: 'mipassword123',
        age: 21,
        gender: 'Femenino'
      };

      // Mock de la primera consulta: SELECT id FROM users WHERE email = $1 (Retorna un ID existente)
      pool.query.mockResolvedValueOnce({
        rows: [{ id: 1 }]
      });

      const response = await request(app)
        .post('/api/auth/register')
        .send(estudianteDuplicado);

      // Verificaciones de la respuesta HTTP
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('message', 'El correo ya está registrado.');

      // Verificación de llamadas internas: El flujo debe detenerse y no ejecutar el INSERT
      expect(pool.query).toHaveBeenCalledTimes(1);
    });
  });
});






describe('POST /api/auth/login - Pruebas de Integración (Inicio de Sesión)', () => {
    // Importamos bcryptjs de forma local para poder mockear (espiar) su método compare
    const bcrypt = require('bcryptjs');

    beforeEach(() => {
      // Nos aseguramos de limpiar los mocks antes de cada test
      jest.clearAllMocks();
    });

    describe('Escenario 1: Login Exitoso', () => {
      it('Debería validar credenciales, crear una sesión y retornar un token JWT (status 200)', async () => {
        const credenciales = {
          email: 'ana@ulima.edu.pe',
          password: 'mipassword123'
        };

        // Mock de la primera consulta: SELECT id, full_name... FROM users WHERE email = $1
        pool.query.mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              full_name: 'Ana García',
              email: 'ana@ulima.edu.pe',
              password_hash: 'hashed_password_mock'
            }
          ]
        });

        // Mockeamos bcrypt.compare para que retorne true (simulando contraseña correcta)
        jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(true);

        // Mock de la segunda consulta: INSERT INTO sessions ...
        pool.query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app)
          .post('/api/auth/login')
          .send(credenciales);

        // Verificaciones de la respuesta HTTP
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('message', 'Inicio de sesión exitoso.');
        expect(response.body).toHaveProperty('token');
        expect(typeof response.body.token).toBe('string');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toEqual(
          expect.objectContaining({
            id: 1,
            full_name: 'Ana García',
            email: 'ana@ulima.edu.pe'
          })
        );

        // Verificación del comportamiento interno
        expect(pool.query).toHaveBeenCalledTimes(2); // SELECT y luego INSERT
        expect(bcrypt.compare).toHaveBeenCalledWith('mipassword123', 'hashed_password_mock');
        
        // Restaurar el mock original
        bcrypt.compare.mockRestore();
      });
    });

    describe('Escenario 2: Login Fallido (Credenciales Incorrectas)', () => {
      it('Debería retornar error 401 si la contraseña no coincide', async () => {
        const credenciales = {
          email: 'ana@ulima.edu.pe',
          password: 'password_incorrecto'
        };

        // Mock de la consulta: SELECT ... (Encuentra al usuario)
        pool.query.mockResolvedValueOnce({
          rows: [
            {
              id: 1,
              full_name: 'Ana García',
              email: 'ana@ulima.edu.pe',
              password_hash: 'hashed_password_mock'
            }
          ]
        });

        // Mockeamos bcrypt.compare para que retorne false (simulando contraseña errónea)
        jest.spyOn(bcrypt, 'compare').mockResolvedValueOnce(false);

        const response = await request(app)
          .post('/api/auth/login')
          .send(credenciales);

        // Verificaciones de la respuesta HTTP
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Correo o contraseña incorrectos.');

        // Se detiene el flujo: Hubo SELECT pero no llegó a hacer INSERT en sessions
        expect(pool.query).toHaveBeenCalledTimes(1); 
        expect(bcrypt.compare).toHaveBeenCalledWith('password_incorrecto', 'hashed_password_mock');

        // Restaurar el mock original
        bcrypt.compare.mockRestore();
      });

      it('Debería retornar error 401 si el correo no existe', async () => {
        const credenciales = {
          email: 'noexiste@ulima.edu.pe',
          password: 'mipassword123'
        };

        // Mock de la consulta: SELECT ... (No encuentra al usuario, retorna vacío)
        pool.query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app)
          .post('/api/auth/login')
          .send(credenciales);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Correo o contraseña incorrectos.');
        expect(pool.query).toHaveBeenCalledTimes(1);
      });
    });
});







