'use server'

import { createClient } from '../supabase/server'
import { createAdminClient } from '../supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const HifzUpdateSchema = z.object({
  student_id: z.string().uuid(),
  surah_number: z.coerce.number().min(1).max(114),
  hifz_status: z.enum(['not_started', 'in_progress', 'completed', 'revision_needed']),
  nazira_rating: z.coerce.number().min(1).max(5).optional().nullable(),
  tajweed_notes: z.string().max(500).optional(),
  ayahs_memorized: z.coerce.number().min(0).optional(),
  last_revision_at: z.string().optional().nullable(),
})

export async function upsertHifzProgress(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: profile } = await (supabase.from('profiles').select('role').eq('id', user.id).single() as any)
  if (!['teacher', 'admin', 'nazim', 'super_admin'].includes(profile?.role)) {
    return { error: 'Only teachers and admins can update Hifz records' }
  }

  const { data: teacher } = await (supabase.from('teachers').select('id').eq('profile_id', user.id).single() as any)

  const parsed = HifzUpdateSchema.safeParse({
    student_id: formData.get('student_id'),
    surah_number: formData.get('surah_number'),
    hifz_status: formData.get('hifz_status'),
    nazira_rating: formData.get('nazira_rating') || null,
    tajweed_notes: formData.get('tajweed_notes'),
    ayahs_memorized: formData.get('ayahs_memorized') || 0,
    last_revision_at: formData.get('last_revision_at') || null,
  })

  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const adminClient = createAdminClient()
  const { error } = await (adminClient.from('hifz_progress') as any).upsert({
    ...parsed.data,
    marked_by: teacher?.id || null,
  }, { onConflict: 'student_id,surah_number' })

  if (error) return { error: error.message }
  revalidatePath('/teacher/hifz')
  revalidatePath('/admin/lms/hifz')
  revalidatePath('/student/hifz')
  return { success: true }
}

export async function getHifzProgressForStudent(studentId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // If no studentId provided, get current user's student record
  let sid = studentId
  if (!sid) {
    const { data: student } = await (supabase.from('students').select('id').eq('profile_id', user.id).single() as any)
    sid = student?.id
  }
  if (!sid) return []

  const { data } = await (supabase
    .from('hifz_progress')
    .select('*, surahs(*)')
    .eq('student_id', sid)
    .order('surah_number', { ascending: true }) as any)

  return data || []
}

export async function getHifzProgressForClass(classId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await (supabase
    .from('students')
    .select('id, name_en, name_ur, hifz_progress(surah_number, hifz_status, surahs(name_en, name_ar))')
    .eq('class_id', classId)
    .eq('is_active', true)
    .order('name_en', { ascending: true }) as any)

  return data || []
}

export async function getAllStudentsHifzSummary() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await (supabase
    .from('students')
    .select(`
      id, name_en, name_ur, admission_number,
      classes(name_en),
      hifz_progress(surah_number, hifz_status)
    `)
    .eq('is_active', true)
    .order('name_en') as any)

  return (data || []).map((s: any) => {
    const progress = s.hifz_progress || []
    const completed = progress.filter((p: any) => p.hifz_status === 'completed').length
    const inProgress = progress.filter((p: any) => p.hifz_status === 'in_progress').length
    return { ...s, completedSurahs: completed, inProgressSurahs: inProgress, totalTracked: progress.length }
  })
}
