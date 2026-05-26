-- ============================================================
-- Migration 004 - Tablas: evaluations y questions
-- ============================================================

CREATE TABLE evaluations (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       VARCHAR(120) NOT NULL,
  slug        VARCHAR(60)  NOT NULL UNIQUE,
  description TEXT,
  icon        VARCHAR(60),
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_evaluations_slug ON evaluations (slug);

COMMENT ON TABLE  evaluations           IS 'Evaluaciones psicologicas disponibles en el dashboard';
COMMENT ON COLUMN evaluations.slug      IS 'Identificador URL-friendly para el router del frontend';
COMMENT ON COLUMN evaluations.is_active IS 'FALSE oculta la evaluacion sin borrarla';

-- ----------------------------------------------------------------

CREATE TABLE questions (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  evaluation_id   UUID        NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
  content         TEXT        NOT NULL,
  type            VARCHAR(30) NOT NULL CHECK (type IN ('scale', 'multiple_choice', 'text')),
  options         TEXT[],
  order_index     INT         NOT NULL DEFAULT 1,
  required        BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_questions_evaluation ON questions (evaluation_id, order_index);

COMMENT ON TABLE  questions             IS 'Preguntas de cada evaluacion';
COMMENT ON COLUMN questions.type        IS 'scale | multiple_choice | text';
COMMENT ON COLUMN questions.options     IS 'Opciones de respuesta para preguntas multiple_choice';
COMMENT ON COLUMN questions.order_index IS 'Orden de aparicion de la pregunta en el formulario';
COMMENT ON COLUMN questions.required    IS 'TRUE = obligatoria';

-- ----------------------------------------------------------------
-- Seed: 4 evaluaciones con preguntas reales
-- ----------------------------------------------------------------

INSERT INTO evaluations (title, slug, description, icon, is_active) VALUES
('Bienestar emocional',  'bienestar-emocional', 'Evaluacion breve de tu estado emocional general basada en el cuestionario GHQ-12.', 'heart',   TRUE),
('Estres academico',     'estres-academico',    'Mide tu nivel de estres relacionado con tus actividades academicas basado en el inventario SISCO.', 'book',    TRUE),
('Ansiedad',             'ansiedad',            'Evaluacion del nivel de ansiedad generalizada basada en el cuestionario GAD-7.', 'alert',   TRUE),
('Calidad de sueno',     'calidad-sueno',       'Evaluacion de tus habitos y calidad de descanso basada en el indice PSQI.', 'moon',    TRUE);


-- ================================================================
-- BIENESTAR EMOCIONAL (8 preguntas - basado en GHQ-12)
-- Opciones: Nunca / Casi nunca / A veces / Casi siempre / Siempre
-- ================================================================

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  'En las ultimas semanas, ¿has podido concentrarte bien en lo que haces?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  1, TRUE FROM evaluations WHERE slug = 'bienestar-emocional';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Te has sentido util y con proposito en tu vida diaria?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  2, TRUE FROM evaluations WHERE slug = 'bienestar-emocional';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Has sido capaz de tomar decisiones sin dificultad?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  3, TRUE FROM evaluations WHERE slug = 'bienestar-emocional';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Te has sentido constantemente agotado o sin energia?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  4, TRUE FROM evaluations WHERE slug = 'bienestar-emocional';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Has sentido que no puedes superar tus dificultades?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  5, TRUE FROM evaluations WHERE slug = 'bienestar-emocional';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Has podido disfrutar de tus actividades cotidianas?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  6, TRUE FROM evaluations WHERE slug = 'bienestar-emocional';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Te has sentido triste o deprimido sin razon aparente?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  7, TRUE FROM evaluations WHERE slug = 'bienestar-emocional';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Has perdido confianza en ti mismo o en tus capacidades?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  8, TRUE FROM evaluations WHERE slug = 'bienestar-emocional';


-- ================================================================
-- ESTRES ACADEMICO (8 preguntas - basado en SISCO)
-- Opciones: Nunca / Casi nunca / A veces / Casi siempre / Siempre
-- ================================================================

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿La cantidad de tareas y trabajos academicos te genera agobio?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  1, TRUE FROM evaluations WHERE slug = 'estres-academico';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Los examenes o evaluaciones te generan un nivel alto de tension?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  2, TRUE FROM evaluations WHERE slug = 'estres-academico';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Sientes que el tiempo no te alcanza para cumplir con todas tus obligaciones academicas?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  3, TRUE FROM evaluations WHERE slug = 'estres-academico';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿La competencia con tus compañeros de clase te genera presion?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  4, TRUE FROM evaluations WHERE slug = 'estres-academico';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Has tenido problemas para dormir debido a preocupaciones academicas?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  5, TRUE FROM evaluations WHERE slug = 'estres-academico';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Sientes fatiga o cansancio cronico relacionado con tus estudios?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  6, TRUE FROM evaluations WHERE slug = 'estres-academico';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Has descuidado actividades de ocio o descanso por dedicarte a estudiar?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  7, TRUE FROM evaluations WHERE slug = 'estres-academico';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Sientes que el rendimiento academico exigido supera tus capacidades actuales?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  8, TRUE FROM evaluations WHERE slug = 'estres-academico';


-- ================================================================
-- ANSIEDAD (7 preguntas - GAD-7 completo)
-- Opciones: Nunca / Casi nunca / A veces / Casi siempre / Siempre
-- ================================================================

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Te has sentido nervioso, ansioso o con los nervios de punta?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  1, TRUE FROM evaluations WHERE slug = 'ansiedad';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿No has podido dejar de preocuparte o controlar tus preocupaciones?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  2, TRUE FROM evaluations WHERE slug = 'ansiedad';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Te has preocupado demasiado por diferentes cosas sin poder evitarlo?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  3, TRUE FROM evaluations WHERE slug = 'ansiedad';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Has tenido dificultad para relajarte o tranquilizarte?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  4, TRUE FROM evaluations WHERE slug = 'ansiedad';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Te has sentido tan inquieto que no puedes quedarte tranquilo?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  5, TRUE FROM evaluations WHERE slug = 'ansiedad';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Te has irritado o molestado con facilidad por cosas sin importancia?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  6, TRUE FROM evaluations WHERE slug = 'ansiedad';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Has sentido miedo de que algo terrible pueda ocurrir?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  7, TRUE FROM evaluations WHERE slug = 'ansiedad';


-- ================================================================
-- CALIDAD DE SUENO (6 preguntas - basado en PSQI)
-- Opciones: Nunca / Casi nunca / A veces / Casi siempre / Siempre
-- ================================================================

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Has tenido dificultad para quedarte dormido en menos de 30 minutos?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  1, TRUE FROM evaluations WHERE slug = 'calidad-sueno';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Te has despertado en medio de la noche sin poder volver a dormir?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  2, TRUE FROM evaluations WHERE slug = 'calidad-sueno';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Has dormido menos de 6 horas por noche durante la ultima semana?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  3, TRUE FROM evaluations WHERE slug = 'calidad-sueno';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Te has sentido con sueno o sin energia durante el dia por no haber descansado bien?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  4, TRUE FROM evaluations WHERE slug = 'calidad-sueno';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿El uso de pantallas (celular, computadora) antes de dormir ha afectado tu descanso?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  5, TRUE FROM evaluations WHERE slug = 'calidad-sueno';

INSERT INTO questions (evaluation_id, content, type, options, order_index, required)
SELECT id,
  '¿Consideras que la calidad de tu sueno afecta negativamente tu rendimiento academico?',
  'multiple_choice',
  ARRAY['Nunca', 'Casi nunca', 'A veces', 'Casi siempre', 'Siempre'],
  6, TRUE FROM evaluations WHERE slug = 'calidad-sueno';

