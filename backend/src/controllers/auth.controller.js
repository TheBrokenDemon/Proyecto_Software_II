const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { UserFactory } = require('../utils/Factories');

/**
 * Registra un nuevo usuario y devuelve un token de sesión.
 */
exports.register = async (req, res, next) => {
  const { full_name, email, password, age, gender } = req.body;
  
  // Log para depuración: Siempre es bueno ver qué está llegando exactamente.
  console.log('[Auth] Cuerpo de la petición de registro recibido:', req.body);

  try {
    // --- MEJORA: Validación de entrada ---
    // Verificamos que los campos esenciales no sean undefined o vacíos.
    if (!full_name || !email || !password) {
      // Usamos un error con status 400 (Bad Request) para datos inválidos.
      const error = new Error('Los campos nombre completo, email y contraseña son obligatorios.');
      error.status = 400;
      throw error;
    }

    console.log('[Auth] Iniciando registro para:', email);
    // 1. Verificar si el usuario ya existe
    const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ message: 'El correo electrónico ya está en uso.' });
    }

    // 2. Usar la Factory para crear el objeto de usuario (con la contraseña hasheada)
    // Ahora estamos seguros de que las variables principales no son undefined.
    const newUserPayload = await UserFactory.createStudent(
      full_name, 
      email, 
      password, 
      age || null, // Pasamos null si 'age' es undefined para que parseInt no falle
      gender || null // Pasamos null si 'gender' es undefined
    );
    // Ocultamos la contraseña hasheada en el log por seguridad.
    console.log('[Auth] Payload de usuario creado por Factory:', { ...newUserPayload, password: '[REDACTED]' });

    // 3. Insertar el nuevo usuario en la base de datos
    // CORRECCIÓN: Se usa 'password_hash' para coincidir con el esquema de la base de datos.
    const query = 'INSERT INTO users (full_name, email, password_hash, age, gender, role, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
    const values = [newUserPayload.full_name, newUserPayload.email, newUserPayload.password, newUserPayload.age, newUserPayload.gender, newUserPayload.role, newUserPayload.created_at];
    const result = await pool.query(query, values);
    const savedUser = result.rows[0];
    console.log('[Auth] Usuario guardado en DB con ID:', savedUser.id);

    // 4. Generar el token JWT
    const token = jwt.sign({ id: savedUser.id, role: savedUser.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    // 4.1. Guardar la sesión en la base de datos
    // Calculamos la fecha de expiración para 1 día en el futuro sin dependencias externas.
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);
    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [savedUser.id, token, expiresAt]
    );
    // 5. Usar la Factory para crear una respuesta segura (sin la contraseña)
    const userResponse = UserFactory.createUserResponse(savedUser, token);

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('[Auth] Error en el registro:', error);
    next(error);
  }
};

/**
 * Inicia sesión de un usuario existente.
 */
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  // Log para depuración
  console.log('[Auth] Cuerpo de la petición de login recibido:', req.body);

  // --- MEJORA: Validación de entrada ---
  if (!email || !password) {
    const error = new Error('El email y la contraseña son obligatorios.');
    error.status = 400;
    return next(error); // Pasamos el error al manejador global
  }

  try {
    console.log('[Auth] Iniciando login para:', email);
    // CORRECCIÓN: Seleccionamos 'password_hash' para la comparación.
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    const user = result.rows[0];

    // Se compara la contraseña enviada con el hash almacenado en 'password_hash'.
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Credenciales incorrectas.' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    });

    // Guardar la nueva sesión en la base de datos
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 1);
    await pool.query(
      'INSERT INTO sessions (user_id, token, expires_at) VALUES ($1, $2, $3)',
      [user.id, token, expiresAt]
    );

    const userResponse = UserFactory.createUserResponse(user, token);
    res.status(200).json(userResponse);
  } catch (error) {
    // Logueamos el error específico del catch
    console.error('[Auth] Error durante el proceso de login:', error);
    next(error);
  }
};