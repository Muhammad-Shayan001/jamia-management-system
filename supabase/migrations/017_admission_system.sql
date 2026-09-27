CREATE TABLE IF NOT EXISTS admissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id uuid REFERENCES institutions(id) ON DELETE CASCADE,
  campus_id uuid REFERENCES campuses(id) ON DELETE SET NULL,
  session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  program_id uuid REFERENCES programs(id) ON DELETE SET NULL,
  level_id uuid REFERENCES levels(id) ON DELETE SET NULL,
  
  -- Student Info
  application_number text UNIQUE NOT NULL,
  student_name_en text NOT NULL,
  student_name_ur text,
  dob date,
  gender text,
  cnic_or_bform text,
  previous_institution text,
  nazra_status text,
  hifz_status text,
  
  -- Guardian Info
  father_name_en text NOT NULL,
  father_name_ur text,
  guardian_phone text,
  guardian_email text,
  address text,
  
  -- Workflow
  status text DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'under_review', 'interview', 'approved', 'rejected', 'enrolled', 'cancelled')),
  rejection_reason text,
  interview_notes text,
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE admissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admissions_tenant" ON admissions FOR ALL USING (
  institution_id = public.user_institution_id() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'super_admin')
);
