import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AcademicClient } from './AcademicClient'

export default async function AcademicPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const supabase = await createClient()

  // Auth check
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  // Get institution_id from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name_en')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect(`/${lang}/login`)
  }

  // Get institution membership
  const { data: membership } = await supabase
    .from('institution_members')
    .select('institution_id')
    .eq('profile_id', user.id)
    .single()

  const institutionId = membership?.institution_id ?? null

  if (!institutionId) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <p className="text-destructive text-lg font-semibold">
          No institution linked to your account.
        </p>
        <p className="text-muted-foreground text-sm">
          Please contact your system administrator.
        </p>
      </div>
    )
  }

  // Parallel fetch all academic data
  const [
    programsRes,
    levelsRes,
    sessionsRes,
    classesRes,
    subjectsRes,
  ] = await Promise.all([
    supabase
      .from('programs')
      .select('*')
      .eq('institution_id', institutionId)
      .order('created_at', { ascending: true }),
    supabase
      .from('levels')
      .select('*')
      .eq('institution_id', institutionId)
      .order('order_index', { ascending: true }),
    supabase
      .from('sessions')
      .select('*')
      .eq('institution_id', institutionId)
      .order('created_at', { ascending: false }),
    supabase
      .from('classes')
      .select('*')
      .eq('institution_id', institutionId)
      .order('level', { ascending: true }),
    supabase
      .from('subjects')
      .select('*')
      .eq('institution_id', institutionId)
      .order('created_at', { ascending: true }),
  ])

  return (
    <AcademicClient
      institutionId={institutionId}
      initialPrograms={programsRes.data ?? []}
      initialLevels={levelsRes.data ?? []}
      initialSessions={sessionsRes.data ?? []}
      initialClasses={classesRes.data ?? []}
      initialSubjects={subjectsRes.data ?? []}
    />
  )
}
