'use client'

import { useActionState } from 'react'
import { createQuiz } from '@/lib/actions/quizzes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function NewQuizForm({ classes, subjects, lang }: {
  classes: { id: string; name_en: string }[]
  subjects: { id: string; name_en: string }[]
  lang: string
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createQuiz, null)

  useEffect(() => {
    if (state?.success && state.quizId) {
      router.push(`/${lang}/teacher/quizzes/${state.quizId}`)
    }
  }, [state])

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{state.error}</div>
      )}
      {state?.success && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Quiz created! Redirecting to add questions…
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title_en">Quiz Title (English) *</Label>
          <Input id="title_en" name="title_en" placeholder="e.g. Chapter 1 MCQ Test" required className="border-primary/20" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title_ur">Quiz Title (Urdu)</Label>
          <Input id="title_ur" name="title_ur" placeholder="اردو عنوان" dir="rtl" className="border-primary/20" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Class *</Label>
          <Select name="class_id" required>
            <SelectTrigger className="border-primary/20">
              <SelectValue placeholder="Select class" />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Subject</Label>
          <Select name="subject_id">
            <SelectTrigger className="border-primary/20">
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name_en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="duration_mins">Duration (minutes)</Label>
        <Input id="duration_mins" name="duration_mins" type="number" defaultValue="30" min="5" max="180" className="border-primary/20 w-32" />
      </div>

      <Button type="submit" disabled={pending} className="bg-primary text-primary-foreground hover:bg-primary/90">
        {pending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
        Create Quiz & Add Questions →
      </Button>
    </form>
  )
}
