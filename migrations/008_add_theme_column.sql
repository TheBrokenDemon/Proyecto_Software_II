-- ============================================================
-- MindCheck ULima — Migration 008
-- Agrega columna theme para personalización visual
-- Cubre: R2-10
-- ============================================================

ALTER TABLE users 
ADD COLUMN theme VARCHAR(30) NOT NULL DEFAULT 'institucional'
CHECK (theme IN ('institucional', 'naturaleza', 'descanso'));

COMMENT ON COLUMN users.theme IS 'Tema visual preferido del usuario: institucional | naturaleza | descanso';