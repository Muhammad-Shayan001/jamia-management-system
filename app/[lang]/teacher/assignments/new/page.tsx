import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NewAssignmentForm } from './NewAssignmentForm'

export default async function NewAssignmentPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const supabase = await createClient()

  const [{ data: classes }, { data: subjects }] = await Promise.all([
    (supabase.from('classes').select('id, name_en').order('level') as any),
    (supabase.from('subjects').select('id, name_en, class_id').order('name_en') as any),
  ])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Create Assignment</h2>
        <p className="text-muted-foreground text-sm mt-1">Set a new assignment for your class</p>
      </div>
      <Card className="border-primary/10 shadow-sm">
        <CardContent className="p-6">
          <NewAssignmentForm classes={classes || []} subjects={subjects || []} lang={lang} />
        </CardContent>
      </Card>
    </div>
  )
}
