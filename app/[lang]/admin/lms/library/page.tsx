import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookCopy, Plus } from 'lucide-react'
import { AddBookForm } from './AddBookForm'
import { BookList } from './BookList'
import { getAllBooksAdmin } from '@/lib/actions/library'

export default async function AdminLibraryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const supabase = await createClient()
  const books = await getAllBooksAdmin()
  const { data: classes } = await (supabase.from('classes').select('id, name_en').order('level') as any)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BookCopy className="w-6 h-6 text-primary" /> Digital Library
          </h2>
          <p className="text-muted-foreground text-sm mt-1">Manage e-books, PDFs, and resources</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <div className="lg:col-span-2">
          <BookList books={books} lang={lang} />
        </div>
        <div className="lg:col-span-1">
          <Card className="border-primary/10 shadow-sm sticky top-6">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Upload New Book</h3>
              <AddBookForm classes={classes || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
