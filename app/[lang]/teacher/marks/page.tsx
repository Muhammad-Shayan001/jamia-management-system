import { createClient } from '@/lib/supabase/server'
import MarksEntryClient from './MarksEntryClient'
import { redirect } from 'next/navigation'

export default async function TeacherMarksPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const isRtl = lang === 'ur'
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  // Get teacher profile
  const { data: profile } = (await supabase.from('profiles').select('role').eq('id', user.id).single()) as any

  if (!profile || profile.role !== 'teacher') {
    redirect(`/${lang}/unauthorized`)
  }

  // Get teacher ID
  const { data: teacher } = (await supabase
    .from('teachers')
    .select('id')
    .eq('profile_id', user.id)
    .single()) as any

  if (!teacher) {
    redirect(`/${lang}/unauthorized`)
  }

  // Get exam subjects assigned to this teacher
  // (We need to first implement teacher-subject assignment, for now get all active exams)
  const { data: examSubjects } = (await supabase
    .from('exam_subjects')
    .select(`
      id,
      total_marks,
      passing_marks,
      written_marks,
      oral_marks,
      practical_marks,
      exam:exams!inner(name_en, exam_type, is_published),
      subject:subjects!inner(name_en, name_ur),
      class:classes!inner(name_en)
    `)
    .eq('exams.is_published', true)
    .order('exam.start_date', { ascending: false })) as any

  return (
    <MarksEntryClient
      teacherId={teacher.id}
      examSubjects={examSubjects || []}
      isRtl={isRtl}
    />
  )
}
