'use client'

import { useActionState } from 'react'
import { createAssignment } from '@/lib/actions/assignments'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'

export function NewAssignmentForm({ classes, subjects, lang }: {
  classes: { id: string; name_en: string }[]
  subjects: { id: string; name_en: string; class_id: string }[]
  lang: string
}) {
  const router = useRouter()
  const [state, action, pending] = useActionState(createAssignment, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      setTimeout(() => router.push(`/${lang}/teacher/assignments`), 1000)
    }
  }, [state])

  return (
    <form ref={formRef} action={action} className="space-y-5">
      {state?.error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{state.error}</div>
      )}
      {state?.success && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Assignment created! Redirecting…
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="title_en">Title (English) *</Label>
          <Input id="title_en" name="title_en" placeholder="e.g. Chapter 3 Homework" required className="border-primary/20" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title_ur">Title (Urdu)</Label>
          <Input id="title_ur" name="title_ur" placeholder="اردو عنوان" dir="rtl" className="border-primary/20" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description / Instructions</Label>
        <Textarea id="description" name="description" rows={4} placeholder="Describe the assignment and what students should do…" className="border-primary/20 resize-none" />
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
              <SelectValue placeholder="Select subject (optional)" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name_en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="due_date">Due Date</Label>
          <Input id="due_date" name="due_date" type="date" className="border-primary/20" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="max_marks">Max Marks</Label>
          <Input id="max_marks" name="max_marks" type="number" defaultValue="10" min="1" max="1000" className="border-primary/20" />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" name="is_published" value="false" disabled={pending} variant="outline" className="border-primary/20 text-primary">
          {pending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Save as Draft
        </Button>
        <Button type="submit" name="is_published" value="true" disabled={pending} className="bg-primary text-primary-foreground hover:bg-primary/90">
          {pending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Publish Now
        </Button>
      </div>
    </form>
  )
}
