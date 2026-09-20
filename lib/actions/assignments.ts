'use server'

import { createClient } from '../supabase/server'
import { createAdminClient } from '../supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ─── Assignments ────────────────────────────────────────────

const AssignmentSchema = z.object({
  title_en: z.string().min(2, 'Title is required'),
  title_ur: z.string().optional(),
  description: z.string().optional(),
  class_id: z.string().uuid('Invalid class'),
  subject_id: z.string().uuid().optional().or(z.literal('')),
  due_date: z.string().optional(),
  max_marks: z.coerce.number().min(1).max(1000).default(10),
})

export async function createAssignment(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const raw = {
    title_en: formData.get('title_en') as string,
    title_ur: formData.get('title_ur') as string | undefined,
    description: formData.get('description') as string | undefined,
    class_id: formData.get('class_id') as string,
    subject_id: formData.get('subject_id') as string | undefined,
    due_date: formData.get('due_date') as string | undefined,
    max_marks: formData.get('max_marks'),
  }

  const parsed = AssignmentSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  // Get teacher id from profile
  const { data: teacher } = await (supabase.from('teachers').select('id').eq('profile_id', user.id).single() as any)

  const adminClient = createAdminClient()
  const { error } = await (adminClient.from('assignments') as any).insert({
    ...parsed.data,
    teacher_id: teacher?.id || null,
    subject_id: parsed.data.subject_id || null,
    is_published: formData.get('is_published') === 'true',
  })

  if (error) return { error: error.message }

  revalidatePath('/teacher/assignments')
  revalidatePath('/admin/assignments')
  return { success: true }
}

export async function publishAssignment(assignmentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const adminClient = createAdminClient()
  const { error } = await (adminClient.from('assignments') as any)
    .update({ is_published: true })
    .eq('id', assignmentId)

  if (error) return { error: error.message }
  revalidatePath('/teacher/assignments')
  return { success: true }
}

export async function gradeSubmission(submissionId: string, marks: number, feedback: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const adminClient = createAdminClient()
  const { error } = await (adminClient.from('assignment_submissions') as any)
    .update({ marks_obtained: marks, feedback, graded_at: new Date().toISOString() })
    .eq('id', submissionId)

  if (error) return { error: error.message }
  revalidatePath('/teacher/assignments')
  return { success: true }
}

export async function submitAssignment(assignmentId: string, note: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: student } = await (supabase.from('students').select('id').eq('profile_id', user.id).single() as any)
  if (!student) return { error: 'Student profile not found' }

  const adminClient = createAdminClient()
  const { error } = await (adminClient.from('assignment_submissions') as any).upsert({
    assignment_id: assignmentId,
    student_id: student.id,
    note,
    submitted_at: new Date().toISOString(),
  }, { onConflict: 'assignment_id,student_id' })

  if (error) return { error: error.message }
  revalidatePath('/student/assignments')
  return { success: true }
}

export async function getAssignmentsForTeacher() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: teacher } = await (supabase.from('teachers').select('id').eq('profile_id', user.id).single() as any)

  const { data } = await (supabase
    .from('assignments')
    .select('*, classes(name_en), subjects(name_en), assignment_submissions(id)')
    .eq('teacher_id', teacher?.id || '')
    .order('created_at', { ascending: false }) as any)

  return data || []
}

export async function getAssignmentsForStudent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: student } = await (supabase.from('students').select('id, class_id').eq('profile_id', user.id).single() as any)
  if (!student) return []

  const { data } = await (supabase
    .from('assignments')
    .select('*, classes(name_en), subjects(name_en), assignment_submissions!left(id, marks_obtained, submitted_at)')
    .eq('is_published', true)
    .eq('class_id', student.class_id)
    .order('due_date', { ascending: true }) as any)

  return data || []
}

export async function getSubmissionsForAssignment(assignmentId: string) {
  const supabase = await createClient()
  const { data } = await (supabase
    .from('assignment_submissions')
    .select('*, students(name_en, admission_number)')
    .eq('assignment_id', assignmentId)
    .order('submitted_at', { ascending: false }) as any)
  return data || []
}
