import { createClient } from '@/lib/supabase/server'
import { getDictionary } from '@/lib/dictionaries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar } from 'lucide-react'

export default async function StudentAttendancePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Get student record linked to this auth user
  const { data: student } = await (supabase
    .from('students')
    .select('id, name_en, name_ur, admission_number, class_id')
    .eq('profile_id', user?.id ?? '')
    .maybeSingle()) as any

  // Get attendance for this student
  const { data: attendance } = await (supabase
    .from('attendance')
    .select('date, status, period')
    .eq('student_id', student?.id ?? '')
    .order('date', { ascending: false })
    .limit(30)) as any

  const totalDays = attendance?.length ?? 0
  const presentDays = attendance?.filter((a: any) => a.status === 'present').length ?? 0
  const percentage = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0

  const statusColor: Record<string, string> = {
    present: 'bg-green-500',
    absent: 'bg-red-500',
    late: 'bg-amber-500',
    excused: 'bg-blue-500',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{dict.nav.attendance}</h2>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Present', value: presentDays, color: 'text-green-600' },
          { label: 'Absent', value: totalDays - presentDays, color: 'text-red-600' },
          { label: 'Percentage', value: `${percentage}%`, color: percentage >= 75 ? 'text-green-600' : 'text-red-600' },
        ].map((s, i) => (
          <Card key={i} className="border-primary/10 shadow-sm text-center">
            <CardContent className="pt-6">
              <div className={`text-4xl font-bold ${s.color}`}>{s.value}</div>
              <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Attendance Log */}
      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Attendance Record (Last 30 entries)</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {attendance?.length ? (
            <div className="space-y-2">
              {(attendance as any[]).map((a, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <span className="text-sm font-medium">{new Date(a.date).toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <Badge className={`${statusColor[a.status] ?? 'bg-gray-400'} text-white capitalize`}>
                    {a.status}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No attendance records yet</p>
              <p className="text-xs mt-1">Records will appear once your teacher marks attendance.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
