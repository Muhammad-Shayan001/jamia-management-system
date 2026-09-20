'use client'

import { useState, useTransition } from 'react'
import { gradeSubmission } from '@/lib/actions/assignments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export function GradeForm({ submissionId, maxMarks, currentMarks, currentFeedback }: {
  submissionId: string
  maxMarks: number
  currentMarks?: number
  currentFeedback?: string
}) {
  const [isPending, startTransition] = useTransition()
  const [marks, setMarks] = useState(currentMarks?.toString() || '')
  const [feedback, setFeedback] = useState(currentFeedback || '')
  const [saved, setSaved] = useState(!!currentMarks)

  function handleSave() {
    const m = parseFloat(marks)
    if (isNaN(m) || m < 0 || m > maxMarks) {
      toast.error(`Marks must be between 0 and ${maxMarks}`)
      return
    }
    startTransition(async () => {
      const res = await gradeSubmission(submissionId, m, feedback)
      if (res?.error) toast.error(res.error)
      else { toast.success('Graded!'); setSaved(true) }
    })
  }

  return (
    <div className="shrink-0 flex flex-col gap-2 min-w-[180px]">
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={marks}
          onChange={(e) => { setMarks(e.target.value); setSaved(false) }}
          placeholder={`/ ${maxMarks}`}
          min={0}
          max={maxMarks}
          className="w-20 h-8 text-sm border-primary/20"
        />
        <span className="text-xs text-muted-foreground">/ {maxMarks}</span>
        {saved && <CheckCircle2 className="w-4 h-4 text-green-500" />}
      </div>
      <Textarea
        value={feedback}
        onChange={(e) => { setFeedback(e.target.value); setSaved(false) }}
        placeholder="Feedback…"
        rows={2}
        className="text-xs border-primary/20 resize-none"
      />
      <Button size="sm" onClick={handleSave} disabled={isPending} className="bg-primary text-primary-foreground hover:bg-primary/90 h-7 text-xs">
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Save Grade'}
      </Button>
    </div>
  )
}
