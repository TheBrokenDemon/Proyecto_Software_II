-- ============================================================
-- MindCheck ULima — Migration 011
-- Asignacion de estudiantes a psicologos
--   Un estudiante queda asignado a un psicologo cuando este
--   confirma/reprograma su cita. Cupo maximo: 6 por psicologo.
-- ============================================================

ALTER TABLE users
  ADD COLUMN assigned_psychologist_id UUID REFERENCES users(id) ON DELETE SET NULL;

CREATE INDEX idx_users_assigned_psych ON users (assigned_psychologist_id);

COMMENT ON COLUMN users.assigned_psychologist_id IS 'Psicologo que atiende a este estudiante (NULL = sin asignar)';