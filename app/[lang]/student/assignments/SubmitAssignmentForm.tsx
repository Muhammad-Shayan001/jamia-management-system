'use client'

import { useTransition, useState } from 'react'
import { submitAssignment } from '@/lib/actions/assignments'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send } from 'lucide-react'
import { toast } from 'sonner'

export function SubmitAssignmentForm({ assignmentId }: { assignmentId: string }) {
  const [isPending, startTransition] = useTransition()
  const [note, setNote] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const res = await submitAssignment(assignmentId, note)
      if (res?.error) toast.error(res.error)
      else toast.success('Assignment submitted!')
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea 
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add a note or link to your work..."
        className="text-sm min-h-[80px] resize-none bg-white dark:bg-card border-primary/20"
        required
      />
      <Button type="submit" disabled={isPending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
        {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
        Turn In
      </Button>
    </form>
  )
}
