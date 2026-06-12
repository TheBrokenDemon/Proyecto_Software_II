-- ============================================================
-- MindCheck ULima — Migration 005
-- Tablas: evaluation_responses, response_answers
-- Cubre: S2-11, S2-65, S2-66
-- ============================================================

CREATE TABLE evaluation_responses (
  id              UUID      PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  evaluation_id   UUID      NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  completed_at    TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_eval_responses_user ON evaluation_responses (user_id, completed_at DESC);
CREATE INDEX idx_eval_responses_eval ON evaluation_responses (evaluation_id);

COMMENT ON TABLE evaluation_responses IS 'Registro de cada vez que un estudiante completa una evaluacion';

-- ----------------------------------------------------------------

CREATE TABLE response_answers (
  id              UUID  PRIMARY KEY DEFAULT uuid_generate_v4(),
  response_id     UUID  NOT NULL REFERENCES evaluation_responses(id) ON DELETE CASCADE,
  question_id     UUID  NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  answer          TEXT  NOT NULL
);

CREATE INDEX idx_response_answers_response ON response_answers (response_id);

COMMENT ON TABLE  response_answers        IS 'Respuestas individuales por pregunta de una evaluacion';
COMMENT ON COLUMN response_answers.answer IS 'Texto libre: numero de escala, opcion elegida o texto abierto';