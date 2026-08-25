import { createClient } from '@/lib/supabase/server'
import { getDictionary } from '@/lib/dictionaries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, Wallet, Bell } from 'lucide-react'

export default async function AdminDashboard({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const supabase = await createClient()

  // Pull real counts — gracefully shows 0 if tables don't exist yet
  const [studentsResult, teachersResult, announcementsResult] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('teachers').select('*', { count: 'exact', head: true }),
    supabase.from('announcements').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { title: 'Total Students', value: studentsResult.count ?? 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
    { title: 'Total Teachers', value: teachersResult.count ?? 0, icon: GraduationCap, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950' },
    { title: 'Announcements', value: announcementsResult.count ?? 0, icon: Bell, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950' },
    { title: 'Fee Vouchers', value: 0, icon: Wallet, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-950' },
  ]

  // Recent announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('id, title_en, title_ur, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{dict.nav.dashboard}</h2>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="border-primary/10 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Recent Announcements */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent Announcements</CardTitle>
          </CardHeader>
          <CardContent>
            {announcements && announcements.length > 0 ? (
              <div className="space-y-3">
                {(announcements as any[]).map((ann) => (
                  <div key={ann.id} className="flex items-start gap-3 pb-3 border-b last:border-b-0">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{lang === 'ur' && ann.title_ur ? ann.title_ur : ann.title_en}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(ann.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No announcements yet.</p>
                <p className="text-xs mt-1">Post one from the Announcements page.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-primary/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: 'Add New Student', href: `/${lang}/admin/students` },
              { label: 'Post Announcement', href: `/${lang}/admin/announcements` },
              { label: 'View Timetable', href: `/${lang}/admin/timetable` },
              { label: 'Fee Vouchers', href: `/${lang}/admin/fees` },
            ].map((action) => (
              <a
                key={action.href}
                href={action.href}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-primary/5 border border-transparent hover:border-primary/10 transition-all group"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                <span className="text-sm font-medium">{action.label}</span>
              </a>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
