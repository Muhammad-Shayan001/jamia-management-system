import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ResultsManagementClient from './ResultsManagementClient'

export default async function AdminResultsManagementPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const isRtl = lang === 'ur'
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  const { data: profile } = (await supabase.from('profiles').select('role').eq('id', user.id).single()) as any

  if (!profile || !['super_admin', 'admin', 'nazim'].includes(profile.role)) {
    redirect(`/${lang}/unauthorized`)
  }

  // Fetch published exams
  const { data: exams } = (await supabase
    .from('exams')
    .select('id, name_en, name_ur, exam_type, start_date')
    .eq('is_published', true)
    .order('start_date', { ascending: false })) as any

  // Fetch classes
  const { data: classes } = (await supabase
    .from('classes')
    .select('id, name_en, name_ur')
    .order('name_en')) as any

  return (
    <ResultsManagementClient
      exams={exams || []}
      classes={classes || []}
      isRtl={isRtl}
    />
  )
}
