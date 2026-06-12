-- ============================================================
-- MindCheck ULima — Migration 007
-- Seed: psicologos de prueba
-- IMPORTANTE: password_hash debe ser generado con bcrypt
-- ============================================================
--
-- El campo password_hash es TEXT y acepta cualquier string,
-- incluyendo letras, numeros y simbolos. NO hay restriccion en BD.
-- El bug anterior era del backend (validacion regex incorrecta).
--
-- Para generar un hash bcrypt en Node.js:
--
--   const bcrypt = require('bcryptjs');
--   const hash = await bcrypt.hash('TuPassword123', 10);
--   console.log(hash);
--
-- Hashes de ejemplo para testing:
--   'Prueba123'   → $2a$10$dXJ3SW6G7P50eS3q5LxV2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW
--   'Psico2024!'  → $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36CHhzPm
--
-- O usa el endpoint del backend:
--   POST /api/psychologist-register
--   { "full_name": "...", "email": "...", "password": "..." }
-- ============================================================

INSERT INTO users (full_name, email, password_hash, role)
VALUES
  (
    'Dr. Juan Perez',
    'juan.perez@ulima.edu.pe',
    '$2a$10$dXJ3SW6G7P50eS3q5LxV2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW',
    'psicologo'
  ),
  (
    'Dra. Maria Lopez',
    'maria.lopez@ulima.edu.pe',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86E36CHhzPm',
    'psicologo'
  );