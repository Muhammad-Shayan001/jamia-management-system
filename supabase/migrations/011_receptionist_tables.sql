-- Migration 011: Receptionist Tables

-- 1. Visitors Log
CREATE TABLE public.visitors (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  phone text,
  purpose text,
  meeting_with uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  check_in_time timestamptz NOT NULL DEFAULT now(),
  check_out_time timestamptz,
  logged_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Receptionist full access visitors" ON visitors FOR ALL TO authenticated USING (is_receptionist()) WITH CHECK (is_receptionist());


-- 2. Admission Inquiries
CREATE TABLE public.admission_inquiries (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  guardian_name text NOT NULL,
  phone text,
  email text,
  intended_class_id uuid REFERENCES public.classes(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'closed')),
  notes text,
  follow_up_date date,
  logged_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.admission_inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Receptionist full access admission_inquiries" ON admission_inquiries FOR ALL TO authenticated USING (is_receptionist()) WITH CHECK (is_receptionist());


-- 3. Appointments
CREATE TABLE public.appointments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  requested_by text NOT NULL,
  meeting_with uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  appointment_date timestamptz NOT NULL,
  purpose text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
-- Receptionist can manage all appointments
CREATE POLICY "Receptionist full access appointments" ON appointments FOR ALL TO authenticated USING (is_receptionist()) WITH CHECK (is_receptionist());
-- Staff (meeting_with) can view their own appointments
CREATE POLICY "Staff can view own appointments" ON appointments FOR SELECT TO authenticated USING (meeting_with = auth.uid());
