import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { AddQuestionForm } from './AddQuestionForm'

export default async function QuizDetailPage({
  params
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params
  const supabase = await createClient()

  const { data: quiz } = await (supabase
    .from('quizzes')
    .select('*, classes(name_en), subjects(name_en), quiz_questions(*)')
    .eq('id', id)
    .single() as any)

  if (!quiz) {
    return <div className="text-center py-20 text-muted-foreground">Quiz not found.</div>
  }

  const questions = quiz.quiz_questions?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/${lang}/teacher/quizzes`} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{quiz.title_en}</h2>
          <div className="flex items-center gap-2 mt-1">
            {quiz.classes && <Badge variant="outline">{quiz.classes.name_en}</Badge>}
            {quiz.subjects && <Badge variant="outline">{quiz.subjects.name_en}</Badge>}
            <Badge className={quiz.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
              {quiz.is_published ? 'Published' : 'Draft'}
            </Badge>
            <span className="text-sm text-muted-foreground">{quiz.duration_mins} mins</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 items-start">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" /> Questions ({questions.length})
          </h3>
          
          {questions.length === 0 ? (
            <Card className="border-primary/10 border-dashed">
              <CardContent className="py-10 text-center text-muted-foreground">
                No questions added yet.
              </CardContent>
            </Card>
          ) : (
            questions.map((q: any, i: number) => (
              <Card key={q.id} className="border-primary/10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-primary/40" />
                <CardContent className="p-4 pl-5">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <p className="font-medium text-sm leading-relaxed">
                      <span className="text-muted-foreground mr-1">{i + 1}.</span> {q.question_text}
                    </p>
                    <Badge variant="secondary" className="shrink-0">{q.marks} pts</Badge>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    {['a', 'b', 'c', 'd'].map(opt => {
                      const val = q[`option_${opt}`]
                      if (!val) return null
                      const isCorrect = q.correct_option === opt
                      return (
                        <div key={opt} className={`p-2 rounded border ${isCorrect ? 'bg-green-50 border-green-200 text-green-800 font-medium' : 'bg-muted/30 border-border text-muted-foreground'}`}>
                          <span className="uppercase mr-2 opacity-50">{opt}.</span> {val}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        <div className="md:col-span-1">
          <Card className="border-primary/10 shadow-sm sticky top-6">
            <CardHeader className="pb-3 bg-muted/20 border-b">
              <CardTitle className="text-base">Add Question</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <AddQuestionForm quizId={quiz.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
