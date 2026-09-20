import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Brain, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { getQuizzesForStudent } from '@/lib/actions/quizzes'
import { Badge } from '@/components/ui/badge'

export default async function StudentQuizzesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const quizzes = await getQuizzesForStudent()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Quizzes</h2>
        <p className="text-muted-foreground text-sm mt-1">Take assigned MCQ quizzes</p>
      </div>

      {quizzes.length === 0 ? (
        <Card className="border-primary/10 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Brain className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">No quizzes pending</p>
            <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((q: any) => {
            const attempt = q.quiz_attempts?.[0]
            const isCompleted = !!attempt?.submitted_at
            
            return (
              <Card key={q.id} className="border-primary/10 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        {q.subjects && <Badge variant="outline" className="text-xs bg-muted/50">{q.subjects.name_en}</Badge>}
                        {isCompleted ? (
                          <Badge className="bg-green-100 text-green-700 text-xs">Completed</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-700 text-xs">Pending</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-lg">{q.title_en}</h3>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {q.duration_mins} mins</span>
                        <span>Total Marks: {q.total_marks || '-'}</span>
                      </div>
                    </div>
                    
                    <div className="shrink-0 flex flex-col items-end">
                      {isCompleted ? (
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">Your Score</p>
                          <p className="text-2xl font-bold text-primary">{attempt.score} <span className="text-base text-muted-foreground font-normal">/ {q.total_marks}</span></p>
                        </div>
                      ) : (
                        <Link href={`/${lang}/student/quizzes/${q.id}/take`}>
                          <Button className="bg-primary text-primary-foreground">Take Quiz</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
