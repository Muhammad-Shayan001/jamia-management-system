-- ============================================================
-- Migration 016: Dars-e-Nizami Academic Structure
-- ============================================================

-- Add programs table (Dars-e-Nizami, Hifz, Nazira, etc.)
CREATE TABLE IF NOT EXISTS programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE,
  name_en text NOT NULL,
  name_ur text,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Add levels/daraja table
CREATE TABLE IF NOT EXISTS levels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id uuid REFERENCES programs(id) ON DELETE CASCADE,
  institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE,
  name_en text NOT NULL,
  name_ur text,
  order_index int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Add level_id to classes (links class to a daraja)
ALTER TABLE classes ADD COLUMN IF NOT EXISTS level_id uuid REFERENCES levels(id) ON DELETE SET NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS campus_id uuid REFERENCES campuses(id) ON DELETE SET NULL;
ALTER TABLE classes ADD COLUMN IF NOT EXISTS section text DEFAULT 'A';
ALTER TABLE classes ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE;

-- Add extra metadata to subjects
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS code text;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS subject_type text DEFAULT 'kitab'
  CHECK (subject_type IN ('kitab','subject','practical','oral','memorization','assignment'));
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS max_marks numeric DEFAULT 100;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS passing_marks numeric DEFAULT 40;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS exam_weight numeric DEFAULT 1.0;
ALTER TABLE subjects ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE;

-- Add institution_id to sessions if not present
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE;

-- Add sections table (one class can have multiple sections)
CREATE TABLE IF NOT EXISTS sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id uuid REFERENCES classes(id) ON DELETE CASCADE,
  institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE,
  name text NOT NULL DEFAULT 'A',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "programs_tenant" ON programs;
CREATE POLICY "programs_tenant" ON programs FOR ALL USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "levels_tenant" ON levels;
CREATE POLICY "levels_tenant" ON levels FOR ALL USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sections_tenant" ON sections;
CREATE POLICY "sections_tenant" ON sections FOR ALL USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);
