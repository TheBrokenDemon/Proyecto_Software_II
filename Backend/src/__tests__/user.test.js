const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');

// 1. Mockear el pool de la base de datos
jest.mock('../config/db', () => {
  return {
    pool: {
      query: jest.fn(),
    },
    connectDB: jest.fn().mockResolvedValue(true),
  };
});

const { pool } = require('../config/db');

// 2. Importar el router de usuarios real
const userRoutes = require('../routes/user.routes');

// 3. Configurar aplicación Express aislada para la prueba
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

describe('Rutas de Perfil de Usuario (/api/users/profile)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Escenario 1: Actualización Exitosa', () => {
    it('Debería actualizar parcialmente el perfil y retornar status 200', async () => {
      // Mock de jwt.verify para simular que el token extraído del Header es válido
      jest.spyOn(jwt, 'verify').mockReturnValue({ sub: 1, email: 'ana@ulima.edu.pe' });

      // Mock de la 1° consulta (Middleware): Validar que la sesión existe en la base de datos
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      // Mock de la 2° consulta (Servicio): El UPDATE a la tabla users que retorna los datos actualizados
      const updatedUser = {
        id: 1,
        full_name: 'Ana García López',
        email: 'ana@ulima.edu.pe',
        age: 22,
        gender: 'Femenino',
        updated_at: new Date().toISOString()
      };
      pool.query.mockResolvedValueOnce({ rows: [updatedUser] });

      const payload = {
        full_name: 'Ana García López',
        age: 22
      };

      const response = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', 'Bearer mock_token_valido')
        .send(payload);

      // Validaciones
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Perfil actualizado correctamente.');
      expect(response.body.user).toEqual(expect.objectContaining({ age: 22, full_name: 'Ana García López' }));
      
      // Verifica que el middleware hizo la validación y el controlador hizo el UPDATE
      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(jwt.verify).toHaveBeenCalled();

      // Limpieza del mock
      jwt.verify.mockRestore();
    });
  });

  describe('Escenario 2: Datos Inválidos (express-validator)', () => {
    it('Debería retornar error 400 si los datos enviados no cumplen las reglas de negocio', async () => {
      jest.spyOn(jwt, 'verify').mockReturnValue({ sub: 1, email: 'ana@ulima.edu.pe' });
      
      // El middleware autoriza la petición validando la sesión en DB
      pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

      const payload = {
        age: 10, // Inválido: el mínimo configurado es 15
        gender: 'Extraterrestre' // Inválido: no está en el array de permitidos
      };

      const response = await request(app)
        .patch('/api/users/profile')
        .set('Authorization', 'Bearer mock_token_valido')
        .send(payload);

      // Validaciones
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message', 'Datos inválidos. Revisa los campos e intenta nuevamente.');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'age' }),
          expect.objectContaining({ field: 'gender' })
        ])
      );

      // IMPORTANTE: El flujo debió detenerse en validaciones. No se debe llamar al UPDATE en base de datos.
      expect(pool.query).toHaveBeenCalledTimes(1); 
      
      jwt.verify.mockRestore();
    });
  });

  describe('Escenario 3: Extra QA - No Autorizado', () => {
    it('Debería retornar error 401 si no se envía ningún token en el Header Authorization', async () => {
      const payload = { age: 25 };

      const response = await request(app)
        .patch('/api/users/profile')
        // Intencionadamente no enviamos .set('Authorization', '...')
        .send(payload);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Token de acceso requerido.');

      // Aseguramos que la base de datos no fue tocada
      expect(pool.query).not.toHaveBeenCalled();
    });
  });
});