-- ============================================================
-- Migration 020: Complete Schema Extensions
-- Adds all missing tables for complete Jamia Management System
-- ============================================================

-- ============================================================
-- EXAMINATION SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  campus_id uuid REFERENCES campuses(id) ON DELETE SET NULL,
  session_id uuid REFERENCES sessions(id) ON DELETE CASCADE,

  name_en text NOT NULL,
  name_ur text,
  exam_type text NOT NULL CHECK (exam_type IN ('monthly', 'midterm', 'final', 'annual', 'oral', 'practical', 'internal')),

  start_date date NOT NULL,
  end_date date NOT NULL,

  is_published boolean DEFAULT false,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS exam_subjects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  subject_id uuid NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,

  exam_date date,
  exam_time time,
  duration_minutes int,
  room text,
  invigilator_id uuid REFERENCES teachers(id) ON DELETE SET NULL,

  total_marks numeric NOT NULL DEFAULT 100,
  passing_marks numeric NOT NULL DEFAULT 40,
  written_marks numeric DEFAULT 100,
  oral_marks numeric DEFAULT 0,
  practical_marks numeric DEFAULT 0,

  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS marks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_subject_id uuid NOT NULL REFERENCES exam_subjects(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  written_obtained numeric DEFAULT 0,
  oral_obtained numeric DEFAULT 0,
  practical_obtained numeric DEFAULT 0,
  total_obtained numeric GENERATED ALWAYS AS (COALESCE(written_obtained, 0) + COALESCE(oral_obtained, 0) + COALESCE(practical_obtained, 0)) STORED,

  is_absent boolean DEFAULT false,

  entered_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  entered_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(exam_subject_id, student_id)
);

CREATE TABLE IF NOT EXISTS results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  exam_id uuid NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,

  total_marks_obtained numeric NOT NULL DEFAULT 0,
  total_marks_max numeric NOT NULL DEFAULT 0,
  percentage numeric GENERATED ALWAYS AS (
    CASE WHEN total_marks_max > 0
    THEN ROUND((total_marks_obtained / total_marks_max * 100)::numeric, 2)
    ELSE 0 END
  ) STORED,

  grade text,
  remarks text,
  position int,

  is_pass boolean DEFAULT false,
  published_at timestamptz,
  published_by uuid REFERENCES profiles(id) ON DELETE SET NULL,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(student_id, exam_id)
);

-- ============================================================
-- FEE MANAGEMENT SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS fee_structures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  campus_id uuid REFERENCES campuses(id) ON DELETE SET NULL,

  name_en text NOT NULL,
  name_ur text,
  description text,

  -- Fee components (all in PKR)
  admission_fee numeric DEFAULT 0,
  monthly_tuition numeric DEFAULT 0,
  hostel_fee numeric DEFAULT 0,
  mess_fee numeric DEFAULT 0,
  transport_fee numeric DEFAULT 0,
  exam_fee numeric DEFAULT 0,
  library_fee numeric DEFAULT 0,
  sports_fee numeric DEFAULT 0,
  misc_fee numeric DEFAULT 0,

  applies_to_class_id uuid REFERENCES classes(id) ON DELETE SET NULL,
  applies_to_level_id uuid REFERENCES levels(id) ON DELETE SET NULL,

  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS student_fees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_structure_id uuid REFERENCES fee_structures(id) ON DELETE SET NULL,

  -- Custom amounts (override structure if needed)
  custom_monthly_fee numeric,
  discount_percentage numeric DEFAULT 0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  discount_amount numeric DEFAULT 0,
  scholarship_name text,

  concession_reason text,

  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(student_id)
);

CREATE TABLE IF NOT EXISTS fee_vouchers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  voucher_number text UNIQUE NOT NULL,
  month_year text NOT NULL, -- format: "2026-09"

  -- Fee breakdown
  base_amount numeric NOT NULL DEFAULT 0,
  discount_amount numeric DEFAULT 0,
  late_fee numeric DEFAULT 0,
  previous_balance numeric DEFAULT 0,

  total_amount numeric NOT NULL DEFAULT 0,

  due_date date NOT NULL,
  status text DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'cancelled', 'waived')),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS fee_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  voucher_id uuid NOT NULL REFERENCES fee_vouchers(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  receipt_number text UNIQUE NOT NULL,
  amount_paid numeric NOT NULL,
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'bank_transfer', 'online', 'cheque', 'other')),

  bank_name text,
  cheque_number text,
  transaction_ref text,
  notes text,

  collected_by uuid REFERENCES profiles(id) ON DELETE SET NULL,

  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- LMS & ASSIGNMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE SET NULL,
  class_id uuid REFERENCES classes(id) ON DELETE SET NULL,

  name_en text NOT NULL,
  name_ur text,
  description text,

  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,

  title_en text NOT NULL,
  title_ur text,
  content text,
  order_index int DEFAULT 0,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS study_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  lesson_id uuid REFERENCES lessons(id) ON DELETE CASCADE,
  course_id uuid REFERENCES courses(id) ON DELETE CASCADE,

  title_en text NOT NULL,
  title_ur text,
  description text,
  file_url text,
  file_type text CHECK (file_type IN ('pdf', 'video', 'image', 'document', 'link', 'other')),
  file_size_kb int,

  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,

  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id uuid REFERENCES subjects(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES classes(id) ON DELETE CASCADE,

  title_en text NOT NULL,
  title_ur text,
  description text,

  attachment_url text,

  assigned_date date DEFAULT CURRENT_DATE,
  due_date date NOT NULL,
  max_marks numeric DEFAULT 100,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assignment_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  submission_text text,
  attachment_url text,

  submitted_at timestamptz DEFAULT now(),
  is_late boolean DEFAULT false,

  marks_obtained numeric,
  feedback text,
  graded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  graded_at timestamptz,

  UNIQUE(assignment_id, student_id)
);

-- ============================================================
-- HOSTEL MANAGEMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS hostels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  campus_id uuid REFERENCES campuses(id) ON DELETE SET NULL,

  name_en text NOT NULL,
  name_ur text,
  address text,
  warden_name text,
  warden_phone text,

  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hostel_buildings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id uuid NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,

  name text NOT NULL,
  floors_count int DEFAULT 1,

  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hostel_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  building_id uuid NOT NULL REFERENCES hostel_buildings(id) ON DELETE CASCADE,
  hostel_id uuid NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,

  room_number text NOT NULL,
  floor_number int DEFAULT 1,
  capacity int NOT NULL DEFAULT 1,

  room_type text CHECK (room_type IN ('single', 'double', 'triple', 'dormitory')),

  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hostel_beds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES hostel_rooms(id) ON DELETE CASCADE,

  bed_number text NOT NULL,
  is_occupied boolean DEFAULT false,

  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS hostel_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  hostel_id uuid NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
  room_id uuid NOT NULL REFERENCES hostel_rooms(id) ON DELETE CASCADE,
  bed_id uuid REFERENCES hostel_beds(id) ON DELETE SET NULL,

  allocation_date date DEFAULT CURRENT_DATE,
  checkout_date date,

  status text DEFAULT 'active' CHECK (status IN ('active', 'transferred', 'checked_out', 'suspended')),

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- MESS MANAGEMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS mess_facilities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  hostel_id uuid REFERENCES hostels(id) ON DELETE SET NULL,

  name_en text NOT NULL,
  name_ur text,
  manager_name text,
  manager_phone text,

  monthly_charges numeric DEFAULT 0,

  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS mess_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  mess_id uuid NOT NULL REFERENCES mess_facilities(id) ON DELETE CASCADE,

  enrollment_date date DEFAULT CURRENT_DATE,
  end_date date,

  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'ended')),

  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- LEAVE MANAGEMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS leave_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,

  leave_type text NOT NULL CHECK (leave_type IN ('sick', 'casual', 'emergency', 'other')),
  from_date date NOT NULL,
  to_date date NOT NULL,
  total_days int GENERATED ALWAYS AS (to_date - from_date + 1) STORED,

  reason text NOT NULL,
  attachment_url text,

  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  review_notes text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- DISCIPLINE MANAGEMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS discipline_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  incident_date date NOT NULL DEFAULT CURRENT_DATE,
  incident_type text NOT NULL CHECK (incident_type IN ('behavioral', 'academic', 'attendance', 'violence', 'other')),

  description text NOT NULL,
  action_taken text,

  severity text CHECK (severity IN ('minor', 'moderate', 'major', 'critical')),

  warning_issued boolean DEFAULT false,
  fine_amount numeric DEFAULT 0,
  suspension_days int DEFAULT 0,

  reported_by uuid REFERENCES profiles(id) ON DELETE SET NULL,

  follow_up_required boolean DEFAULT false,
  follow_up_notes text,
  follow_up_date date,

  is_resolved boolean DEFAULT false,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE,
  recipient_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  notification_type text NOT NULL CHECK (notification_type IN (
    'assignment', 'fee_due', 'fee_paid', 'attendance_warning',
    'exam_announcement', 'result_published', 'leave_decision',
    'announcement', 'timetable_change', 'general'
  )),

  title_en text NOT NULL,
  title_ur text,
  message_en text NOT NULL,
  message_ur text,

  link_url text,

  is_read boolean DEFAULT false,
  read_at timestamptz,

  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- DOCUMENTS & CERTIFICATES
-- ============================================================

CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id uuid REFERENCES students(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,

  document_type text NOT NULL CHECK (document_type IN (
    'cnic', 'bform', 'photo', 'previous_certificate',
    'medical', 'admission_form', 'other'
  )),

  document_name text NOT NULL,
  file_url text NOT NULL,
  file_size_kb int,
  mime_type text,

  uploaded_by uuid REFERENCES profiles(id) ON DELETE SET NULL,

  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS certificates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,

  certificate_type text NOT NULL CHECK (certificate_type IN (
    'character', 'transfer', 'completion', 'admission',
    'achievement', 'participation', 'other'
  )),

  certificate_number text UNIQUE NOT NULL,

  issued_date date DEFAULT CURRENT_DATE,
  valid_until date,

  title_en text NOT NULL,
  title_ur text,
  content_en text,
  content_ur text,

  file_url text,
  qr_code_data text,

  issued_by uuid REFERENCES profiles(id) ON DELETE SET NULL,

  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- SUBSCRIPTION & PLAN MANAGEMENT
-- ============================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  name text UNIQUE NOT NULL,
  description text,

  -- Limits
  max_students int,
  max_teachers int,
  max_campuses int,
  storage_limit_gb int,

  -- Features
  features jsonb DEFAULT '{}',

  -- Pricing (PKR per month)
  price_monthly numeric DEFAULT 0,

  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES subscription_plans(id) ON DELETE SET NULL,

  status text DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'expiring', 'expired', 'suspended', 'cancelled')),

  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,

  -- Custom limits (override plan)
  custom_max_students int,
  custom_max_teachers int,
  custom_max_campuses int,

  notes text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================
-- PERMISSIONS SYSTEM
-- ============================================================

CREATE TABLE IF NOT EXISTS permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  permission_key text UNIQUE NOT NULL,
  module text NOT NULL,
  action text NOT NULL,
  description text,

  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  role text NOT NULL,
  permission_id uuid NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,

  granted boolean DEFAULT true,

  created_at timestamptz DEFAULT now(),

  UNIQUE(role, permission_id)
);

-- Bring legacy tables created by earlier migrations up to this tenant-aware schema.
-- CREATE TABLE IF NOT EXISTS does not add columns to tables that already exist.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE public.teachers
  ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE public.exams
  ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE public.results
  ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE public.assignments
  ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES public.teachers(id) ON DELETE CASCADE;

ALTER TABLE public.leave_requests
  ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE public.leave_requests
  ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES public.teachers(id) ON DELETE CASCADE;

ALTER TABLE public.fee_structures
  ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE public.fee_vouchers
  ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES public.institutions(id) ON DELETE CASCADE;

ALTER TABLE public.documents
  ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES public.teachers(id) ON DELETE SET NULL;

-- Preserve tenant visibility for existing rows when their related records identify it.
UPDATE public.assignments AS a
SET institution_id = COALESCE(
  (SELECT c.institution_id FROM public.classes AS c WHERE c.id = a.class_id),
  (SELECT t.institution_id FROM public.teachers AS t WHERE t.id = a.teacher_id)
)
WHERE a.institution_id IS NULL;

UPDATE public.leave_requests AS lr
SET institution_id = COALESCE(
  (SELECT s.institution_id FROM public.students AS s WHERE s.id = lr.student_id),
  (SELECT p.institution_id FROM public.profiles AS p WHERE p.id = lr.requested_by)
)
WHERE lr.institution_id IS NULL;

UPDATE public.exams AS e
SET institution_id = s.institution_id
FROM public.sessions AS s
WHERE e.institution_id IS NULL
  AND e.session_id = s.id
  AND s.institution_id IS NOT NULL;

UPDATE public.results AS r
SET institution_id = s.institution_id
FROM public.students AS s
WHERE r.institution_id IS NULL
  AND r.student_id = s.id
  AND s.institution_id IS NOT NULL;

UPDATE public.fee_vouchers AS fv
SET institution_id = s.institution_id
FROM public.students AS s
WHERE fv.institution_id IS NULL
  AND fv.student_id = s.id
  AND s.institution_id IS NOT NULL;

UPDATE public.documents AS d
SET institution_id = s.institution_id
FROM public.students AS s
WHERE d.institution_id IS NULL
  AND d.student_id = s.id
  AND s.institution_id IS NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'fee_structures' AND column_name = 'class_id'
  ) THEN
    UPDATE public.fee_structures AS fs
    SET institution_id = c.institution_id
    FROM public.classes AS c
    WHERE fs.institution_id IS NULL
      AND fs.class_id = c.id
      AND c.institution_id IS NOT NULL;
  ELSIF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'fee_structures' AND column_name = 'applies_to_class_id'
  ) THEN
    UPDATE public.fee_structures AS fs
    SET institution_id = c.institution_id
    FROM public.classes AS c
    WHERE fs.institution_id IS NULL
      AND fs.applies_to_class_id = c.id
      AND c.institution_id IS NOT NULL;
  END IF;
END $$;

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================

-- Exams
CREATE INDEX IF NOT EXISTS idx_exams_institution ON exams(institution_id);
CREATE INDEX IF NOT EXISTS idx_exams_session ON exams(session_id);
CREATE INDEX IF NOT EXISTS idx_exam_subjects_exam ON exam_subjects(exam_id);
CREATE INDEX IF NOT EXISTS idx_marks_student ON marks(student_id);
CREATE INDEX IF NOT EXISTS idx_results_student ON results(student_id);
CREATE INDEX IF NOT EXISTS idx_results_exam ON results(exam_id);

-- Fees
CREATE INDEX IF NOT EXISTS idx_fee_structures_institution ON fee_structures(institution_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_student ON student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_vouchers_student ON fee_vouchers(student_id);
CREATE INDEX IF NOT EXISTS idx_fee_vouchers_status ON fee_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_fee_payments_voucher ON fee_payments(voucher_id);

-- Assignments
CREATE INDEX IF NOT EXISTS idx_assignments_class ON assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_assignments_teacher ON assignments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student ON assignment_submissions(student_id);

-- Hostel
CREATE INDEX IF NOT EXISTS idx_hostel_allocations_student ON hostel_allocations(student_id);
CREATE INDEX IF NOT EXISTS idx_hostel_allocations_status ON hostel_allocations(status);

-- Notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Documents
CREATE INDEX IF NOT EXISTS idx_documents_student ON documents(student_id);
CREATE INDEX IF NOT EXISTS idx_documents_teacher ON documents(teacher_id);

-- Leave
CREATE INDEX IF NOT EXISTS idx_leave_requests_student ON leave_requests(student_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all new tables
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN (
      'exams', 'exam_subjects', 'marks', 'results',
      'fee_structures', 'student_fees', 'fee_vouchers', 'fee_payments',
      'courses', 'lessons', 'study_materials', 'assignments', 'assignment_submissions',
      'hostels', 'hostel_buildings', 'hostel_rooms', 'hostel_beds', 'hostel_allocations',
      'mess_facilities', 'mess_enrollments',
      'leave_requests', 'discipline_records',
      'notifications', 'documents', 'certificates',
      'subscription_plans', 'subscriptions',
      'permissions', 'role_permissions'
    )
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
  END LOOP;
END $$;

-- Tenant isolation policies for main tables
CREATE POLICY "exams_tenant" ON exams FOR ALL USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "marks_tenant" ON marks FOR ALL USING (
  EXISTS (
    SELECT 1 FROM exam_subjects es
    JOIN exams e ON es.exam_id = e.id
    WHERE es.id = marks.exam_subject_id
    AND (e.institution_id = public.user_institution_id() OR
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin'))
  )
);

CREATE POLICY "results_tenant" ON results FOR ALL USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "fee_structures_tenant" ON fee_structures FOR ALL USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "fee_vouchers_tenant" ON fee_vouchers FOR ALL USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "assignments_tenant" ON assignments FOR ALL USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "hostels_tenant" ON hostels FOR ALL USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "leave_requests_tenant" ON leave_requests FOR ALL USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "discipline_records_tenant" ON discipline_records FOR ALL USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "notifications_user" ON notifications FOR SELECT USING (
  recipient_id = auth.uid()
);

CREATE POLICY "documents_tenant" ON documents FOR ALL USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

CREATE POLICY "certificates_tenant" ON certificates FOR ALL USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Super Admin can manage subscription plans
CREATE POLICY "subscription_plans_super_admin" ON subscription_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Institutions can view their own subscription
CREATE POLICY "subscriptions_view_own" ON subscriptions FOR SELECT USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Super Admin can manage all subscriptions
CREATE POLICY "subscriptions_super_admin" ON subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Permissions visible to all authenticated users
CREATE POLICY "permissions_view" ON permissions FOR SELECT USING (auth.uid() IS NOT NULL);

-- Role permissions visible to admins
CREATE POLICY "role_permissions_view" ON role_permissions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('super_admin', 'admin', 'nazim'))
);

-- ============================================================
-- SEED DEFAULT SUBSCRIPTION PLANS
-- ============================================================

INSERT INTO subscription_plans (name, description, max_students, max_teachers, max_campuses, storage_limit_gb, price_monthly)
VALUES
  ('Trial', 'Free trial plan for 30 days', 50, 10, 1, 5, 0),
  ('Basic', 'Basic plan for small institutions', 200, 30, 2, 20, 5000),
  ('Professional', 'Professional plan with advanced features', 500, 100, 5, 50, 15000),
  ('Enterprise', 'Unlimited plan for large institutions', NULL, NULL, NULL, NULL, 30000)
ON CONFLICT (name) DO NOTHING;

-- ============================================================
-- SEED DEFAULT PERMISSIONS
-- ============================================================

INSERT INTO permissions (permission_key, module, action, description)
VALUES
  ('students.view', 'students', 'view', 'View student information'),
  ('students.create', 'students', 'create', 'Create new students'),
  ('students.update', 'students', 'update', 'Update student information'),
  ('students.delete', 'students', 'delete', 'Delete students'),

  ('attendance.view', 'attendance', 'view', 'View attendance records'),
  ('attendance.mark', 'attendance', 'mark', 'Mark attendance'),

  ('results.view', 'results', 'view', 'View results'),
  ('results.enter', 'results', 'enter', 'Enter marks'),
  ('results.publish', 'results', 'publish', 'Publish results'),

  ('fees.view', 'fees', 'view', 'View fee records'),
  ('fees.create', 'fees', 'create', 'Create fee structures'),
  ('fees.collect', 'fees', 'collect', 'Collect fee payments'),

  ('hostel.manage', 'hostel', 'manage', 'Manage hostel operations'),
  ('leave.approve', 'leave', 'approve', 'Approve leave requests'),
  ('discipline.manage', 'discipline', 'manage', 'Manage discipline records')
ON CONFLICT (permission_key) DO NOTHING;

-- ============================================================
-- UPDATE TIMESTAMPS TRIGGERS
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT table_name FROM information_schema.columns
    WHERE table_schema = 'public'
    AND column_name = 'updated_at'
  LOOP
    EXECUTE format('
      DROP TRIGGER IF EXISTS update_%I_updated_at ON %I;
      CREATE TRIGGER update_%I_updated_at
      BEFORE UPDATE ON %I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
    ', t, t, t, t);
  END LOOP;
END $$;

-- ============================================================
-- MIGRATION COMPLETE
-- ============================================================
