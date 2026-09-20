'use client'

import { useActionState } from 'react'
import { addQuizQuestion } from '@/lib/actions/quizzes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useRef } from 'react'

export function AddQuestionForm({ quizId }: { quizId: string }) {
  const addAction = addQuizQuestion.bind(null, quizId)
  const [state, action, pending] = useActionState(addAction, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      toast.success('Question added!')
      formRef.current?.reset()
    }
    if (state?.error) {
      toast.error(state.error)
    }
  }, [state])

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-medium">Question Text *</label>
        <Textarea name="question_text" required placeholder="What is the..." className="resize-none h-20 text-sm border-primary/20" />
      </div>
      
      <div className="space-y-2">
        {['a', 'b', 'c', 'd'].map((opt) => (
          <div key={opt} className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase w-4">{opt}</span>
            <Input name={`option_${opt}`} required={opt === 'a' || opt === 'b'} placeholder={`Option ${opt.toUpperCase()}`} className="h-8 text-sm border-primary/20" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium">Correct Option *</label>
          <Select name="correct_option" required defaultValue="a">
            <SelectTrigger className="h-8 text-sm border-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {['a', 'b', 'c', 'd'].map(opt => (
                <SelectItem key={opt} value={opt}>Option {opt.toUpperCase()}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium">Marks *</label>
          <Input type="number" name="marks" defaultValue="1" min="0.5" step="0.5" className="h-8 text-sm border-primary/20" required />
        </div>
      </div>

      <Button type="submit" disabled={pending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-9">
        {pending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
        Add Question
      </Button>
    </form>
  )
}
