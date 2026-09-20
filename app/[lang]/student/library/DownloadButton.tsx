'use client'

import { Button } from '@/components/ui/button'
import { BookOpen } from 'lucide-react'
import { incrementDownload } from '@/lib/actions/library'

export function DownloadButton({ bookId, fileUrl }: { bookId: string, fileUrl: string }) {
  const handleRead = async () => {
    // Open in new tab
    window.open(fileUrl, '_blank')
    // Silently increment
    try {
      await incrementDownload(bookId)
    } catch (e) {
      // ignore
    }
  }

  return (
    <Button onClick={handleRead} size="sm" className="w-full h-8 text-xs bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground">
      <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Read Book
    </Button>
  )
}
