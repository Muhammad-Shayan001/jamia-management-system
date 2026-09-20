'use client'

import { useActionState, useRef, useEffect } from 'react'
import { addBook } from '@/lib/actions/library'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'

export function AddBookForm({ classes }: { classes: any[] }) {
  const [state, action, pending] = useActionState(addBook, null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state?.success) {
      toast.success('Book added successfully')
      formRef.current?.reset()
    }
    if (state?.error) toast.error(state.error)
  }, [state])

  return (
    <form ref={formRef} action={action} className="space-y-4">
      <div className="space-y-1">
        <label className="text-xs font-medium">Title (English) *</label>
        <Input name="title_en" required placeholder="Book Title" className="h-9 text-sm border-primary/20" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium">Title (Urdu)</label>
        <Input name="title_ur" dir="rtl" placeholder="اردو عنوان" className="h-9 text-sm border-primary/20" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium">Author</label>
        <Input name="author" placeholder="Author name" className="h-9 text-sm border-primary/20" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium">Category *</label>
        <Select name="category" required defaultValue="General">
          <SelectTrigger className="h-9 text-sm border-primary/20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {['Fiqh', 'Hadith', 'Tafsir', 'Arabic', 'Sirah', 'Tajweed', 'General'].map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium">Restrict to Class (Optional)</label>
        <Select name="class_id">
          <SelectTrigger className="h-9 text-sm border-primary/20">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium">File URL (PDF/Link) *</label>
        <Input type="url" name="file_url" required placeholder="https://..." className="h-9 text-sm border-primary/20" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium">Cover Image URL (Optional)</label>
        <Input type="url" name="cover_url" placeholder="https://..." className="h-9 text-sm border-primary/20" />
      </div>
      <Button type="submit" disabled={pending} className="w-full bg-primary text-primary-foreground hover:bg-primary/90 mt-2">
        {pending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
        Upload Book
      </Button>
    </form>
  )
}
