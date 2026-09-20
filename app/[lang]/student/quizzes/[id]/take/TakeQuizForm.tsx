'use client'

import { useState, useTransition, useEffect } from 'react'
import { submitQuiz } from '@/lib/actions/quizzes'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Clock, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export function TakeQuizForm({
  quizId, attemptId, questions, durationMins, lang
}: {
  quizId: string, attemptId: string, questions: any[], durationMins: number, lang: string
}) {
  const router = useRouter()
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [isPending, startTransition] = useTransition()
  const [timeLeft, setTimeLeft] = useState(durationMins * 60)

  // Timer
  useEffect(() => {
    if (timeLeft <= 0) {
      handleSubmit()
      return
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000)
    return () => clearInterval(timer)
  }, [timeLeft])

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleSubmit = () => {
    if (isPending) return
    startTransition(async () => {
      const res = await submitQuiz(attemptId, answers)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(`Quiz submitted! Score: ${res.score}/${res.total}`)
        router.push(`/${lang}/student/quizzes`)
      }
    })
  }

  return (
    <div className="space-y-6 relative">
      {/* Sticky Timer */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-3 border-b flex justify-end">
        <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-lg border ${
          timeLeft < 60 ? 'bg-red-100 text-red-700 border-red-200 animate-pulse' : 'bg-muted/50 border-border text-foreground'
        }`}>
          <Clock className="w-5 h-5" /> {formatTime(timeLeft)}
        </div>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <Card key={q.id} className="border-primary/10 shadow-sm">
            <CardContent className="p-6">
              <div className="flex justify-between items-start gap-4 mb-4">
                <h3 className="font-medium text-base">
                  <span className="text-muted-foreground mr-2">{idx + 1}.</span> {q.question_text}
                </h3>
                <span className="text-xs font-semibold px-2 py-1 bg-muted rounded shrink-0">{q.marks} pts</span>
              </div>
              
              <RadioGroup 
                value={answers[q.id] || ''} 
                onValueChange={(val) => setAnswers(prev => ({ ...prev, [q.id]: val }))}
                className="space-y-3"
              >
                {['a', 'b', 'c', 'd'].map(opt => {
                  const val = q[`option_${opt}`]
                  if (!val) return null
                  return (
                    <div key={opt} className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                      answers[q.id] === opt ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50 border-border/50'
                    }`}>
                      <RadioGroupItem value={opt} id={`${q.id}-${opt}`} />
                      <Label htmlFor={`${q.id}-${opt}`} className="flex-1 cursor-pointer font-normal leading-relaxed">
                        <span className="uppercase mr-3 text-muted-foreground font-medium">{opt}.</span> {val}
                      </Label>
                    </div>
                  )
                })}
              </RadioGroup>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-end pt-4 pb-12">
        <Button onClick={handleSubmit} disabled={isPending} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 min-w-[200px]">
          {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Submit Quiz
        </Button>
      </div>
    </div>
  )
}
