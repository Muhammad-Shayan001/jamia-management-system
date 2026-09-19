'use server'

import { createClient } from '../supabase/server'

export async function getStudentsForExport() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('students')
    .select(`
      admission_number,
      name_en,
      name_ur,
      father_name_en,
      guardian_phone,
      guardian_email,
      classes(name_en)
    `)
  
  if (error) throw new Error(error.message)
  return data.map((s: any) => ({
    AdmissionNo: s.admission_number,
    Name_EN: s.name_en,
    Name_UR: s.name_ur,
    FatherName: s.father_name_en,
    Phone: s.guardian_phone,
    Email: s.guardian_email,
    Class: s.classes?.name_en || 'N/A'
  }))
}

export async function getTeachersForExport() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('teachers')
    .select(`
      employee_number,
      name_en,
      name_ur
    `)
  
  if (error) throw new Error(error.message)
  return data.map((t: any) => ({
    EmployeeNo: t.employee_number,
    Name_EN: t.name_en,
    Name_UR: t.name_ur
  }))
}
