-- ============================================================
-- MindCheck ULima — Migrations Runner
-- Release 1 — Sprint 1 y Sprint 2
--
-- Ejecutar con:
--   psql -U postgres -d mindcheck_db -f run_all.sql
--
-- Para crear la base de datos antes de ejecutar:
--   psql -U postgres -c "CREATE DATABASE mindcheck_db;"
-- ============================================================

\echo ''
\echo '===== MindCheck ULima — Iniciando migraciones ====='
\echo ''

\echo '--> 001 Tabla users...'
\i 001_create_users.sql

\echo '--> 002 Tabla sessions...'
\i 002_create_sessions.sql

\echo '--> 003 Tabla password_reset_tokens...'
\i 003_create_password_reset_tokens.sql

\echo '--> 004 Tablas evaluations y questions + seed de evaluaciones...'
\i 004_create_evaluations_questions.sql

\echo '--> 005 Tablas evaluation_responses y response_answers...'
\i 005_create_responses.sql

\echo '--> 006 Tablas psychological_followups y appointments (Sprint 2)...'
\i 006_create_followups_appointments.sql

\echo '--> 007 Seed de psicologos de prueba...'
\i 007_seed_psychologists.sql

\echo ''
\echo '===== Todas las migraciones aplicadas correctamente ====='
\echo ''