import { createClient } from '@/lib/supabase/server'
import { getDictionary } from '@/lib/dictionaries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare, BookOpen, MessageSquare, Calendar } from 'lucide-react'

export default async function TeacherDashboard({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: announcements } = await (supabase
    .from('announcements')
    .select('id, title_en, title_ur, created_at')
    .order('created_at', { ascending: false })
    .limit(3)) as any

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{dict.nav.dashboard}</h2>
        <p className="text-muted-foreground text-sm mt-1">{new Date().toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Classes Today', value: '3', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
          { label: 'Attendance Marked', value: '2/3', icon: CheckSquare, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950' },
          { label: 'New Messages', value: '2', icon: MessageSquare, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950' },
          { label: 'Next Class', value: '10:45', icon: Calendar, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <Card key={i} className="border-primary/10 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
                <div className={`p-2 rounded-lg ${s.bg}`}><Icon className={`w-4 h-4 ${s.color}`} /></div>
              </CardHeader>
              <CardContent><div className="text-3xl font-bold">{s.value}</div></CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader><CardTitle className="text-base">Announcements</CardTitle></CardHeader>
          <CardContent>
            {announcements?.length ? (
              <div className="space-y-3">
                {announcements.map((a: any) => (
                  <div key={a.id} className="flex gap-3 pb-3 border-b last:border-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{lang === 'ur' && a.title_ur ? a.title_ur : a.title_en}</p>
                      <p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">No announcements.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader><CardTitle className="text-base">Quick Links</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Mark Attendance', href: `/${lang}/teacher/attendance` },
              { label: 'Enter Results', href: `/${lang}/teacher/results` },
              { label: 'View Timetable', href: `/${lang}/teacher/timetable` },
              { label: 'Open Chat', href: `/${lang}/teacher/chat` },
            ].map(a => (
              <a key={a.href} href={a.href} className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all group">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                <span className="text-sm font-medium">{a.label}</span>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
