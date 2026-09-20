import { createClient } from '@/lib/supabase/server'
import { getDictionary } from '@/lib/dictionaries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, GraduationCap, Wallet, Bell, Building2, BookOpen } from 'lucide-react'
import Link from 'next/link'

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

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight mb-2">{dict.nav.dashboard}</h2>
        <p className="text-muted-foreground">Select a management area to continue.</p>
      </div>

      {/* Main Section Entry Points */}
      <div className="grid md:grid-cols-2 gap-6">
        <Link href={`/${lang}/admin/campus/fees`}>
          <Card className="hover:shadow-lg transition-all cursor-pointer border-primary/20 hover:border-primary group h-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Building2 className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl group-hover:text-primary transition-colors">Campus & Finance</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage fees, ID cards, institutional announcements, and accountant/receptionist accounts.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/${lang}/admin/lms/classes`}>
          <Card className="hover:shadow-lg transition-all cursor-pointer border-primary/20 hover:border-primary group h-full">
            <CardHeader>
              <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <CardTitle className="text-2xl group-hover:text-primary transition-colors">Learning Management System</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Manage classes, students, teachers, attendance, timetable, results, and digital library.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="border-primary/10 shadow-sm">
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
    </div>
  )
}
