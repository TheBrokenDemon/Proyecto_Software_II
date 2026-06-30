-- ============================================================
-- MindCheck ULima — Migration 006  ← NUEVA para Sprint 2
-- Tablas: psychological_followups, appointments
-- Cubre: S2-67, S2-68, S2-19
-- ============================================================

-- ----------------------------------------------------------------
-- psychological_followups
-- Un psicologo abre un caso de seguimiento sobre un estudiante.
-- Cubre S2-67: gestionar seguimiento psicologico
-- ----------------------------------------------------------------

CREATE TABLE psychological_followups (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  psychologist_id  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status           VARCHAR(30) NOT NULL DEFAULT 'pendiente'
                               CHECK (status IN ('pendiente', 'en_seguimiento', 'cerrado')),
  notes            TEXT,
  created_at       TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_followups_student       ON psychological_followups (student_id);
CREATE INDEX idx_followups_psychologist  ON psychological_followups (psychologist_id);
CREATE INDEX idx_followups_status        ON psychological_followups (status);

-- Reutiliza el mismo trigger de updated_at definido en migration 001
CREATE TRIGGER trg_followups_updated_at
  BEFORE UPDATE ON psychological_followups
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE  psychological_followups            IS 'Casos de seguimiento preventivo abiertos por un psicologo';
COMMENT ON COLUMN psychological_followups.status     IS 'pendiente | en_seguimiento | cerrado';
COMMENT ON COLUMN psychological_followups.notes      IS 'Observaciones del psicologo sobre el caso';

-- ----------------------------------------------------------------
-- appointments
-- Citas o contactos generados dentro de un seguimiento.
-- Cubre S2-68: contactar estudiante
-- Cubre S2-19: confirmar atencion psicologica
-- ----------------------------------------------------------------

CREATE TABLE appointments (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  followup_id         UUID        NOT NULL REFERENCES psychological_followups(id) ON DELETE CASCADE,
  scheduled_at        TIMESTAMP   NOT NULL,
  status              VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                                  CHECK (status IN ('pendiente', 'confirmada', 'reprogramada', 'cancelada')),
  psychologist_notes  TEXT,
  student_notes       TEXT,
  created_at          TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_followup     ON appointments (followup_id);
CREATE INDEX idx_appointments_scheduled    ON appointments (scheduled_at);
CREATE INDEX idx_appointments_status       ON appointments (status);

CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE  appointments                      IS 'Citas de acompanamiento dentro de un seguimiento psicologico';
COMMENT ON COLUMN appointments.status               IS 'pendiente | confirmada | reprogramada | cancelada';
COMMENT ON COLUMN appointments.psychologist_notes   IS 'Notas del psicologo sobre la cita';
COMMENT ON COLUMN appointments.student_notes        IS 'Notas o respuesta del estudiante al confirmar';