import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookCopy, Search, Download } from 'lucide-react'
import { getLibraryBooks } from '@/lib/actions/library'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { DownloadButton } from './DownloadButton'

export default async function StudentLibraryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const books = await getLibraryBooks()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookCopy className="w-6 h-6 text-primary" /> Kutub Khana (Library)
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Browse and read digital resources</p>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="py-4 bg-muted/20 border-b">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-2.5" />
            <Input placeholder="Search books..." className="pl-8 rtl:pl-3 rtl:pr-8 bg-white dark:bg-card border-primary/20" />
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {books.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No books available right now.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {books.map((book: any) => (
                <div key={book.id} className="group relative border border-primary/10 rounded-xl overflow-hidden bg-card hover:shadow-md transition-all">
                  <div className="aspect-[2/3] bg-muted relative overflow-hidden flex items-center justify-center">
                    {book.cover_url ? (
                      <img src={book.cover_url} alt={book.title_en} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <BookCopy className="w-12 h-12 text-muted-foreground/30" />
                    )}
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-primary/90 text-primary-foreground text-[10px] backdrop-blur-sm border-none shadow-sm">
                        {book.category}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-semibold text-sm line-clamp-1" title={lang === 'ur' && book.title_ur ? book.title_ur : book.title_en}>
                      {lang === 'ur' && book.title_ur ? book.title_ur : book.title_en}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{book.author || 'Unknown'}</p>
                    <div className="mt-3">
                      <DownloadButton bookId={book.id} fileUrl={book.file_url} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
