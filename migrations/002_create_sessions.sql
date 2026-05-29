-- ============================================================
-- Migration 002 - Tabla: sessions
-- ============================================================

CREATE TABLE sessions (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       TEXT        NOT NULL UNIQUE,
  expires_at  TIMESTAMP   NOT NULL,
  created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_sessions_token   ON sessions (token);
CREATE        INDEX idx_sessions_user_id ON sessions (user_id);

COMMENT ON TABLE sessions IS 'Tokens JWT activos - se elimina la fila al hacer logout';
