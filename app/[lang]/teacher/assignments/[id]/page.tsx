import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSubmissionsForAssignment } from '@/lib/actions/assignments'
import { GradeForm } from './GradeForm'
import { ArrowLeft, ClipboardList, Users } from 'lucide-react'
import Link from 'next/link'

export default async function AssignmentDetailPage({
  params
}: {
  params: Promise<{ lang: string; id: string }>
}) {
  const { lang, id } = await params
  const supabase = await createClient()

  const { data: assignment } = await (supabase
    .from('assignments')
    .select('*, classes(name_en), subjects(name_en)')
    .eq('id', id)
    .single() as any)

  const submissions = await getSubmissionsForAssignment(id)

  if (!assignment) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Assignment not found.
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/${lang}/teacher/assignments`} className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{assignment.title_en}</h2>
          <div className="flex items-center gap-2 mt-1">
            {assignment.classes && <Badge variant="outline">{assignment.classes.name_en}</Badge>}
            {assignment.subjects && <Badge variant="outline">{assignment.subjects.name_en}</Badge>}
            <Badge className={assignment.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
              {assignment.is_published ? 'Published' : 'Draft'}
            </Badge>
          </div>
        </div>
      </div>

      {assignment.description && (
        <Card className="border-primary/10">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{assignment.description}</p>
          </CardContent>
        </Card>
      )}

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Submissions ({submissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {submissions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <ClipboardList className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No submissions yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((sub: any) => (
                <div key={sub.id} className="p-4 rounded-lg border border-border bg-muted/10">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-sm">{sub.students?.name_en}</p>
                      <p className="text-xs text-muted-foreground">{sub.students?.admission_number}</p>
                      {sub.note && <p className="text-sm mt-2 text-muted-foreground italic">{sub.note}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        Submitted: {new Date(sub.submitted_at).toLocaleString()}
                      </p>
                    </div>
                    <GradeForm
                      submissionId={sub.id}
                      maxMarks={assignment.max_marks}
                      currentMarks={sub.marks_obtained}
                      currentFeedback={sub.feedback}
                    />
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
