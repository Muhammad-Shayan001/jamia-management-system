-- ============================================================
-- Migration 018: Timetable and Teacher Multi-tenant Fixes
-- ============================================================

-- Add institution_id to timetable
ALTER TABLE timetable ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE;

-- Add institution_id to class_teachers (if it exists)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'class_teachers') THEN
        ALTER TABLE class_teachers ADD COLUMN IF NOT EXISTS institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update RLS for timetable
ALTER TABLE timetable ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "timetable_tenant" ON timetable;
CREATE POLICY "timetable_tenant" ON timetable FOR ALL USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);

-- Update RLS for class_teachers
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'class_teachers') THEN
        ALTER TABLE class_teachers ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "class_teachers_tenant" ON class_teachers;
        EXECUTE 'CREATE POLICY "class_teachers_tenant" ON class_teachers FOR ALL USING (
          institution_id = public.user_institution_id() OR
          EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''super_admin'')
        )';
    END IF;
END $$;
