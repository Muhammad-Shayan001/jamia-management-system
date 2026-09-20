'use client'

import { useActionState } from 'react'
import { upsertHifzProgress } from '@/lib/actions/hifz'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useEffect, useRef } from 'react'

export function HifzUpdateForm({ studentId, surahs }: { studentId: string, surahs: any[] }) {
  const [state, action, pending] = useActionState(upsertHifzProgress, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) toast.success('Record updated!')
    if (state?.error) toast.error(state.error)
  }, [state])

  return (
    <form ref={formRef} action={action} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
      <input type="hidden" name="student_id" value={studentId} />
      
      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase text-muted-foreground">Surah</label>
        <Select name="surah_number" required>
          <SelectTrigger className="h-8 text-xs border-primary/20">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="max-h-[300px]">
            {surahs.map(s => (
              <SelectItem key={s.number} value={s.number.toString()} className="text-xs">
                {s.number}. {s.name_en} ({s.name_ar})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase text-muted-foreground">Status</label>
        <Select name="hifz_status" required defaultValue="in_progress">
          <SelectTrigger className="h-8 text-xs border-primary/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="revision_needed">Needs Revision</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1">
        <label className="text-[10px] font-semibold uppercase text-muted-foreground">Nazira Rating (1-5)</label>
        <Input type="number" name="nazira_rating" min="1" max="5" placeholder="Optional" className="h-8 text-xs border-primary/20" />
      </div>

      <div className="space-y-1 sm:col-span-2 lg:col-span-3">
        <label className="text-[10px] font-semibold uppercase text-muted-foreground">Tajweed Notes / Mistakes</label>
        <Textarea name="tajweed_notes" placeholder="e.g. Makharij issue in..." className="h-8 min-h-[32px] text-xs resize-none py-1.5 border-primary/20" />
      </div>

      <Button type="submit" disabled={pending} size="sm" className="h-8 w-full bg-primary text-primary-foreground hover:bg-primary/90 text-xs">
        {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Save className="w-3.5 h-3.5 mr-1" />}
        Update
      </Button>
    </form>
  )
}
