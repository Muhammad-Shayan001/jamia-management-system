import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AttendanceAnalytics } from './AttendanceAnalytics'

export default async function AdminAttendancePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const supabase = await createClient()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) redirect(`/${lang}/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('institution_id')
    .eq('id', user.user.id)
    .single()

  if (!profile?.institution_id) {
    return <div className="p-8 text-center text-red-500">No institution assigned.</div>
  }

  // Fetch student attendance
  const { data: studentAttendance } = await supabase
    .from('attendance')
    .select(`
      *,
      students ( name_en, name_ur, admission_number ),
      classes ( name_en, name_ur )
    `)
    .eq('institution_id', profile.institution_id)
    .order('date', { ascending: false })
    .limit(50)

  // Fetch teacher attendance
  const { data: teacherAttendance } = await supabase
    .from('teacher_attendance')
    .select(`
      *,
      teachers ( name_en, name_ur, employee_number )
    `)
    .eq('institution_id', profile.institution_id)
    .order('date', { ascending: false })
    .limit(50)

  // Fetch active teachers for manual attendance marking
  const { data: activeTeachers } = await supabase
    .from('teachers')
    .select('*')
    .eq('institution_id', profile.institution_id)
    .eq('is_active', true)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dual Attendance Center</h2>
        <p className="text-muted-foreground text-sm">Monitor Kiosk Teacher Attendance & Classroom Student Attendance.</p>
      </div>

      <AttendanceAnalytics 
        studentRecords={studentAttendance || []} 
        teacherRecords={teacherAttendance || []}
        activeTeachers={activeTeachers || []}
        institutionId={profile.institution_id}
        lang={lang} 
      />
    </div>
  )
}
