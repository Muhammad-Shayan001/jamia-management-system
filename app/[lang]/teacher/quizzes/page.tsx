import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, Plus, CheckCircle2, Clock } from 'lucide-react'
import Link from 'next/link'
import { getQuizzesForTeacher } from '@/lib/actions/quizzes'
import { QuizActions } from './QuizActions'

export default async function TeacherQuizzesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const quizzes = await getQuizzesForTeacher()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quizzes</h2>
          <p className="text-muted-foreground text-sm mt-1">Create auto-graded MCQ quizzes for your classes</p>
        </div>
        <Link href={`/${lang}/teacher/quizzes/new`}>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> New Quiz
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total', value: quizzes.length, icon: Brain, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950' },
          { label: 'Published', value: quizzes.filter((q: any) => q.is_published).length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950' },
          { label: 'Attempts', value: quizzes.reduce((sum: number, q: any) => sum + (q.quiz_attempts?.length || 0), 0), icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
        ].map((s) => (
          <Card key={s.label} className="border-primary/10 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {quizzes.length === 0 ? (
        <Card className="border-primary/10 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Brain className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">No quizzes yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first MCQ quiz to start assessing students.</p>
            <Link href={`/${lang}/teacher/quizzes/new`} className="mt-4">
              <Button size="sm">Create Quiz</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((q: any) => (
            <Card key={q.id} className="border-primary/10 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        q.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {q.is_published ? 'Published' : 'Draft'}
                      </span>
                      {q.classes && (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                          {q.classes.name_en}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-base">{q.title_en}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>{q.duration_mins} mins</span>
                      {q.total_marks && <span>{q.total_marks} marks</span>}
                      <span>{q.quiz_attempts?.length || 0} attempts</span>
                    </div>
                  </div>
                  <QuizActions quizId={q.id} isPublished={q.is_published} lang={lang} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
