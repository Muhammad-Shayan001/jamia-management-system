-- ============================================================
-- Migration 013: Fix infinite recursion in is_admin
-- ============================================================

-- The previous implementation of is_admin() queried the profiles
-- table, which itself used is_admin() in its RLS policies.
-- This caused an infinite recursion error.
-- We fix this by reading the role directly from the JWT.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT coalesce((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'nazim', 'super_admin'), false);
$$;

CREATE OR REPLACE FUNCTION public.is_accountant()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT coalesce((auth.jwt() -> 'user_metadata' ->> 'role') IN ('accountant', 'admin', 'nazim', 'super_admin'), false);
$$;

CREATE OR REPLACE FUNCTION public.is_receptionist()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT coalesce((auth.jwt() -> 'user_metadata' ->> 'role') IN ('receptionist', 'admin', 'nazim', 'super_admin'), false);
$$;
