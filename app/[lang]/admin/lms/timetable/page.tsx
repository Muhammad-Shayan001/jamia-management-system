import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminTimetableManager from './AdminTimetableManager'

export default async function AdminTimetablePage({ params }: { params: Promise<{ lang: string }> }) {
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

  // Fetch all required data for timetable
  const [classesRes, subjectsRes, teachersRes, timetableRes] = await Promise.all([
    supabase.from('classes').select('*').eq('institution_id', profile.institution_id).order('level'),
    supabase.from('subjects').select('*').eq('institution_id', profile.institution_id),
    supabase.from('teachers').select('*').eq('institution_id', profile.institution_id),
    supabase.from('timetable').select('*').eq('institution_id', profile.institution_id)
  ])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Dynamic Timetable System</h2>
        <p className="text-muted-foreground text-sm">Schedule Kutub (Subjects) and Asatiza (Teachers) across Darajas.</p>
      </div>
      <AdminTimetableManager 
        classes={classesRes.data || []}
        subjects={subjectsRes.data || []}
        teachers={teachersRes.data || []}
        initialTimetable={timetableRes.data || []}
        institutionId={profile.institution_id}
        lang={lang} 
      />
    </div>
  )
}
