import { createClient } from '@/lib/supabase/server'
import { getDictionary } from '@/lib/dictionaries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckSquare } from 'lucide-react'

export default async function TeacherResultsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const supabase = await createClient()

  // In a real app, this would filter by the teacher's ID
  const { data: exams } = await (supabase
    .from('exams')
    .select(`
      *,
      classes ( name_en, name_ur )
    `)
    .order('created_at', { ascending: false })) as any

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">{dict.nav.results}</h2>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">Recent Exams</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {exams?.length ? (
            <div className="space-y-4">
              {(exams as any[]).map((exam) => (
                <div key={exam.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border bg-muted/20 gap-4">
                  <div>
                    <h4 className="font-semibold text-primary">
                      {lang === 'ur' && exam.name_ur ? exam.name_ur : exam.name_en}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                       Class: {lang === 'ur' && exam.classes?.name_ur ? exam.classes?.name_ur : exam.classes?.name_en}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Date: {exam.exam_date ? new Date(exam.exam_date).toLocaleDateString() : 'TBD'}
                    </p>
                  </div>
                   <div className="flex flex-col items-start sm:items-end gap-2">
                      <Badge variant="outline" className="capitalize">
                        {exam.type.replace('_', ' ')}
                      </Badge>
                       <p className="text-sm font-medium">
                         Total Marks: {exam.total_marks} | Passing: {exam.passing_marks}
                       </p>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <CheckSquare className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No exams found</p>
              <p className="text-xs mt-1">Exams assigned to your classes will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
