import { redirect } from 'next/navigation'
import { TakeQuizForm } from './TakeQuizForm'
import { startQuizAttempt, getQuizWithQuestionsForStudent } from '@/lib/actions/quizzes'

export default async function TakeQuizPage({
  params
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params

  // Start or get existing attempt — already has role check inside
  const attemptRes = await startQuizAttempt(id)
  if (attemptRes.error && attemptRes.error !== 'You have already completed this quiz.') {
    return <div className="text-center py-20 text-red-500">{attemptRes.error}</div>
  }
  if (attemptRes.error === 'You have already completed this quiz.') {
    redirect(`/${lang}/student/quizzes`)
  }

  // FIX 3 — use the student-safe function that NEVER returns correct_option
  const quiz = await getQuizWithQuestionsForStudent(id)
  if (!quiz) return <div className="text-center py-20 text-muted-foreground">Quiz not found or access denied.</div>

  const questions = (quiz.quiz_questions || []).sort((a: any, b: any) => a.sort_order - b.sort_order)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-primary text-primary-foreground p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-bold tracking-tight">{quiz.title_en}</h2>
        <div className="flex items-center gap-4 mt-2 text-primary-foreground/80 text-sm">
          <span>{questions.length} Questions</span>
          <span>{quiz.duration_mins} Minutes</span>
          <span>Total Marks: {quiz.total_marks}</span>
        </div>
      </div>

      <TakeQuizForm 
        quizId={quiz.id} 
        attemptId={attemptRes.attemptId!} 
        questions={questions} 
        durationMins={quiz.duration_mins}
        lang={lang} 
      />
    </div>
  )
}
