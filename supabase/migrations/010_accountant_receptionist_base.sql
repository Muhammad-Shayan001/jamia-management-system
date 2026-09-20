-- Migration 010: Accountant & Receptionist Base (Helper Functions & RLS)

-- 1. Helper Functions (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.is_accountant()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND (role = 'accountant' OR role = 'admin' OR role = 'super_admin' OR role = 'nazim')
    AND is_active = true
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.is_receptionist()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() 
    AND (role = 'receptionist' OR role = 'admin' OR role = 'super_admin' OR role = 'nazim')
    AND is_active = true
  );
END;
$$;

-- Note: The existing is_admin() helper already includes admin/super_admin/nazim.
-- For the accountant/receptionist specific policies below, we use the specific helpers.
-- However, we should be careful: the helpers above ALREADY include admin/super_admin/nazim,
-- which means granting to is_accountant() implicitly grants to those roles as well,
-- which aligns perfectly with the requirement "nazim/admin/super_admin must be able to see and, where sensible, override everything Accountant and Receptionist can do".

-- 2. Update existing policies for Accountant

-- fee_structures
CREATE POLICY "Accountant full access fee_structures" 
ON fee_structures FOR ALL 
TO authenticated 
USING (is_accountant()) 
WITH CHECK (is_accountant());

-- fee_vouchers
CREATE POLICY "Accountant full access fee_vouchers" 
ON fee_vouchers FOR ALL 
TO authenticated 
USING (is_accountant()) 
WITH CHECK (is_accountant());

-- donations
CREATE POLICY "Accountant full access donations" 
ON donations FOR ALL 
TO authenticated 
USING (is_accountant()) 
WITH CHECK (is_accountant());

-- expenses
CREATE POLICY "Accountant full access expenses" 
ON expenses FOR ALL 
TO authenticated 
USING (is_accountant()) 
WITH CHECK (is_accountant());

-- 3. Update existing policies for Receptionist

-- documents
CREATE POLICY "Receptionist full access documents" 
ON documents FOR ALL 
TO authenticated 
USING (is_receptionist()) 
WITH CHECK (is_receptionist());
