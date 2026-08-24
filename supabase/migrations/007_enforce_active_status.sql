-- Migration 007: Enforce is_active globally in RLS helpers

CREATE OR REPLACE FUNCTION auth_role()
RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT role FROM profiles WHERE id = auth.uid() AND is_active = true;
$$;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
      AND role IN ('admin', 'nazim', 'super_admin') 
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION my_teacher_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT t.id FROM teachers t
  JOIN profiles p ON p.id = t.profile_id
  WHERE t.profile_id = auth.uid() AND p.is_active = true
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION my_student_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT s.id FROM students s
  JOIN profiles p ON p.id = s.profile_id
  WHERE s.profile_id = auth.uid() AND p.is_active = true
  LIMIT 1;
$$;
