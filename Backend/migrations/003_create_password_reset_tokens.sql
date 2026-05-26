-- ============================================================
-- Migration 003 - Tabla: password_reset_tokens
-- ============================================================

CREATE TABLE password_reset_tokens (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token       VARCHAR(255) NOT NULL UNIQUE,
  expires_at  TIMESTAMP   NOT NULL,
  used        BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_prt_token   ON password_reset_tokens (token);
CREATE        INDEX idx_prt_user_id ON password_reset_tokens (user_id);

COMMENT ON TABLE  password_reset_tokens            IS 'Tokens temporales para recuperacion de contrasena';
COMMENT ON COLUMN password_reset_tokens.used       IS 'TRUE cuando el token ya fue utilizado - no puede usarse de nuevo';
COMMENT ON COLUMN password_reset_tokens.expires_at IS 'Expira 15 minutos despues de generarse';
