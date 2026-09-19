-- ============================================================
-- Migration 008: Idempotent catch-up schema
-- Run this if you already have 001-007 applied and hit
-- "relation already exists" errors. Uses IF NOT EXISTS
-- so it is safe to re-run multiple times.
-- ============================================================

-- Enable extensions safely
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- sessions
CREATE TABLE IF NOT EXISTS sessions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  start_date  date NOT NULL,
  end_date    date NOT NULL,
  is_current  boolean DEFAULT false,
  created_at  timestamptz DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS sessions_current_idx ON sessions(is_current) WHERE is_current = true;

-- classes
CREATE TABLE IF NOT EXISTS classes (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en     text NOT NULL,
  name_ur     text,
  level       int NOT NULL,
  session_id  uuid REFERENCES sessions(id) ON DELETE CASCADE,
  capacity    int DEFAULT 40,
  created_at  timestamptz DEFAULT now()
);

-- profiles — allow super_admin role (001 only allowed admin/teacher/student/parent)
DO $$
BEGIN
  ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('admin','teacher','student','parent','nazim','super_admin'));
EXCEPTION WHEN others THEN NULL;
END $$;

-- subjects
CREATE TABLE IF NOT EXISTS subjects (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en    text NOT NULL,
  name_ur    text,
  class_id   uuid REFERENCES classes(id) ON DELETE CASCADE,
  is_active  boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- students
CREATE TABLE IF NOT EXISTS students (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id        uuid REFERENCES profiles(id) ON DELETE SET NULL,
  admission_number  text UNIQUE NOT NULL,
  name_en           text NOT NULL,
  name_ur           text NOT NULL,
  father_name_en    text NOT NULL,
  father_name_ur    text,
  cnic_or_bform     text,
  class_id          uuid REFERENCES classes(id) ON DELETE SET NULL,
  session_id        uuid REFERENCES sessions(id) ON DELETE SET NULL,
  photo_url         text,
  guardian_phone    text,
  guardian_email    text,
  address           text,
  enrolled_at       date DEFAULT CURRENT_DATE,
  is_active         boolean DEFAULT true,
  created_at        timestamptz DEFAULT now()
);

-- teachers
CREATE TABLE IF NOT EXISTS teachers (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  employee_number text UNIQUE NOT NULL,
  name_en         text NOT NULL,
  name_ur         text,
  specialization  text,
  photo_url       text,
  hire_date       date,
  is_active       boolean DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- class_teacher_assignments
CREATE TABLE IF NOT EXISTS class_teacher_assignments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    uuid REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id  uuid REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id  uuid REFERENCES subjects(id) ON DELETE CASCADE,
  is_primary  boolean DEFAULT false,
  session_id  uuid REFERENCES sessions(id) ON DELETE CASCADE,
  UNIQUE(class_id, teacher_id, subject_id, session_id)
);

-- attendance
CREATE TABLE IF NOT EXISTS attendance (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   uuid REFERENCES students(id) ON DELETE CASCADE,
  user_id      uuid REFERENCES profiles(id) ON DELETE SET NULL,
  class_id     uuid REFERENCES classes(id) ON DELETE CASCADE,
  subject_id   uuid REFERENCES subjects(id) ON DELETE CASCADE,
  date         date NOT NULL,
  period       int DEFAULT 1,
  role         text DEFAULT 'student',
  status       text NOT NULL CHECK (status IN ('present','absent','late','excused')),
  marked_by    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  scan_method  text,
  gate         text,
  notes        text,
  created_at   timestamptz DEFAULT now()
);

-- leave_requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id    uuid REFERENCES students(id) ON DELETE CASCADE,
  requested_by  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  from_date     date NOT NULL,
  to_date       date NOT NULL,
  reason        text NOT NULL,
  status        text DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at   timestamptz,
  created_at    timestamptz DEFAULT now()
);

-- exams
CREATE TABLE IF NOT EXISTS exams (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en       text NOT NULL,
  name_ur       text,
  type          text NOT NULL CHECK (type IN ('maahana','nisf_saal','sanawi','dawra','quiz')),
  class_id      uuid REFERENCES classes(id) ON DELETE CASCADE,
  session_id    uuid REFERENCES sessions(id) ON DELETE CASCADE,
  exam_date     date,
  total_marks   numeric NOT NULL DEFAULT 100,
  passing_marks numeric NOT NULL DEFAULT 40,
  created_by    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at    timestamptz DEFAULT now()
);

-- grade_boundaries
CREATE TABLE IF NOT EXISTS grade_boundaries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  grade       text NOT NULL,
  min_percent numeric NOT NULL,
  max_percent numeric NOT NULL,
  label_en    text,
  label_ur    text
);
INSERT INTO grade_boundaries (grade, min_percent, max_percent, label_en, label_ur)
SELECT * FROM (VALUES
  ('A+', 90, 100, 'Distinction', 'امتیاز'),
  ('A',  80,  89, 'Excellent',   'اعلیٰ'),
  ('B+', 70,  79, 'Very Good',   'بہت اچھا'),
  ('B',  60,  69, 'Good',        'اچھا'),
  ('C',  50,  59, 'Satisfactory','اطمینان بخش'),
  ('D',  40,  49, 'Pass',        'کامیاب'),
  ('F',   0,  39, 'Fail',        'ناکام')
) AS v(grade, min_percent, max_percent, label_en, label_ur)
WHERE NOT EXISTS (SELECT 1 FROM grade_boundaries);

-- results
CREATE TABLE IF NOT EXISTS results (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id     uuid REFERENCES students(id) ON DELETE CASCADE,
  exam_id        uuid REFERENCES exams(id) ON DELETE CASCADE,
  subject_id     uuid REFERENCES subjects(id) ON DELETE CASCADE,
  marks_obtained numeric,
  is_absent      boolean DEFAULT false,
  grade          text,
  remarks        text,
  entered_by     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     timestamptz DEFAULT now(),
  UNIQUE(student_id, exam_id, subject_id)
);

-- syllabus
CREATE TABLE IF NOT EXISTS syllabus (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id  uuid REFERENCES subjects(id) ON DELETE CASCADE,
  class_id    uuid REFERENCES classes(id) ON DELETE CASCADE,
  session_id  uuid REFERENCES sessions(id) ON DELETE CASCADE,
  title_en    text NOT NULL,
  title_ur    text,
  file_url    text,
  created_by  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS syllabus_topics (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  syllabus_id  uuid REFERENCES syllabus(id) ON DELETE CASCADE,
  topic_en     text NOT NULL,
  topic_ur     text,
  order_index  int DEFAULT 0,
  is_covered   boolean DEFAULT false,
  covered_at   date,
  covered_by   uuid REFERENCES profiles(id) ON DELETE SET NULL
);

-- quizzes
CREATE TABLE IF NOT EXISTS quizzes (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id      uuid REFERENCES exams(id) ON DELETE CASCADE,
  title        text NOT NULL,
  time_limit   int,
  is_published boolean DEFAULT false,
  created_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at   timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS quiz_questions (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id       uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  options       jsonb NOT NULL,
  marks         numeric DEFAULT 1,
  order_index   int DEFAULT 0
);

CREATE TABLE IF NOT EXISTS quiz_attempts (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id      uuid REFERENCES quizzes(id) ON DELETE CASCADE,
  student_id   uuid REFERENCES students(id) ON DELETE CASCADE,
  answers      jsonb,
  score        numeric,
  started_at   timestamptz,
  submitted_at timestamptz,
  UNIQUE(quiz_id, student_id)
);

-- hifz / tajweed tracker
CREATE TABLE IF NOT EXISTS hifz_progress (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   uuid REFERENCES students(id) ON DELETE CASCADE,
  juz_number   int NOT NULL CHECK (juz_number BETWEEN 1 AND 30),
  surah_from   text,
  surah_to     text,
  status       text DEFAULT 'not_started' CHECK (status IN ('not_started','in_progress','completed','revised')),
  completed_at date,
  teacher_id   uuid REFERENCES teachers(id) ON DELETE SET NULL,
  notes        text,
  session_id   uuid REFERENCES sessions(id) ON DELETE CASCADE,
  UNIQUE(student_id, juz_number, session_id)
);

-- fee_structures
CREATE TABLE IF NOT EXISTS fee_structures (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id   uuid REFERENCES classes(id) ON DELETE CASCADE,
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,
  fee_head   text NOT NULL CHECK (fee_head IN ('tuition','admission','exam','hostel','library','other')),
  amount     numeric NOT NULL,
  frequency  text NOT NULL CHECK (frequency IN ('monthly','term','annual','one_time')),
  due_day    int DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

-- fee_vouchers
CREATE TABLE IF NOT EXISTS fee_vouchers (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voucher_number    text UNIQUE NOT NULL,
  student_id        uuid REFERENCES students(id) ON DELETE CASCADE,
  fee_structure_id  uuid REFERENCES fee_structures(id) ON DELETE SET NULL,
  month_year        text,
  amount            numeric NOT NULL,
  due_date          date NOT NULL,
  paid_at           timestamptz,
  payment_method    text CHECK (payment_method IN ('online','cash','bank_transfer','jazzcash','easypaisa')),
  payment_ref       text,
  receipt_url       text,
  status            text DEFAULT 'unpaid' CHECK (status IN ('unpaid','paid','overdue','waived')),
  created_at        timestamptz DEFAULT now()
);

-- announcements
CREATE TABLE IF NOT EXISTS announcements (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_en       text NOT NULL,
  title_ur       text,
  body_en        text,
  body_ur        text,
  target_roles   text[],
  target_classes uuid[],
  send_whatsapp  boolean DEFAULT false,
  send_email     boolean DEFAULT false,
  published_at   timestamptz,
  created_by     uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at     timestamptz DEFAULT now()
);

-- timetable
CREATE TABLE IF NOT EXISTS timetable (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    uuid REFERENCES classes(id) ON DELETE CASCADE,
  subject_id  uuid REFERENCES subjects(id) ON DELETE CASCADE,
  teacher_id  uuid REFERENCES teachers(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  period      int NOT NULL,
  start_time  time NOT NULL,
  end_time    time NOT NULL,
  session_id  uuid REFERENCES sessions(id) ON DELETE CASCADE,
  UNIQUE(class_id, day_of_week, period, session_id)
);

-- documents
CREATE TABLE IF NOT EXISTS documents (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id  uuid REFERENCES students(id) ON DELETE CASCADE,
  doc_type    text CHECK (doc_type IN ('admission_form','certificate','id_card','other')),
  name        text NOT NULL,
  file_url    text NOT NULL,
  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now()
);

-- donations
CREATE TABLE IF NOT EXISTS donations (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_name  text,
  amount      numeric NOT NULL,
  purpose     text CHECK (purpose IN ('zakat','sadqa','general')),
  date        date NOT NULL DEFAULT CURRENT_DATE,
  receipt_num text UNIQUE,
  notes       text,
  created_by  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now()
);

-- expenses
CREATE TABLE IF NOT EXISTS expenses (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category    text CHECK (category IN ('salary','utilities','maintenance','stationery','other')),
  description text NOT NULL,
  amount      numeric NOT NULL,
  date        date NOT NULL DEFAULT CURRENT_DATE,
  receipt_url text,
  created_by  uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at  timestamptz DEFAULT now()
);

-- audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id    uuid REFERENCES profiles(id) ON DELETE SET NULL,
  actor_email text,
  actor_role  text,
  action      text NOT NULL,
  entity_type text,
  entity_id   uuid,
  details     jsonb,
  created_at  timestamptz DEFAULT now()
);

-- institution_settings
CREATE TABLE IF NOT EXISTS institution_settings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key          text UNIQUE NOT NULL,
  value        text,
  updated_by   uuid REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at   timestamptz DEFAULT now()
);

-- ============================================================
-- RLS: Enable on all tables (safe to re-run)
-- ============================================================
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT unnest(ARRAY[
    'sessions','classes','profiles','subjects','students','teachers',
    'class_teacher_assignments','attendance','leave_requests','exams',
    'grade_boundaries','results','syllabus','syllabus_topics',
    'quizzes','quiz_questions','quiz_attempts','hifz_progress',
    'fee_structures','fee_vouchers','announcements','timetable',
    'documents','donations','expenses','audit_logs','institution_settings'
  ]) LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;
