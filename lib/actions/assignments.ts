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

// ─── Role helpers ─────────────────────────────────────────────
// Mirrors the pattern in hifz.ts and library.ts exactly.
async function getCallerProfile(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  return profile ? { user, profile } : { user, profile: { role: 'unknown' } }
}

// ─── createAssignment ─────────────────────────────────────────
export async function createAssignment(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // FIX 1 — role check (same pattern as hifz.ts)
  const { data: profile } = await (supabase.from('profiles').select('role').eq('id', user.id).single() as any)
  if (!['teacher', 'admin', 'nazim', 'super_admin'].includes(profile?.role)) {
    return { error: 'Unauthorized: only teachers and admins can create assignments' }
  }

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

  // Get teacher record
  const { data: teacher } = await (supabase.from('teachers').select('id').eq('profile_id', user.id).single() as any)

  // If caller is a teacher (not admin/nazim/super_admin), verify they actually
  // teach the target class via class_teacher_assignments table
  if (profile?.role === 'teacher') {
    if (!teacher) return { error: 'Teacher profile not found' }
    const { data: classAssign } = await (supabase
      .from('class_teacher_assignments')
      .select('id')
      .eq('teacher_id', teacher.id)
      .eq('class_id', parsed.data.class_id)
      .single() as any)
    if (!classAssign) {
      return { error: 'Unauthorized: you can only create assignments for classes you teach' }
    }
  }

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

// ─── publishAssignment ────────────────────────────────────────
export async function publishAssignment(assignmentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // FIX 1 — role check + ownership check
  const { data: profile } = await (supabase.from('profiles').select('role').eq('id', user.id).single() as any)
  if (!['teacher', 'admin', 'nazim', 'super_admin'].includes(profile?.role)) {
    return { error: 'Unauthorized' }
  }

  const adminClient = createAdminClient()

  // If teacher, verify they own this assignment
  if (profile?.role === 'teacher') {
    const { data: teacher } = await (supabase.from('teachers').select('id').eq('profile_id', user.id).single() as any)
    const { data: assignment } = await (adminClient.from('assignments').select('teacher_id').eq('id', assignmentId).single() as any)
    if (!assignment || assignment.teacher_id !== teacher?.id) {
      return { error: 'Unauthorized: you can only publish your own assignments' }
    }
  }

  const { error } = await (adminClient.from('assignments') as any)
    .update({ is_published: true })
    .eq('id', assignmentId)

  if (error) return { error: error.message }
  revalidatePath('/teacher/assignments')
  return { success: true }
}

// ─── gradeSubmission ──────────────────────────────────────────
export async function gradeSubmission(submissionId: string, marks: number, feedback: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // FIX 1 — role check + ownership check BEFORE adminClient write
  const { data: profile } = await (supabase.from('profiles').select('role').eq('id', user.id).single() as any)
  if (!['teacher', 'admin', 'nazim', 'super_admin'].includes(profile?.role)) {
    return { error: 'Unauthorized: only teachers and admins can grade submissions' }
  }

  const adminClient = createAdminClient()

  // If teacher, verify they own the assignment the submission belongs to
  if (profile?.role === 'teacher') {
    const { data: teacher } = await (supabase.from('teachers').select('id').eq('profile_id', user.id).single() as any)
    const { data: submission } = await (adminClient.from('assignment_submissions')
      .select('assignment_id')
      .eq('id', submissionId)
      .single() as any)
    if (!submission) return { error: 'Submission not found' }

    const { data: assignment } = await (adminClient.from('assignments')
      .select('teacher_id')
      .eq('id', submission.assignment_id)
      .single() as any)
    if (!assignment || assignment.teacher_id !== teacher?.id) {
      return { error: 'Unauthorized: you can only grade submissions for your own assignments' }
    }
  }

  const { error } = await (adminClient.from('assignment_submissions') as any)
    .update({ marks_obtained: marks, feedback, graded_at: new Date().toISOString() })
    .eq('id', submissionId)

  if (error) return { error: error.message }
  revalidatePath('/teacher/assignments')
  return { success: true }
}

// ─── submitAssignment ─────────────────────────────────────────
export async function submitAssignment(assignmentId: string, note: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // FIX 1 — restrict to student role only; a teacher calling this would
  // fail the student lookup anyway, but we reject early for clarity
  const { data: profile } = await (supabase.from('profiles').select('role').eq('id', user.id).single() as any)
  if (profile?.role !== 'student') {
    return { error: 'Unauthorized: only students can submit assignments' }
  }

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
