import { createClient } from '@/lib/supabase/server'
import ExamsClient from './ExamsClient'
import { redirect } from 'next/navigation'

export default async function ExamsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const isRtl = lang === 'ur'
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  // Authorization check
  const { data: profile } = (await supabase.from('profiles').select('role').eq('id', user.id).single()) as any

  if (!profile || !['super_admin', 'admin', 'nazim'].includes(profile.role)) {
    redirect(`/${lang}/unauthorized`)
  }

  // Fetch exams
  const { data: exams } = (await supabase
    .from('exams')
    .select('*, session:sessions(name_en), campus:campuses(name)')
    .order('start_date', { ascending: false })) as any

  // Fetch sessions for dropdown
  const { data: sessions } = (await supabase
    .from('sessions')
    .select('id, name_en')
    .eq('is_active', true)
    .order('name_en')) as any

  // Fetch campuses for dropdown
  const { data: campuses } = (await supabase.from('campuses').select('id, name').eq('is_active', true).order('name')) as any

  return (
    <ExamsClient
      initialExams={exams || []}
      sessions={sessions || []}
      campuses={campuses || []}
      isRtl={isRtl}
    />
  )
}
