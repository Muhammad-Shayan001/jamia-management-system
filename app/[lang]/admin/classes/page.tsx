import { createClient } from '@/lib/supabase/server'
import { getDictionary } from '@/lib/dictionaries'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap } from 'lucide-react'

export default async function AdminClassesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const supabase = await createClient()

  const { data: classes } = await (supabase
    .from('classes')
    .select(`
      *,
      sessions ( name )
    `)
    .order('level', { ascending: true })) as any

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">{dict.nav.classes}</h2>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-primary" />
            <CardTitle className="text-base">All Classes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {classes?.length ? (
            <div className="space-y-4">
              {(classes as any[]).map((cls) => (
                <div key={cls.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-border bg-muted/20 gap-4">
                  <div>
                    <h4 className="font-semibold text-primary">
                      {lang === 'ur' && cls.name_ur ? cls.name_ur : cls.name_en}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1">
                       Session: {cls.sessions?.name}
                    </p>
                  </div>
                   <div className="flex flex-col items-start sm:items-end gap-2">
                       <p className="text-sm font-medium">
                         Level: {cls.level} | Capacity: {cls.capacity}
                       </p>
                   </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-10 text-muted-foreground">
              <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm font-medium">No classes found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
