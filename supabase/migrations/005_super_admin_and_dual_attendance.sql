-- ============================================================
-- Migration 005: Super Admin Enforcement & Dual Attendance System
-- ============================================================

-- 1. Update profiles role constraint to support 'super_admin' and 'nazim'
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('super_admin', 'admin', 'nazim', 'teacher', 'student', 'parent'));

-- 2. Enforce exactly ONE Super Admin in Database
CREATE OR REPLACE FUNCTION enforce_single_super_admin()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.role = 'super_admin' THEN
    IF (SELECT COUNT(*) FROM profiles WHERE role = 'super_admin' AND id != NEW.id) > 0 THEN
      RAISE EXCEPTION 'Only one Super Admin account is permitted.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_single_super_admin ON profiles;
CREATE TRIGGER trg_single_super_admin
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION enforce_single_super_admin();

-- 3. RLS for Super Admin Full Access
DROP POLICY IF EXISTS "super_admin_full_access" ON profiles;
CREATE POLICY "super_admin_full_access" ON profiles
  FOR ALL USING (
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin'
  );

-- 4. Audit Log Table for Super Admin Tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  actor_email TEXT,
  actor_role TEXT,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Institution Settings Table
CREATE TABLE IF NOT EXISTS institution_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_name_en TEXT NOT NULL DEFAULT 'Jamia Darul Uloom',
  institution_name_ur TEXT NOT NULL DEFAULT 'جامعہ دار العلوم',
  logo_url TEXT,
  address_en TEXT,
  address_ur TEXT,
  phone TEXT,
  email TEXT,
  academic_year TEXT DEFAULT '2025-2026',
  branding_colors JSONB DEFAULT '{"primary": "#0B1D36", "accent": "#C7A23C"}'::jsonb,
  whatsapp_sender_number TEXT,
  resend_sender_email TEXT,
  cutoff_time TIME DEFAULT '09:00:00',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default settings if none exist
INSERT INTO institution_settings (institution_name_en, institution_name_ur, academic_year)
VALUES ('Jamia Darul Uloom', 'جامعہ دار العلوم', '2025-2026')
ON CONFLICT DO NOTHING;

-- 6. Enhance Attendance for Dual System (Teachers vs Students)
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id);
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS role TEXT CHECK (role IN ('student', 'teacher'));
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS gate TEXT;
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS check_in_time TIMESTAMPTZ DEFAULT now();

-- Update scan_method check to support dual system
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_scan_method_check;
ALTER TABLE attendance ADD CONSTRAINT attendance_scan_method_check 
  CHECK (scan_method IN ('qr_self', 'qr_scanned_by_teacher', 'manual', 'auto_absent', 'qr'));

-- Update status check to include 'leave'
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS attendance_status_check;
ALTER TABLE attendance ADD CONSTRAINT attendance_status_check 
  CHECK (status IN ('present', 'absent', 'late', 'excused', 'leave'));

-- 7. Holidays / Off Days table for Auto-Absent Cron
CREATE TABLE IF NOT EXISTS institution_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_recurring_weekly BOOLEAN DEFAULT false, -- e.g. Fridays off
  day_of_week INT, -- 5 for Friday
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Insert Friday weekly holiday by default
INSERT INTO institution_holidays (title, start_date, end_date, is_recurring_weekly, day_of_week)
VALUES ('Friday Off (جمعۃ المبارک)', '2025-01-01', '2030-12-31', true, 5)
ON CONFLICT DO NOTHING;
