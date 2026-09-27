-- ============================================================
-- Migration 015: Multi-Tenant Foundation (Institutions & Campuses)
-- ============================================================

-- 1. Create Institutions Table
CREATE TABLE IF NOT EXISTS institutions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  urdu_name text,
  logo_url text,
  domain text UNIQUE,
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'trial')),
  plan_id text,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create Campuses Table
CREATE TABLE IF NOT EXISTS campuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid NOT NULL REFERENCES institutions(id) ON DELETE CASCADE,
  name text NOT NULL,
  address text,
  contact_number text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Add institution_id to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE;

-- Create a default institution for existing data
DO $$
DECLARE
  default_inst_id uuid;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM institutions LIMIT 1) THEN
    INSERT INTO institutions (name, urdu_name, status) 
    VALUES ('Default Jamia', 'جامعہ ڈیفالٹ', 'active')
    RETURNING id INTO default_inst_id;
    
    -- Assign all existing profiles to this default institution
    UPDATE profiles SET institution_id = default_inst_id WHERE institution_id IS NULL;
  END IF;
END $$;

-- Make institution_id NOT NULL for profiles (Optional, but good for strict isolation. Skipping NOT NULL for super admins).
-- Super admins might not belong to a specific institution.

-- 4. Add institution_id to core tables
DO $$ 
DECLARE 
  t text; 
BEGIN
  FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
    'sessions', 'classes', 'subjects', 'students', 'teachers', 'attendance', 'exams', 'results', 'announcements'
  )
  LOOP
    EXECUTE format('ALTER TABLE %I ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE;', t);
  END LOOP;
END $$;

-- Assign default institution to existing records
DO $$
DECLARE
  default_inst_id uuid;
  t text;
BEGIN
  SELECT id INTO default_inst_id FROM institutions LIMIT 1;
  IF default_inst_id IS NOT NULL THEN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN (
      'sessions', 'classes', 'subjects', 'students', 'teachers', 'attendance', 'exams', 'results', 'announcements'
    )
    LOOP
      EXECUTE format('UPDATE %I SET institution_id = %L WHERE institution_id IS NULL;', t, default_inst_id);
    END LOOP;
  END IF;
END $$;

-- 5. Helper function for RLS: get user's institution
CREATE OR REPLACE FUNCTION public.user_institution_id() RETURNS uuid AS $$
  SELECT institution_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 6. Enable RLS on institutions and campuses
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE campuses ENABLE ROW LEVEL SECURITY;

-- Super Admins can see all institutions. Jamia Admins can see their own.
DROP POLICY IF EXISTS "institutions_super_admin_all" ON institutions;
CREATE POLICY "institutions_super_admin_all" ON institutions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

DROP POLICY IF EXISTS "institutions_view_own" ON institutions;
CREATE POLICY "institutions_view_own" ON institutions
  FOR SELECT USING (
    id = public.user_institution_id()
  );

-- Campuses
DROP POLICY IF EXISTS "campuses_super_admin_all" ON campuses;
CREATE POLICY "campuses_super_admin_all" ON campuses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

DROP POLICY IF EXISTS "campuses_view_own" ON campuses;
CREATE POLICY "campuses_view_own" ON campuses
  FOR ALL USING (
    institution_id = public.user_institution_id()
  );

-- 7. Update core tables to enforce tenant isolation
-- (Example for students table)
DROP POLICY IF EXISTS "tenant_isolation_students" ON students;
CREATE POLICY "tenant_isolation_students" ON students
  FOR ALL USING (
    institution_id = public.user_institution_id() OR 
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

-- Note: In a complete migration, similar policies must replace or augment existing policies for ALL tables.
