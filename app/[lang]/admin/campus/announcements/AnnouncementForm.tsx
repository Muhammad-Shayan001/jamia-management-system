'use client'

import { useState } from 'react'
import { postAnnouncement } from '@/lib/actions/announcements'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/switch'

export function AnnouncementForm() {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    const result = await postAnnouncement(formData)
    
    if (result.success) {
      toast.success('Announcement posted successfully!', { icon: '📢' })
      ;(e.target as HTMLFormElement).reset()
    } else {
      toast.error(result.error || 'Failed to post announcement')
    }
    
    setLoading(false)
  }

  return (
    <Card className="border-primary/10 shadow-sm">
      <CardHeader>
        <CardTitle>New Announcement</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Title (English)</Label>
              <Input name="title_en" required />
            </div>
            <div className="space-y-2">
              <Label>Title (Urdu)</Label>
              <Input name="title_ur" dir="rtl" className="text-urdu text-lg" />
            </div>
            <div className="space-y-2">
              <Label>Message (English)</Label>
              <textarea 
                name="body_en" 
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-transparent shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                required 
              />
            </div>
            <div className="space-y-2">
              <Label>Message (Urdu)</Label>
              <textarea 
                name="body_ur" 
                dir="rtl"
                className="w-full min-h-[100px] p-3 rounded-md border border-input bg-transparent shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-urdu text-lg" 
              />
            </div>
          </div>
          
          <div className="flex space-x-6 pt-4 border-t border-border mt-4">
            <div className="flex items-center space-x-2">
              <Switch id="email" name="send_email" />
              <Label htmlFor="email">Also send Email</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="whatsapp" name="send_whatsapp" />
              <Label htmlFor="whatsapp">Also send WhatsApp</Label>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading ? 'Posting...' : 'Post Announcement'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
