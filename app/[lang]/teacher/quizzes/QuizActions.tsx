'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { publishQuiz } from '@/lib/actions/quizzes'
import { Send, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export function QuizActions({ quizId, isPublished, lang }: {
  quizId: string
  isPublished: boolean
  lang: string
}) {
  const [isPending, startTransition] = useTransition()

  function handlePublish() {
    startTransition(async () => {
      const res = await publishQuiz(quizId)
      if (res?.error) toast.error(res.error)
      else toast.success('Quiz published!')
    })
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <Link href={`/${lang}/teacher/quizzes/${quizId}`}>
        <Button variant="outline" size="sm" className="border-primary/20 text-primary hover:bg-primary/5">
          <ExternalLink className="w-3.5 h-3.5 mr-1" /> Manage
        </Button>
      </Link>
      {!isPublished && (
        <Button size="sm" onClick={handlePublish} disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white">
          {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1" />}
          Publish
        </Button>
      )}
    </div>
  )
}
