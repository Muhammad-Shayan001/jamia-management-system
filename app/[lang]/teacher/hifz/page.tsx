import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'
import { getHifzProgressForClass } from '@/lib/actions/hifz'
import { ClassSelector } from './ClassSelector'
import { HifzUpdateForm } from './HifzUpdateForm'

export default async function TeacherHifzPage({
  params,
  searchParams
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ classId?: string }>
}) {
  const { lang } = await params
  const { classId } = await searchParams
  const supabase = await createClient()

  // For a real app, we'd filter classes by teacher assignment
  const { data: classes } = await (supabase.from('classes').select('id, name_en').order('level') as any)
  
  const selectedClassId = classId || (classes?.[0]?.id ?? '')
  const students = selectedClassId ? await getHifzProgressForClass(selectedClassId) : []

  // Pre-fetch surahs for the dropdown
  const { data: surahs } = await (supabase.from('surahs').select('number, name_en, name_ar').order('number') as any)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> Hifz & Tajweed Tracker
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Track Quran memorization progress for your students</p>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="py-4 border-b bg-muted/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="text-base">Select Class</CardTitle>
            <ClassSelector classes={classes || []} selectedId={selectedClassId} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {students.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-sm">
              No students found in this class.
            </div>
          ) : (
            <div className="divide-y">
              {students.map((student: any) => (
                <div key={student.id} className="p-4 sm:p-6 hover:bg-muted/10 transition-colors">
                  <div className="flex flex-col xl:flex-row gap-6">
                    <div className="xl:w-1/3 shrink-0">
                      <h3 className="font-semibold">{student.name_en}</h3>
                      <p className="text-sm text-muted-foreground">{student.name_ur}</p>
                      
                      <div className="mt-3 text-xs space-y-1">
                        <p className="font-medium text-primary">Current Progress:</p>
                        {student.hifz_progress?.length > 0 ? (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {student.hifz_progress.slice(0, 5).map((p: any) => (
                              <span key={p.surah_number} className={`px-1.5 py-0.5 rounded ${
                                p.hifz_status === 'completed' ? 'bg-green-100 text-green-700' :
                                p.hifz_status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-amber-100 text-amber-700'
                              }`}>
                                {p.surahs?.name_en}
                              </span>
                            ))}
                            {student.hifz_progress.length > 5 && (
                              <span className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground">+{student.hifz_progress.length - 5} more</span>
                            )}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No tracking data yet.</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1 bg-white dark:bg-card border rounded-lg p-4">
                      <h4 className="text-sm font-medium mb-3">Update Progress</h4>
                      <HifzUpdateForm studentId={student.id} surahs={surahs || []} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
