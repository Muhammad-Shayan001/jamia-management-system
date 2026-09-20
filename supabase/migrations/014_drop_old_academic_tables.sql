-- ============================================================
-- Migration 014: Drop old mismatched academic tables
-- ============================================================
-- The database previously contained an older version of these tables
-- without the columns expected by Phase 2 (e.g., class_id).
-- This caused Migration 009 to fail and rollback.
-- Since these tables have no data, we drop them so 009 can create them correctly.

DROP TABLE IF EXISTS quiz_answers CASCADE;
DROP TABLE IF EXISTS quiz_attempts CASCADE;
DROP TABLE IF EXISTS quiz_questions CASCADE;
DROP TABLE IF EXISTS quizzes CASCADE;
DROP TABLE IF EXISTS hifz_progress CASCADE;
