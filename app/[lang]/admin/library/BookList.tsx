'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Download, Ban, CheckCircle2 } from 'lucide-react'
import { deactivateBook } from '@/lib/actions/library'
import { toast } from 'sonner'
import { useTransition } from 'react'

export function BookList({ books, lang }: { books: any[], lang: string }) {
  const [isPending, startTransition] = useTransition()

  const handleDeactivate = (id: string) => {
    startTransition(async () => {
      const res = await deactivateBook(id)
      if (res?.error) toast.error(res.error)
      else toast.success('Book deactivated')
    })
  }

  if (books.length === 0) {
    return (
      <Card className="border-primary/10 border-dashed">
        <CardContent className="py-12 text-center text-muted-foreground">
          No books in the library yet.
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {books.map(book => (
        <Card key={book.id} className={`border-primary/10 shadow-sm ${!book.is_active && 'opacity-60'}`}>
          <CardContent className="p-4 flex gap-4">
            <div className="w-16 h-20 bg-muted rounded-md shrink-0 border flex items-center justify-center overflow-hidden">
              {book.cover_url ? (
                <img src={book.cover_url} alt="Cover" className="w-full h-full object-cover" />
              ) : (
                <span className="text-xs text-muted-foreground">No Cover</span>
              )}
            </div>
            <div className="flex-1 min-w-0 flex flex-col">
              <h4 className="font-semibold text-sm truncate">{lang === 'ur' && book.title_ur ? book.title_ur : book.title_en}</h4>
              <p className="text-xs text-muted-foreground truncate">{book.author || 'Unknown Author'}</p>
              <div className="flex items-center gap-2 mt-1 mb-2">
                <Badge variant="outline" className="text-[10px] h-5">{book.category}</Badge>
                {book.is_active ? (
                  <Badge className="bg-green-100 text-green-700 text-[10px] h-5 hover:bg-green-100">Active</Badge>
                ) : (
                  <Badge variant="secondary" className="text-[10px] h-5">Inactive</Badge>
                )}
              </div>
              <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Download className="w-3 h-3" /> {book.download_count}</span>
                {book.is_active && (
                  <Button variant="ghost" size="sm" onClick={() => handleDeactivate(book.id)} disabled={isPending} className="h-6 px-2 text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Ban className="w-3 h-3 mr-1" /> Deactivate
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
