import { createClient } from '@/lib/supabase/server'
import { getDictionary } from '@/lib/dictionaries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, FileText, Wallet, Bell } from 'lucide-react'

export default async function StudentDashboard({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const supabase = await createClient()

  const { data: announcements } = await (supabase
    .from('announcements')
    .select('id, title_en, title_ur, body_en, body_ur, created_at')
    .order('created_at', { ascending: false })
    .limit(3)) as any

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{dict.nav.dashboard}</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {new Date().toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Attendance', value: '92%', icon: Calendar, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950' },
          { label: 'Results', value: 'B+', icon: FileText, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
          { label: 'Fee Status', value: 'Paid', icon: Wallet, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'New Notices', value: announcements?.length ?? 0, icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950' },
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

      {/* Announcements */}
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Announcements</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {announcements?.length ? (
            <div className="space-y-4">
              {(announcements as any[]).map((a) => (
                <div key={a.id} className="p-4 rounded-lg border border-border bg-muted/20">
                  <h4 className="font-semibold text-primary">
                    {lang === 'ur' && a.title_ur ? a.title_ur : a.title_en}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lang === 'ur' && a.body_ur ? a.body_ur : a.body_en}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(a.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No announcements</p>
              <p className="text-xs mt-1">Check back later for updates from your institution.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
