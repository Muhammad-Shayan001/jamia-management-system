import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClipboardList, Clock, CheckCircle2, Download } from 'lucide-react'
import { getAssignmentsForStudent } from '@/lib/actions/assignments'
import { Badge } from '@/components/ui/badge'
import { SubmitAssignmentForm } from './SubmitAssignmentForm'

export default async function StudentAssignmentsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const assignments = await getAssignmentsForStudent()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-primary" /> Assignments
        </h2>
        <p className="text-muted-foreground text-sm mt-1">View and submit your homework tasks</p>
      </div>

      {assignments.length === 0 ? (
        <Card className="border-primary/10 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">No assignments pending</p>
            <p className="text-sm text-muted-foreground mt-1">You're all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((a: any) => {
            const submission = a.assignment_submissions?.[0]
            const isSubmitted = !!submission?.submitted_at
            const isGraded = submission?.marks_obtained != null

            return (
              <Card key={a.id} className="border-primary/10 shadow-sm overflow-hidden flex flex-col md:flex-row">
                {/* Assignment Details */}
                <div className="flex-1 p-4 sm:p-6 border-b md:border-b-0 md:border-r border-border/50">
                  <div className="flex items-center gap-2 mb-2">
                    {a.subjects && <Badge variant="outline" className="text-xs bg-muted/50">{a.subjects.name_en}</Badge>}
                    {isGraded ? (
                      <Badge className="bg-green-100 text-green-700 text-xs">Graded</Badge>
                    ) : isSubmitted ? (
                      <Badge className="bg-blue-100 text-blue-700 text-xs">Submitted</Badge>
                    ) : (
                      <Badge className="bg-amber-100 text-amber-700 text-xs">Pending</Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-lg">{lang === 'ur' && a.title_ur ? a.title_ur : a.title_en}</h3>
                  {a.description && (
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{a.description}</p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-sm font-medium text-muted-foreground">
                    {a.due_date && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Due: {new Date(a.due_date).toLocaleDateString()}</span>}
                    <span>Max Marks: {a.max_marks}</span>
                    {a.file_url && (
                      <a href={a.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-primary hover:underline">
                        <Download className="w-4 h-4" /> Attachment
                      </a>
                    )}
                  </div>
                </div>

                {/* Action Area */}
                <div className="w-full md:w-[320px] shrink-0 bg-muted/20 p-4 sm:p-6 flex flex-col justify-center">
                  {isGraded ? (
                    <div className="text-center">
                      <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">Marks Obtained</p>
                      <p className="text-3xl font-bold text-primary">{submission.marks_obtained} <span className="text-lg font-normal text-muted-foreground">/ {a.max_marks}</span></p>
                      {submission.feedback && (
                        <div className="mt-3 bg-white dark:bg-card p-3 rounded border text-sm text-left">
                          <span className="font-semibold block mb-1">Feedback:</span>
                          {submission.feedback}
                        </div>
                      )}
                    </div>
                  ) : isSubmitted ? (
                    <div className="text-center">
                      <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-50" />
                      <p className="font-medium">Submitted for grading</p>
                      <p className="text-xs text-muted-foreground mt-1">on {new Date(submission.submitted_at).toLocaleDateString()}</p>
                    </div>
                  ) : (
                    <div>
                      <h4 className="font-medium text-sm mb-3">Submit Assignment</h4>
                      <SubmitAssignmentForm assignmentId={a.id} />
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
