'use client'

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MessageSquare, Pin } from 'lucide-react'

export function DiscussionForum() {
  const discussions = [
    { id: 1, title: 'Resources for Nahw', author: 'Ust. Ahmad', isPinned: true, replies: 12, latest: '2 hrs ago' },
    { id: 2, title: 'Question about today\'s Fiqh lesson', author: 'Student A', isPinned: false, replies: 4, latest: '5 hrs ago' },
  ]

  return (
    <Card className="border-primary/10 shadow-sm overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-2 bg-primary/5">
        <CardTitle className="text-lg">Class Discussions</CardTitle>
        <Button size="sm">New Topic</Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {discussions.map(d => (
            <div key={d.id} className="p-4 hover:bg-muted/50 transition-colors flex items-start space-x-4 cursor-pointer">
              <div className={`p-2 rounded-full mt-1 ${d.isPinned ? 'bg-amber-100 text-amber-700' : 'bg-primary/10 text-primary'}`}>
                {d.isPinned ? <Pin className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{d.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">Started by {d.author}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">{d.replies} replies</span>
                <p className="text-xs text-muted-foreground mt-1">{d.latest}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
