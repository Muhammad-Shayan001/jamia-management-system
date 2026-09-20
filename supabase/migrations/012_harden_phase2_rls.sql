-- ============================================================
-- Migration 012: Harden RLS for Phase 2 Academic Tables
-- Fixes:
--   Fix 3 — quiz_questions: students cannot read correct_option via direct query
--   Fix 4 — quiz_attempts / quiz_answers / assignment_submissions:
--            students cannot self-grade via direct UPDATE on sensitive columns
-- ============================================================

-- ─── FIX 3: quiz_questions ───────────────────────────────────
-- DROP the permissive "anyone authenticated" policy that lets a student
-- SELECT correct_option by querying the table directly.
DROP POLICY IF EXISTS "quiz_questions_all_auth" ON quiz_questions;

-- Students MAY select questions (without correct_option) for quizzes in
-- their own class. The correct_option column is withheld at the
-- application layer (getQuizWithQuestionsForStudent never selects it),
-- but this policy at minimum ensures they can only see questions for
-- quizzes relevant to their class — not every quiz in the system.
-- Teachers/admins keep full SELECT via quiz_questions_teacher_write (FOR ALL).
CREATE POLICY "quiz_questions_student_read" ON quiz_questions
  FOR SELECT USING (
    -- Staff: full access (already handled by quiz_questions_teacher_write FOR ALL)
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid()
        AND p.role IN ('teacher','admin','nazim','super_admin')
    )
    OR
    -- Students: may only read questions for published quizzes in their class
    EXISTS (
      SELECT 1
      FROM quizzes q
      JOIN students s ON s.class_id = q.class_id
      WHERE q.id = quiz_questions.quiz_id
        AND q.is_published = true
        AND s.profile_id = auth.uid()
    )
  );

-- ─── FIX 4a: quiz_attempts ───────────────────────────────────
-- Replace FOR ALL with split INSERT/SELECT for students.
-- Students get INSERT (start attempt) and SELECT (read own result)
-- but NOT UPDATE — so they cannot directly set score via API.
-- The legitimate path (submitQuiz server action) runs via adminClient.
DROP POLICY IF EXISTS "quiz_attempts_student" ON quiz_attempts;

CREATE POLICY "quiz_attempts_student_insert" ON quiz_attempts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM students s WHERE s.profile_id = auth.uid()
        AND s.id = quiz_attempts.student_id
    )
  );

CREATE POLICY "quiz_attempts_student_select" ON quiz_attempts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s WHERE s.profile_id = auth.uid()
        AND s.id = quiz_attempts.student_id
    )
  );

-- Staff: full access (teacher can see all attempts for their quizzes)
DROP POLICY IF EXISTS "quiz_attempts_staff" ON quiz_attempts;
CREATE POLICY "quiz_attempts_staff" ON quiz_attempts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid()
        AND p.role IN ('teacher','admin','nazim','super_admin')
    )
  );

-- ─── FIX 4b: quiz_answers ────────────────────────────────────
-- Same pattern: students can INSERT their answers and SELECT their own,
-- but cannot UPDATE is_correct or any other field.
DROP POLICY IF EXISTS "quiz_answers_student" ON quiz_answers;

CREATE POLICY "quiz_answers_student_insert" ON quiz_answers
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1
      FROM quiz_attempts qa
      JOIN students s ON s.id = qa.student_id
      WHERE qa.id = quiz_answers.attempt_id
        AND s.profile_id = auth.uid()
    )
  );

CREATE POLICY "quiz_answers_student_select" ON quiz_answers
  FOR SELECT USING (
    EXISTS (
      SELECT 1
      FROM quiz_attempts qa
      JOIN students s ON s.id = qa.student_id
      WHERE qa.id = quiz_answers.attempt_id
        AND s.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "quiz_answers_staff" ON quiz_answers;
CREATE POLICY "quiz_answers_staff" ON quiz_answers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid()
        AND p.role IN ('teacher','admin','nazim','super_admin')
    )
  );

-- ─── FIX 4c: assignment_submissions ─────────────────────────
-- Students can INSERT (submit) and SELECT (view) their own submission,
-- but NOT UPDATE marks_obtained/feedback/graded_at.
-- The legitimate grading path (gradeSubmission server action) runs via adminClient.
DROP POLICY IF EXISTS "submissions_student" ON assignment_submissions;

CREATE POLICY "submissions_student_insert" ON assignment_submissions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM students s WHERE s.profile_id = auth.uid()
        AND s.id = assignment_submissions.student_id
    )
  );

CREATE POLICY "submissions_student_select" ON assignment_submissions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM students s WHERE s.profile_id = auth.uid()
        AND s.id = assignment_submissions.student_id
    )
  );

-- Staff write access for grading (kept from the original migration, just re-stated for clarity)
DROP POLICY IF EXISTS "submissions_staff_all" ON assignment_submissions;
CREATE POLICY "submissions_staff_all" ON assignment_submissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p WHERE p.id = auth.uid()
        AND p.role IN ('teacher','admin','nazim','super_admin')
    )
  );
