'use server'

import { createClient } from '../supabase/server'
import { createAdminClient } from '../supabase/admin'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ─── Quiz Management ─────────────────────────────────────────

const QuizSchema = z.object({
  title_en: z.string().min(2, 'Title is required'),
  title_ur: z.string().optional(),
  class_id: z.string().uuid('Invalid class'),
  subject_id: z.string().uuid().optional().or(z.literal('')),
  duration_mins: z.coerce.number().min(5).max(180).default(30),
})

const QuestionSchema = z.object({
  question_text: z.string().min(4, 'Question text required'),
  option_a: z.string().min(1),
  option_b: z.string().min(1),
  option_c: z.string().optional(),
  option_d: z.string().optional(),
  correct_option: z.enum(['a', 'b', 'c', 'd']),
  marks: z.coerce.number().min(0.5).default(1),
})

// ─── createQuiz ───────────────────────────────────────────────
export async function createQuiz(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // FIX 2 — role check (same pattern as hifz.ts)
  const { data: profile } = await (supabase.from('profiles').select('role').eq('id', user.id).single() as any)
  if (!['teacher', 'admin', 'nazim', 'super_admin'].includes(profile?.role)) {
    return { error: 'Unauthorized: only teachers and admins can create quizzes' }
  }

  const parsed = QuizSchema.safeParse({
    title_en: formData.get('title_en'),
    title_ur: formData.get('title_ur'),
    class_id: formData.get('class_id'),
    subject_id: formData.get('subject_id'),
    duration_mins: formData.get('duration_mins'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { data: teacher } = await (supabase.from('teachers').select('id').eq('profile_id', user.id).single() as any)

  // If teacher, verify they actually teach the target class
  if (profile?.role === 'teacher') {
    if (!teacher) return { error: 'Teacher profile not found' }
    const { data: classAssign } = await (supabase
      .from('class_teacher_assignments')
      .select('id')
      .eq('teacher_id', teacher.id)
      .eq('class_id', parsed.data.class_id)
      .single() as any)
    if (!classAssign) {
      return { error: 'Unauthorized: you can only create quizzes for classes you teach' }
    }
  }

  const adminClient = createAdminClient()
  const { data: quiz, error } = await (adminClient.from('quizzes') as any).insert({
    ...parsed.data,
    teacher_id: teacher?.id || null,
    subject_id: parsed.data.subject_id || null,
  }).select().single()

  if (error) return { error: error.message }

  revalidatePath('/teacher/quizzes')
  return { success: true, quizId: quiz.id }
}

// ─── addQuizQuestion ──────────────────────────────────────────
export async function addQuizQuestion(quizId: string, prevState: any, formData: FormData) {
  const parsed = QuestionSchema.safeParse({
    question_text: formData.get('question_text'),
    option_a: formData.get('option_a'),
    option_b: formData.get('option_b'),
    option_c: formData.get('option_c'),
    option_d: formData.get('option_d'),
    correct_option: formData.get('correct_option'),
    marks: formData.get('marks'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // FIX 2 — role check
  const { data: profile } = await (supabase.from('profiles').select('role').eq('id', user.id).single() as any)
  if (!['teacher', 'admin', 'nazim', 'super_admin'].includes(profile?.role)) {
    return { error: 'Unauthorized' }
  }

  const adminClient = createAdminClient()

  // If teacher, verify they own the quiz by fetching the quiz row first
  if (profile?.role === 'teacher') {
    const { data: teacher } = await (supabase.from('teachers').select('id').eq('profile_id', user.id).single() as any)
    const { data: quiz } = await (adminClient.from('quizzes').select('teacher_id').eq('id', quizId).single() as any)
    if (!quiz || quiz.teacher_id !== teacher?.id) {
      return { error: 'Unauthorized: you can only add questions to your own quizzes' }
    }
  }

  // Get current question count for sort_order
  const { count } = await (adminClient.from('quiz_questions') as any)
    .select('*', { count: 'exact', head: true })
    .eq('quiz_id', quizId)

  const { error } = await (adminClient.from('quiz_questions') as any).insert({
    quiz_id: quizId,
    ...parsed.data,
    option_c: parsed.data.option_c || null,
    option_d: parsed.data.option_d || null,
    sort_order: (count || 0) + 1,
  })

  if (error) return { error: error.message }
  revalidatePath(`/teacher/quizzes/${quizId}`)
  return { success: true }
}

// ─── publishQuiz ──────────────────────────────────────────────
export async function publishQuiz(quizId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // FIX 2 — role check + ownership check
  const { data: profile } = await (supabase.from('profiles').select('role').eq('id', user.id).single() as any)
  if (!['teacher', 'admin', 'nazim', 'super_admin'].includes(profile?.role)) {
    return { error: 'Unauthorized' }
  }

  const adminClient = createAdminClient()

  // If teacher, verify quiz ownership
  if (profile?.role === 'teacher') {
    const { data: teacher } = await (supabase.from('teachers').select('id').eq('profile_id', user.id).single() as any)
    const { data: quiz } = await (adminClient.from('quizzes').select('teacher_id').eq('id', quizId).single() as any)
    if (!quiz || quiz.teacher_id !== teacher?.id) {
      return { error: 'Unauthorized: you can only publish your own quizzes' }
    }
  }

  // Calculate total_marks from questions
  const { data: questions } = await (adminClient
    .from('quiz_questions')
    .select('marks')
    .eq('quiz_id', quizId) as any)

  const total = (questions || []).reduce((sum: number, q: any) => sum + (q.marks || 1), 0)

  const { error } = await (adminClient.from('quizzes') as any)
    .update({ is_published: true, total_marks: total })
    .eq('id', quizId)

  if (error) return { error: error.message }
  revalidatePath('/teacher/quizzes')
  return { success: true }
}

// ─── startQuizAttempt ─────────────────────────────────────────
export async function startQuizAttempt(quizId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // FIX 2 — restrict to student role only
  const { data: profile } = await (supabase.from('profiles').select('role').eq('id', user.id).single() as any)
  if (profile?.role !== 'student') {
    return { error: 'Unauthorized: only students can attempt quizzes' }
  }

  const { data: student } = await (supabase.from('students').select('id').eq('profile_id', user.id).single() as any)
  if (!student) return { error: 'Student profile not found' }

  const adminClient = createAdminClient()

  // Check if already attempted
  const { data: existing } = await (adminClient.from('quiz_attempts') as any)
    .select('id, submitted_at')
    .eq('quiz_id', quizId)
    .eq('student_id', student.id)
    .single()

  if (existing?.submitted_at) return { error: 'You have already completed this quiz.' }
  if (existing) return { success: true, attemptId: existing.id }

  const { data: attempt, error } = await (adminClient.from('quiz_attempts') as any)
    .insert({ quiz_id: quizId, student_id: student.id })
    .select()
    .single()

  if (error) return { error: error.message }
  return { success: true, attemptId: attempt.id }
}

// ─── submitQuiz ───────────────────────────────────────────────
// FIX 4 — runs entirely via adminClient so we can tighten student-facing
// RLS on quiz_attempts to disallow direct UPDATE of score/is_correct.
// The correct_option is fetched server-side here and never exposed to the client.
export async function submitQuiz(attemptId: string, answers: Record<string, string>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Restrict to student role
  const { data: profile } = await (supabase.from('profiles').select('role').eq('id', user.id).single() as any)
  if (profile?.role !== 'student') {
    return { error: 'Unauthorized: only students can submit quiz attempts' }
  }

  // Verify the attempt belongs to this student before writing anything
  const { data: student } = await (supabase.from('students').select('id').eq('profile_id', user.id).single() as any)
  if (!student) return { error: 'Student profile not found' }

  const adminClient = createAdminClient()

  const { data: attempt } = await (adminClient.from('quiz_attempts') as any)
    .select('quiz_id, student_id, submitted_at')
    .eq('id', attemptId)
    .single()

  if (!attempt) return { error: 'Attempt not found' }
  if (attempt.student_id !== student.id) return { error: 'Unauthorized: this attempt does not belong to you' }
  if (attempt.submitted_at) return { error: 'This quiz has already been submitted.' }

  // Fetch correct answers server-side (FIX 3 — correct_option never goes to client)
  const { data: questions } = await (adminClient.from('quiz_questions') as any)
    .select('id, correct_option, marks')
    .eq('quiz_id', attempt.quiz_id)

  // Build answers array & calculate score
  let score = 0
  const answerRows = (questions || []).map((q: any) => {
    const chosen = answers[q.id]
    const isCorrect = chosen === q.correct_option
    if (isCorrect) score += q.marks || 1
    return {
      attempt_id: attemptId,
      question_id: q.id,
      chosen_option: chosen || null,
      is_correct: isCorrect,
    }
  })

  const { error: answerError } = await (adminClient.from('quiz_answers') as any)
    .upsert(answerRows, { onConflict: 'attempt_id,question_id' })

  if (answerError) return { error: answerError.message }

  const total = (questions || []).reduce((s: number, q: any) => s + (q.marks || 1), 0)

  const { error: attemptError } = await (adminClient.from('quiz_attempts') as any)
    .update({ score, total_marks: total, submitted_at: new Date().toISOString() })
    .eq('id', attemptId)

  if (attemptError) return { error: attemptError.message }
  revalidatePath('/student/quizzes')
  return { success: true, score, total }
}

export async function getQuizzesForTeacher() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: teacher } = await (supabase.from('teachers').select('id').eq('profile_id', user.id).single() as any)

  const { data } = await (supabase
    .from('quizzes')
    .select('*, classes(name_en), subjects(name_en), quiz_attempts(id)')
    .eq('teacher_id', teacher?.id || '')
    .order('created_at', { ascending: false }) as any)

  return data || []
}

export async function getQuizzesForStudent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: student } = await (supabase.from('students').select('id, class_id').eq('profile_id', user.id).single() as any)
  if (!student) return []

  const { data } = await (supabase
    .from('quizzes')
    .select('*, classes(name_en), subjects(name_en), quiz_attempts!left(id, score, submitted_at)')
    .eq('is_published', true)
    .eq('class_id', student.class_id)
    .order('created_at', { ascending: false }) as any)

  return data || []
}

// FIX 3 — getQuizWithQuestions for the take-quiz page:
// Never returns correct_option — the column is excluded from the SELECT.
// correct_option is only fetched inside submitQuiz (server-side, adminClient).
export async function getQuizWithQuestionsForStudent(quizId: string) {
  const supabase = await createClient()

  // Verify caller is a student
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await (supabase.from('profiles').select('role').eq('id', user.id).single() as any)
  if (profile?.role !== 'student') return null

  const { data } = await (supabase
    .from('quizzes')
    .select(`
      id, title_en, title_ur, duration_mins, total_marks,
      quiz_questions (
        id, question_text, option_a, option_b, option_c, option_d, marks, sort_order
      )
    `)
    .eq('id', quizId)
    .eq('is_published', true)
    .single() as any)
  // Note: correct_option is intentionally NOT selected
  return data
}

// Full quiz data (including correct_option) for teachers/admins only
export async function getQuizWithQuestions(quizId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await (supabase.from('profiles').select('role').eq('id', user.id).single() as any)
  if (!['teacher', 'admin', 'nazim', 'super_admin'].includes(profile?.role)) {
    return null
  }

  const { data } = await (supabase
    .from('quizzes')
    .select('*, quiz_questions(*)')
    .eq('id', quizId)
    .single() as any)
  return data
}
