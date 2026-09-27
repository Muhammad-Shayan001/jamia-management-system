import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StudentsClient from './StudentsClient'

export default async function StudentsPage({ params }: { params: Promise<{ lang: string }> }) {
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

  // Fetch students
  const { data: students } = await supabase
    .from('students')
    .select(`
      *,
      classes ( name_en, name_ur, level )
    `)
    .eq('institution_id', profile.institution_id)
    .order('created_at', { ascending: false })

  // Fetch classes for assignment dropdown
  const { data: classes } = await supabase
    .from('classes')
    .select('id, name_en, name_ur, level')
    .eq('institution_id', profile.institution_id)
    .order('level', { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Student Management</h2>
        <p className="text-muted-foreground text-sm">Manage enrolled students and assign them to classes/Darajas.</p>
      </div>
      <StudentsClient 
        initialData={students || []} 
        classes={classes || []} 
        institutionId={profile.institution_id} 
        lang={lang} 
      />
    </div>
  )
}
