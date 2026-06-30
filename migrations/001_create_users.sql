-- ============================================================
-- MindCheck ULima — Migration 001
-- Tabla: users
-- Cubre: S2-39, S2-40, S2-41, S2-64
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE users (
  id            UUID         PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name     VARCHAR(120) NOT NULL,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT         NOT NULL,       -- bcrypt hash, nunca texto plano
  age           INT          CHECK (age >= 18 AND age <= 80),
  gender        VARCHAR(30),
  role          VARCHAR(20)  NOT NULL DEFAULT 'estudiante'
                             CHECK (role IN ('estudiante', 'psicologo')),
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_users_email ON users (email);
CREATE        INDEX idx_users_role  ON users (role);

-- Trigger: actualiza updated_at automaticamente en cada UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE  users               IS 'Usuarios del sistema: estudiantes y psicologos';
COMMENT ON COLUMN users.role          IS 'estudiante | psicologo';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt — nunca guardar texto plano';