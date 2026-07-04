-- ============================================================
-- MindCheck ULima — Migration 010
-- Tabla: appointment_requests
-- Cubre: Solicitud de cita iniciada por el estudiante
--   El estudiante solicita, el psicologo confirma/reprograma/rechaza.
-- ============================================================

CREATE TABLE appointment_requests (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  psychologist_id UUID        REFERENCES users(id) ON DELETE SET NULL,
  reason          TEXT        NOT NULL,
  preferred_date  DATE,
  status          VARCHAR(20) NOT NULL DEFAULT 'solicitada'
                              CHECK (status IN ('solicitada','confirmada','reprogramada','rechazada','cancelada')),
  response_note   TEXT,
  confirmed_date  DATE,
  created_at      TIMESTAMP   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_apptreq_student ON appointment_requests (student_id);
CREATE INDEX idx_apptreq_status  ON appointment_requests (status);

-- Reutiliza el trigger de updated_at definido en migration 001
CREATE TRIGGER trg_apptreq_updated_at
  BEFORE UPDATE ON appointment_requests
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

COMMENT ON TABLE  appointment_requests                 IS 'Solicitudes de cita iniciadas por el estudiante';
COMMENT ON COLUMN appointment_requests.psychologist_id IS 'Psicologo que atiende la solicitud (se llena al responder)';
COMMENT ON COLUMN appointment_requests.status          IS 'solicitada | confirmada | reprogramada | rechazada | cancelada';
COMMENT ON COLUMN appointment_requests.confirmed_date  IS 'Fecha final que propone/confirma el psicologo';