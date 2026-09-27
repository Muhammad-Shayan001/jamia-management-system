-- ============================================================
-- Migration 019: Dual Attendance and Multi-tenancy
-- ============================================================

-- Add institution_id to student attendance
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE;

-- Create teacher_attendance table
CREATE TABLE IF NOT EXISTS teacher_attendance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE,
  teacher_id uuid REFERENCES teachers(id) ON DELETE CASCADE,
  date date NOT NULL,
  check_in_time time,
  check_out_time time,
  status text NOT NULL CHECK (status IN ('present','absent','late','excused')),
  scan_method text CHECK (scan_method IN ('kiosk_qr','manual')),
  marked_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(teacher_id, date)
);

-- RLS for student attendance
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "attendance_tenant" ON attendance;
CREATE POLICY "attendance_tenant" ON attendance FOR ALL USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- RLS for teacher_attendance
ALTER TABLE teacher_attendance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "teacher_attendance_tenant" ON teacher_attendance;
CREATE POLICY "teacher_attendance_tenant" ON teacher_attendance FOR ALL USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);
