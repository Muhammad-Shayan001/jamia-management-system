import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import StudentResultsClient from './StudentResultsClient'

export default async function StudentResultsPage({ params }: { params: Promise<{ lang: string }> }) {
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

  if (!profile || profile.role !== 'student') {
    redirect(`/${lang}/unauthorized`)
  }

  // Get student ID
  const { data: student } = (await supabase
    .from('students')
    .select('id, name_en, name_ur, admission_number, class_id')
    .eq('profile_id', user.id)
    .single()) as any

  if (!student) {
    redirect(`/${lang}/unauthorized`)
  }

  // Get student's results (only published)
  const { data: results } = (await supabase
    .from('results')
    .select(`
      *,
      exam:exams!inner(name_en, name_ur, exam_type, is_published)
    `)
    .eq('student_id', student.id)
    .eq('exams.is_published', true)
    .order('created_at', { ascending: false })) as any

  return (
    <StudentResultsClient
      student={student}
      results={results || []}
      isRtl={isRtl}
    />
  )
}
