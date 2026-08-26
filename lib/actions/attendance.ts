'use server'

import { createClient } from '@/lib/supabase/server'

export interface MarkAttendanceParams {
  userId: string
  role: 'student' | 'teacher'
  classId?: string
  gate?: string
  status?: 'present' | 'absent' | 'late' | 'leave'
}

export async function markAttendance(params: MarkAttendanceParams) {
  const supabase = await createClient()

  // Get current authenticated user
  const {
    data: { user: caller },
  } = await supabase.auth.getUser()

  if (!caller) {
    return { error: 'Not authenticated. Please log in.' }
  }

  // Check if caller is super admin by email
  const superAdminEmail = (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'admin@jamia.edu').toLowerCase()
  const isSuperAdminEmail = caller.email?.toLowerCase() === superAdminEmail

  // Fetch caller profile
  const { data: callerProfile } = await (supabase
    .from('profiles')
    .select('id, role')
    .eq('id', caller.id)
    .single()) as any

  const callerRole = isSuperAdminEmail ? 'super_admin' : callerProfile?.role || 'student'

  const today = new Date().toISOString().split('T')[0]
  const status = params.status || 'present'

  // RULE 4: A STUDENT NEVER SELF-MARKS. BLOCK OUTRIGHT.
  if (callerRole === 'student') {
    return { error: 'Students cannot self-mark attendance. Please have your Ustad scan your card.' }
  }

  // RULE 1: Teacher marking a STUDENT via QR scan
  if (callerRole === 'teacher' && params.role === 'student') {
    const { error } = await (supabase.from('attendance') as any).upsert({
      user_id: params.userId,
      student_id: params.userId,
      role: 'student',
      date: today,
      status: status,
      marked_by: caller.id,
      scan_method: 'qr_scanned_by_teacher',
      gate: params.gate || 'Classroom Door',
      class_id: params.classId,
      check_in_time: new Date().toISOString(),
    })

    if (error) return { error: error.message }
    return { success: true, method: 'qr_scanned_by_teacher' }
  }

  // RULE 2: Teacher marking THEMSELF (self-scan at staff gate only)
  if (callerRole === 'teacher' && params.role === 'teacher' && caller.id === params.userId) {
    const { error } = await (supabase.from('attendance') as any).upsert({
      user_id: caller.id,
      role: 'teacher',
      date: today,
      status: status,
      marked_by: caller.id,
      scan_method: 'qr_self',
      gate: params.gate || 'Staff Gate Kiosk',
      check_in_time: new Date().toISOString(),
    })

    if (error) return { error: error.message }
    return { success: true, method: 'qr_self' }
  }

  // RULE 3: Nazim / Super Admin marking ANY teacher (manual override, late arrival, approved leave)
  if (['nazim', 'admin', 'super_admin'].includes(callerRole) && params.role === 'teacher') {
    const { error } = await (supabase.from('attendance') as any).upsert({
      user_id: params.userId,
      role: 'teacher',
      date: today,
      status: status,
      marked_by: caller.id,
      scan_method: 'manual',
      gate: params.gate || 'Admin Office',
      check_in_time: new Date().toISOString(),
    })

    if (error) return { error: error.message }
    return { success: true, method: 'manual' }
  }

  // Rule 5: Nazim / Super Admin marking a student manually
  if (['nazim', 'admin', 'super_admin'].includes(callerRole) && params.role === 'student') {
    const { error } = await (supabase.from('attendance') as any).upsert({
      user_id: params.userId,
      student_id: params.userId,
      role: 'student',
      date: today,
      status: status,
      marked_by: caller.id,
      scan_method: 'manual',
      gate: params.gate || 'Admin Office',
      class_id: params.classId,
      check_in_time: new Date().toISOString(),
    })

    if (error) return { error: error.message }
    return { success: true, method: 'manual' }
  }

  return { error: 'Unauthorized attendance action.' }
}
