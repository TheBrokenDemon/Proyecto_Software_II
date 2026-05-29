-- ============================================================
-- MindCheck ULima - Migrations Runner v2
-- Sprint 1 / Release 1 (esquema actualizado)
--
-- Ejecutar con:
--   psql -U postgres -d mindcheck_db -f run_all.sql
-- ============================================================

\echo '==> 001 Creando tabla users...'
\i 001_create_users.sql

\echo '==> 002 Creando tabla sessions...'
\i 002_create_sessions.sql

\echo '==> 003 Creando tabla password_reset_tokens...'
\i 003_create_password_reset_tokens.sql

\echo '==> 004 Creando tablas evaluations y questions + seed...'
\i 004_create_evaluations_questions.sql

\echo '==> 005 Creando tablas evaluation_responses y response_answers...'
\i 005_create_responses.sql

\echo '==> Todas las migraciones aplicadas correctamente.'
