-- ============================================================
-- Migration 006: Fix RLS and Super Admin
-- ============================================================

-- Fix is_admin() helper to include super_admin and nazim so they can access data
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('admin', 'nazim', 'super_admin'));
$$;

-- Add missing RLS policy for audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_super_admin" ON audit_logs FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin');

-- Add missing RLS policies for institution_settings
ALTER TABLE institution_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings_super_admin_all" ON institution_settings FOR ALL
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'super_admin');
CREATE POLICY "settings_read_authenticated" ON institution_settings FOR SELECT
  USING (auth.uid() IS NOT NULL);
