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

export async function createQuiz(prevState: any, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const parsed = QuizSchema.safeParse({
    title_en: formData.get('title_en'),
    title_ur: formData.get('title_ur'),
    class_id: formData.get('class_id'),
    subject_id: formData.get('subject_id'),
    duration_mins: formData.get('duration_mins'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { data: teacher } = await (supabase.from('teachers').select('id').eq('profile_id', user.id).single() as any)

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

  const adminClient = createAdminClient()

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

export async function publishQuiz(quizId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Calculate total_marks from questions
  const { data: questions } = await (supabase
    .from('quiz_questions')
    .select('marks')
    .eq('quiz_id', quizId) as any)

  const total = (questions || []).reduce((sum: number, q: any) => sum + (q.marks || 1), 0)

  const adminClient = createAdminClient()
  const { error } = await (adminClient.from('quizzes') as any)
    .update({ is_published: true, total_marks: total })
    .eq('id', quizId)

  if (error) return { error: error.message }
  revalidatePath('/teacher/quizzes')
  return { success: true }
}

export async function startQuizAttempt(quizId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

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

export async function submitQuiz(attemptId: string, answers: Record<string, string>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const adminClient = createAdminClient()

  // Get quiz questions with correct answers
  const { data: attempt } = await (adminClient.from('quiz_attempts') as any)
    .select('quiz_id')
    .eq('id', attemptId)
    .single()

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

export async function getQuizWithQuestions(quizId: string) {
  const supabase = await createClient()
  const { data } = await (supabase
    .from('quizzes')
    .select('*, quiz_questions(*)')
    .eq('id', quizId)
    .single() as any)
  return data
}
