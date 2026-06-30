-- ============================================================
-- MindCheck ULima — Migration 009
-- Tabla: mood_checkins
-- Cubre: Check-in diario de animo (1 por dia por estudiante)
-- ============================================================

CREATE TABLE mood_checkins (
  id            UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  mood          SMALLINT  NOT NULL CHECK (mood BETWEEN 1 AND 4),
  note          TEXT,
  checkin_date  DATE      NOT NULL DEFAULT CURRENT_DATE,
  created_at    TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, checkin_date)
);

CREATE INDEX idx_mood_checkins_user ON mood_checkins (user_id, checkin_date DESC);

COMMENT ON TABLE  mood_checkins              IS 'Registro diario del estado de animo del estudiante (1 por dia)';
COMMENT ON COLUMN mood_checkins.mood         IS '1=Muy mal, 2=Mal, 3=Regular, 4=Bien';
COMMENT ON COLUMN mood_checkins.checkin_date IS 'Fecha del check-in; UNIQUE(user_id, checkin_date) garantiza 1 por dia';
