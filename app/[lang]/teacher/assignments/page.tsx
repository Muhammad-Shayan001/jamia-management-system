import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ClipboardList, Plus, Users, Clock, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import { getAssignmentsForTeacher } from '@/lib/actions/assignments'
import { AssignmentActions } from './AssignmentActions'

export default async function TeacherAssignmentsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const assignments = await getAssignmentsForTeacher()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Assignments</h2>
          <p className="text-muted-foreground text-sm mt-1">Create and manage homework for your classes</p>
        </div>
        <Link href={`/${lang}/teacher/assignments/new`}>
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
            <Plus className="w-4 h-4 mr-2" /> New Assignment
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Total', value: assignments.length, icon: ClipboardList, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-950' },
          { label: 'Published', value: assignments.filter((a: any) => a.is_published).length, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-950' },
          { label: 'Drafts', value: assignments.filter((a: any) => !a.is_published).length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950' },
        ].map((s) => (
          <Card key={s.label} className="border-primary/10 shadow-sm">
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`p-3 rounded-xl ${s.bg}`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <Card className="border-primary/10 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ClipboardList className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">No assignments yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first assignment to get started.</p>
            <Link href={`/${lang}/teacher/assignments/new`} className="mt-4">
              <Button size="sm">Create Assignment</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((a: any) => (
            <Card key={a.id} className="border-primary/10 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        a.is_published ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {a.is_published ? 'Published' : 'Draft'}
                      </span>
                      {a.classes && (
                        <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                          {a.classes.name_en}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-base">{a.title_en}</h3>
                    {a.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      {a.due_date && <span>Due: {new Date(a.due_date).toLocaleDateString()}</span>}
                      <span>Max Marks: {a.max_marks}</span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {a.assignment_submissions?.length || 0} submissions
                      </span>
                    </div>
                  </div>
                  <AssignmentActions assignmentId={a.id} isPublished={a.is_published} lang={lang} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
