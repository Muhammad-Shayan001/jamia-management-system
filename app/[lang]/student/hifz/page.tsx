import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { getHifzProgressForStudent } from '@/lib/actions/hifz'

export default async function StudentHifzPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const progress = await getHifzProgressForStudent()

  const completed = progress.filter((p: any) => p.hifz_status === 'completed').length
  const total = 114

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary" /> My Hifz Progress
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Track your Quran memorization journey</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-primary/10 shadow-sm bg-primary text-primary-foreground">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium opacity-90">Completed Surahs</h3>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-4xl font-bold">{completed}</span>
              <span className="text-sm opacity-80">/ {total}</span>
            </div>
            <div className="w-full bg-black/20 h-2 rounded-full mt-4 overflow-hidden">
              <div className="bg-white h-full" style={{ width: `${(completed/total)*100}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardHeader className="pb-3 border-b bg-muted/20">
          <CardTitle className="text-base">Tracked Surahs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {progress.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Your teacher has not logged any Hifz progress for you yet.
            </div>
          ) : (
            <div className="divide-y">
              {progress.map((p: any) => (
                <div key={p.id} className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0 text-sm border border-primary/20">
                    {p.surah_number}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-semibold">{p.surahs?.name_en} <span className="font-normal text-muted-foreground text-sm ml-2">({p.surahs?.name_ar})</span></h4>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        p.hifz_status === 'completed' ? 'bg-green-100 text-green-700' :
                        p.hifz_status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {p.hifz_status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {p.hifz_status === 'in_progress' && <Clock className="w-3.5 h-3.5" />}
                        {p.hifz_status === 'revision_needed' && <AlertCircle className="w-3.5 h-3.5" />}
                        {p.hifz_status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    
                    {(p.nazira_rating || p.tajweed_notes) && (
                      <div className="mt-3 bg-muted/30 p-3 rounded-lg text-sm space-y-2 border border-border/50">
                        {p.nazira_rating && (
                          <p><span className="text-muted-foreground">Nazira Rating:</span> <span className="font-medium text-amber-600">{'⭐'.repeat(p.nazira_rating)}</span></p>
                        )}
                        {p.tajweed_notes && (
                          <p><span className="text-muted-foreground">Tajweed Notes:</span> {p.tajweed_notes}</p>
                        )}
                      </div>
                    )}
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
