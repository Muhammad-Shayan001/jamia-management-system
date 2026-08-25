import { createClient } from '@/lib/supabase/server'
import { getDictionary } from '@/lib/dictionaries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { FileText } from 'lucide-react'

export default async function StudentResultsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: student } = await (supabase
    .from('students')
    .select('id, name_en')
    .eq('profile_id', user?.id ?? '')
    .maybeSingle()) as any

  const { data: results } = await (supabase
    .from('results')
    .select(`
      marks_obtained, grade, is_absent,
      subjects ( name_en, name_ur ),
      exams ( name_en, exam_date, total_marks, passing_marks, type )
    `)
    .eq('student_id', student?.id ?? '')
    .order('created_at', { ascending: false })) as any

  const gradeColor: Record<string, string> = {
    'A+': 'bg-emerald-500', A: 'bg-green-500', 'B+': 'bg-teal-500',
    B: 'bg-blue-500', C: 'bg-amber-500', D: 'bg-orange-500', F: 'bg-red-500',
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold tracking-tight">{dict.nav.results}</h2>

      {results?.length ? (
        <div className="space-y-4">
          {(results as any[]).map((r, i) => {
            const pct = r.exams?.total_marks > 0
              ? Math.round((r.marks_obtained / r.exams.total_marks) * 100)
              : 0
            const passed = r.marks_obtained >= (r.exams?.passing_marks ?? 40)
            return (
              <Card key={i} className="border-primary/10 shadow-sm">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <CardTitle className="text-base">
                      {lang === 'ur' && r.subjects?.name_ur ? r.subjects.name_ur : r.subjects?.name_en}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      {r.grade && (
                        <Badge className={`${gradeColor[r.grade] ?? 'bg-gray-400'} text-white`}>{r.grade}</Badge>
                      )}
                      <Badge variant={passed ? 'default' : 'destructive'}>
                        {passed ? 'Pass' : 'Fail'}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {r.exams?.name_en} • {r.exams?.exam_date ? new Date(r.exams.exam_date).toLocaleDateString() : ''}
                  </p>
                </CardHeader>
                <CardContent>
                  {r.is_absent ? (
                    <p className="text-sm text-muted-foreground italic">Absent</p>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-2xl font-bold">{r.marks_obtained}</span>
                        <span className="text-muted-foreground">/{r.exams?.total_marks}</span>
                      </div>
                      {/* Progress bar */}
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${passed ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{pct}%</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="border-primary/10 shadow-sm">
          <CardContent className="py-16 text-center text-muted-foreground">
            <FileText className="w-10 h-10 mx-auto mb-3 opacity-20" />
            <p className="font-medium">No results published yet</p>
            <p className="text-xs mt-1">Your teacher will publish results after exams are marked.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
