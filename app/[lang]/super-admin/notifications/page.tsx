'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Bell, Send, CheckCircle2, MessageSquare, Mail } from 'lucide-react'
import { toast } from 'sonner'

export default function SuperAdminNotificationsPage() {
  const [titleEn, setTitleEn] = useState('')
  const [titleUr, setTitleUr] = useState('')
  const [bodyEn, setBodyEn] = useState('')
  const [bodyUr, setBodyUr] = useState('')
  const [targetRole, setTargetRole] = useState<'all' | 'teacher' | 'student'>('all')
  const [sendWhatsApp, setSendWhatsApp] = useState(true)
  const [sendEmail, setSendEmail] = useState(true)
  const [isPending, setIsPending] = useState(false)

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault()
    if (!titleEn || !bodyEn) {
      toast.error('Please enter announcement title and body')
      return
    }

    setIsPending(true)
    setTimeout(() => {
      setIsPending(false)
      toast.success('Broadcast notification dispatched to all portals & mobile channels!', { icon: '📢' })
      setTitleEn('')
      setTitleUr('')
      setBodyEn('')
      setBodyUr('')
    }, 600)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
          <Bell className="w-6 h-6 text-accent" />
          Institution Broadcast & Notifications
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Send institution-wide announcements with optional push via WhatsApp and transactional email.
        </p>
      </div>

      <Card className="border-primary/15 shadow-sm max-w-2xl">
        <CardHeader className="bg-primary/5 pb-3">
          <CardTitle className="text-base text-primary flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-accent" />
            Compose Institution-Wide Broadcast
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <form onSubmit={handleBroadcast} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Target Audience</Label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value as any)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm font-medium"
              >
                <option value="all">Entire Institution (All Staff, Students & Parents)</option>
                <option value="teacher">All Ustads / Faculty Members</option>
                <option value="student">All Students (Talib-e-Ilm)</option>
              </select>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Broadcast Title (English)</Label>
                <Input
                  placeholder="e.g. Annual Vacation & Examination Schedule"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Broadcast Title (Urdu)</Label>
                <Input
                  placeholder="مثلاً سالانہ تعطیلات و امتحانی شیڈول"
                  value={titleUr}
                  onChange={(e) => setTitleUr(e.target.value)}
                  className="h-10 text-right"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Announcement Content (English)</Label>
              <textarea
                rows={3}
                placeholder="Enter detailed message content..."
                value={bodyEn}
                onChange={(e) => setBodyEn(e.target.value)}
                required
                className="w-full p-3 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Announcement Content (Urdu)</Label>
              <textarea
                rows={3}
                placeholder="تفصیلی پیغام اردو میں درج کریں..."
                value={bodyUr}
                onChange={(e) => setBodyUr(e.target.value)}
                className="w-full p-3 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary text-right font-urdu"
              />
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                <input
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <span className="flex items-center gap-1 text-emerald-600 font-bold">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Push to WhatsApp
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium">
                <input
                  type="checkbox"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="rounded border-input text-primary focus:ring-primary"
                />
                <span className="flex items-center gap-1 text-blue-600 font-bold">
                  <Mail className="w-3.5 h-3.5" />
                  Dispatch Email
                </span>
              </label>
            </div>

            <div className="pt-3 border-t border-border flex justify-end">
              <Button
                type="submit"
                disabled={isPending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 h-11 px-6"
              >
                <Send className="w-4 h-4 text-accent" />
                {isPending ? 'Broadcasting...' : 'Publish Broadcast'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
