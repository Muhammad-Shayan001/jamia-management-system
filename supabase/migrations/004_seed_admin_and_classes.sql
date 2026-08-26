-- ============================================================
-- RUN THIS IN SUPABASE SQL EDITOR (one-click seed after schema)
-- https://supabase.com/dashboard/project/oddtpnfzysruomqhhpmu/sql/new
-- ============================================================

-- Re-insert admin profile (auth user was already created via script)
-- Replace the UUID below with the actual user ID printed by the migration script
-- admin user ID: 3e6cb315-2a03-4d86-8516-5dc1d21cc911

INSERT INTO profiles (id, role, full_name_en, full_name_ur, is_active, totp_enabled)
VALUES (
  '3e6cb315-2a03-4d86-8516-5dc1d21cc911',
  'admin',
  'System Admin',
  'سسٹم ایڈمن',
  true,
  false
) ON CONFLICT (id) DO NOTHING;

-- Seed initial academic session
INSERT INTO sessions (name, start_date, end_date, is_current)
VALUES ('2025-2026', '2025-04-01', '2026-03-31', true)
ON CONFLICT DO NOTHING;

-- Seed classes for the current session
DO $$
DECLARE
  session_id uuid;
BEGIN
  SELECT id INTO session_id FROM sessions WHERE is_current = true LIMIT 1;
  
  INSERT INTO classes (name_en, name_ur, level, session_id) VALUES
    ('Ibtidai Awwal', 'ابتدائی اول', 1, session_id),
    ('Ibtidai Doum', 'ابتدائی دوم', 2, session_id),
    ('Ibtidai Soum', 'ابتدائی سوم', 3, session_id),
    ('Mutawassit Awwal', 'متوسط اول', 4, session_id),
    ('Mutawassit Doum', 'متوسط دوم', 5, session_id)
  ON CONFLICT DO NOTHING;
END $$;
