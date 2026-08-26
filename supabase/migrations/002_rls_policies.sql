-- ============================================================
-- Migration 002: Row Level Security Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE profiles                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE students                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_teacher_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance                ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests            ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE grade_boundaries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE results                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus_topics           ENABLE ROW LEVEL SECURITY;
ALTER TABLE quizzes                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_questions            ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE hifz_progress             ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_structures            ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_vouchers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements             ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE donations                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses                  ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper function: get caller's role
-- ============================================================
CREATE OR REPLACE FUNCTION auth_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

-- Helper: is the caller an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin');
$$;

-- Helper: get teacher record id for current user
CREATE OR REPLACE FUNCTION my_teacher_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id FROM teachers WHERE profile_id = auth.uid() LIMIT 1;
$$;

-- Helper: get student record id for current user
CREATE OR REPLACE FUNCTION my_student_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT id FROM students WHERE profile_id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- PROFILES
-- ============================================================
-- Users can read their own profile; admin can read all
CREATE POLICY "profiles_select" ON profiles FOR SELECT
  USING (id = auth.uid() OR is_admin());

-- Only admin can insert profiles
CREATE POLICY "profiles_insert" ON profiles FOR INSERT
  WITH CHECK (is_admin());

-- Users update their own; admin updates any
CREATE POLICY "profiles_update" ON profiles FOR UPDATE
  USING (id = auth.uid() OR is_admin())
  WITH CHECK (id = auth.uid() OR is_admin());

-- Only admin can delete
CREATE POLICY "profiles_delete" ON profiles FOR DELETE
  USING (is_admin());

-- ============================================================
-- SESSIONS — read by all authenticated, write by admin only
-- ============================================================
CREATE POLICY "sessions_select" ON sessions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "sessions_write"  ON sessions FOR ALL   USING (is_admin());

-- ============================================================
-- CLASSES — read by all authenticated, write by admin only
-- ============================================================
CREATE POLICY "classes_select" ON classes FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "classes_write"  ON classes FOR ALL   USING (is_admin());

-- ============================================================
-- SUBJECTS — read by all, write by admin
-- ============================================================
CREATE POLICY "subjects_select" ON subjects FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "subjects_write"  ON subjects FOR ALL   USING (is_admin());

-- ============================================================
-- STUDENTS
-- Admin: full access
-- Teacher: see students in assigned classes
-- Student: see only their own record
-- Parent: see their linked student's record
-- ============================================================
CREATE POLICY "students_admin" ON students FOR ALL USING (is_admin());

CREATE POLICY "students_teacher_select" ON students FOR SELECT
  USING (
    auth_role() = 'teacher' AND
    class_id IN (
      SELECT cta.class_id FROM class_teacher_assignments cta
      WHERE cta.teacher_id = my_teacher_id()
    )
  );

CREATE POLICY "students_own_select" ON students FOR SELECT
  USING (profile_id = auth.uid());

-- ============================================================
-- TEACHERS
-- Admin: full access
-- Teacher: read own record
-- Others: read (for display purposes in timetable etc.)
-- ============================================================
CREATE POLICY "teachers_admin"  ON teachers FOR ALL    USING (is_admin());
CREATE POLICY "teachers_own"    ON teachers FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "teachers_select" ON teachers FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================
-- CLASS TEACHER ASSIGNMENTS
-- ============================================================
CREATE POLICY "cta_admin"   ON class_teacher_assignments FOR ALL    USING (is_admin());
CREATE POLICY "cta_select"  ON class_teacher_assignments FOR SELECT USING (auth.uid() IS NOT NULL);

-- ============================================================
-- ATTENDANCE
-- Admin: full access
-- Teacher: read/write for their assigned classes
-- Student: read own records
-- ============================================================
CREATE POLICY "attendance_admin" ON attendance FOR ALL USING (is_admin());

CREATE POLICY "attendance_teacher" ON attendance FOR ALL
  USING (
    auth_role() = 'teacher' AND
    class_id IN (
      SELECT cta.class_id FROM class_teacher_assignments cta
      WHERE cta.teacher_id = my_teacher_id()
    )
  );

CREATE POLICY "attendance_student_select" ON attendance FOR SELECT
  USING (student_id = my_student_id());

-- ============================================================
-- LEAVE REQUESTS
-- ============================================================
CREATE POLICY "leaves_admin"   ON leave_requests FOR ALL USING (is_admin());

CREATE POLICY "leaves_teacher" ON leave_requests FOR SELECT
  USING (
    auth_role() = 'teacher' AND
    student_id IN (
      SELECT s.id FROM students s
      WHERE s.class_id IN (
        SELECT cta.class_id FROM class_teacher_assignments cta
        WHERE cta.teacher_id = my_teacher_id()
      )
    )
  );

CREATE POLICY "leaves_teacher_update" ON leave_requests FOR UPDATE
  USING (
    auth_role() = 'teacher' AND reviewed_by IS NULL
  );

CREATE POLICY "leaves_own" ON leave_requests FOR SELECT
  USING (student_id = my_student_id() OR requested_by = auth.uid());

CREATE POLICY "leaves_insert" ON leave_requests FOR INSERT
  WITH CHECK (
    auth_role() IN ('student','parent') AND
    student_id = my_student_id()
  );

-- ============================================================
-- EXAMS
-- ============================================================
CREATE POLICY "exams_admin"   ON exams FOR ALL    USING (is_admin());
CREATE POLICY "exams_teacher" ON exams FOR SELECT USING (auth_role() = 'teacher');
CREATE POLICY "exams_student" ON exams FOR SELECT USING (
  auth_role() IN ('student','parent') AND
  class_id = (SELECT class_id FROM students WHERE profile_id = auth.uid() LIMIT 1)
);

-- Teacher can insert exams for their classes
CREATE POLICY "exams_teacher_insert" ON exams FOR INSERT
  WITH CHECK (
    auth_role() = 'teacher' AND
    class_id IN (
      SELECT cta.class_id FROM class_teacher_assignments cta
      WHERE cta.teacher_id = my_teacher_id()
    )
  );

-- ============================================================
-- GRADE BOUNDARIES — read all, write admin only
-- ============================================================
CREATE POLICY "grades_select" ON grade_boundaries FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "grades_write"  ON grade_boundaries FOR ALL   USING (is_admin());

-- ============================================================
-- RESULTS
-- ============================================================
CREATE POLICY "results_admin"   ON results FOR ALL USING (is_admin());

CREATE POLICY "results_teacher" ON results FOR ALL
  USING (
    auth_role() = 'teacher' AND
    student_id IN (
      SELECT s.id FROM students s
      WHERE s.class_id IN (
        SELECT cta.class_id FROM class_teacher_assignments cta
        WHERE cta.teacher_id = my_teacher_id()
      )
    )
  );

CREATE POLICY "results_student" ON results FOR SELECT
  USING (student_id = my_student_id());

-- ============================================================
-- SYLLABUS — read all authenticated, write teacher/admin
-- ============================================================
CREATE POLICY "syllabus_select"         ON syllabus FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "syllabus_admin_write"    ON syllabus FOR ALL    USING (is_admin());
CREATE POLICY "syllabus_teacher_write"  ON syllabus FOR INSERT WITH CHECK (auth_role() = 'teacher');
CREATE POLICY "syllabus_teacher_update" ON syllabus FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "topics_select" ON syllabus_topics FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "topics_write"  ON syllabus_topics FOR ALL   USING (
  is_admin() OR auth_role() = 'teacher'
);

-- ============================================================
-- QUIZZES
-- ============================================================
CREATE POLICY "quizzes_admin"   ON quizzes FOR ALL    USING (is_admin());
CREATE POLICY "quizzes_teacher" ON quizzes FOR ALL    USING (auth_role() = 'teacher' AND created_by = auth.uid());
CREATE POLICY "quizzes_student" ON quizzes FOR SELECT USING (auth_role() IN ('student','parent') AND is_published = true);

CREATE POLICY "quiz_q_select" ON quiz_questions FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "quiz_q_write"  ON quiz_questions FOR ALL   USING (is_admin() OR auth_role() = 'teacher');

CREATE POLICY "attempts_admin"   ON quiz_attempts FOR ALL    USING (is_admin());
CREATE POLICY "attempts_teacher" ON quiz_attempts FOR SELECT USING (auth_role() = 'teacher');
CREATE POLICY "attempts_own"     ON quiz_attempts FOR ALL    USING (student_id = my_student_id());

-- ============================================================
-- HIFZ PROGRESS
-- ============================================================
CREATE POLICY "hifz_admin"   ON hifz_progress FOR ALL    USING (is_admin());
CREATE POLICY "hifz_teacher" ON hifz_progress FOR ALL    USING (auth_role() = 'teacher');
CREATE POLICY "hifz_own"     ON hifz_progress FOR SELECT USING (student_id = my_student_id());

-- ============================================================
-- FEE STRUCTURES — admin only
-- ============================================================
CREATE POLICY "fee_struct_select" ON fee_structures FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "fee_struct_write"  ON fee_structures FOR ALL   USING (is_admin());

-- ============================================================
-- FEE VOUCHERS
-- ============================================================
CREATE POLICY "vouchers_admin"  ON fee_vouchers FOR ALL    USING (is_admin());
CREATE POLICY "vouchers_own"    ON fee_vouchers FOR SELECT USING (
  student_id = my_student_id()
);

-- ============================================================
-- ANNOUNCEMENTS
-- ============================================================
CREATE POLICY "ann_admin"  ON announcements FOR ALL    USING (is_admin());
CREATE POLICY "ann_select" ON announcements FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND
    (target_roles IS NULL OR auth_role() = ANY(target_roles))
  );

-- ============================================================
-- TIMETABLE — read all, write admin/teacher
-- ============================================================
CREATE POLICY "tt_select" ON timetable FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "tt_write"  ON timetable FOR ALL   USING (is_admin());

-- ============================================================
-- DOCUMENTS
-- ============================================================
CREATE POLICY "docs_admin"  ON documents FOR ALL    USING (is_admin());
CREATE POLICY "docs_own"    ON documents FOR SELECT USING (student_id = my_student_id());
CREATE POLICY "docs_teacher_select" ON documents FOR SELECT
  USING (
    auth_role() = 'teacher' AND
    student_id IN (
      SELECT s.id FROM students s
      WHERE s.class_id IN (
        SELECT cta.class_id FROM class_teacher_assignments cta
        WHERE cta.teacher_id = my_teacher_id()
      )
    )
  );

-- ============================================================
-- DONATIONS — admin only
-- ============================================================
CREATE POLICY "donations_write"  ON donations FOR ALL    USING (is_admin());
CREATE POLICY "donations_select" ON donations FOR SELECT USING (is_admin());

-- ============================================================
-- EXPENSES — admin only
-- ============================================================
CREATE POLICY "expenses_write"  ON expenses FOR ALL    USING (is_admin());
CREATE POLICY "expenses_select" ON expenses FOR SELECT USING (is_admin());
