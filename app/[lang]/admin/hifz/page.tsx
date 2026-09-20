import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookMarked } from 'lucide-react'
import { getAllStudentsHifzSummary } from '@/lib/actions/hifz'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function AdminHifzPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const summaries = await getAllStudentsHifzSummary()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <BookMarked className="w-6 h-6 text-primary" /> Hifz Progress Overview
        </h2>
        <p className="text-muted-foreground text-sm mt-1">Institution-wide view of Quran memorization</p>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-primary/5">
              <TableRow>
                <TableHead className="w-[100px]">Adm No</TableHead>
                <TableHead>Student Name</TableHead>
                <TableHead>Class</TableHead>
                <TableHead className="text-center">Total Surahs Tracked</TableHead>
                <TableHead className="text-center">Completed</TableHead>
                <TableHead className="text-center">In Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No active students found.
                  </TableCell>
                </TableRow>
              ) : (
                summaries.map((s: any) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium text-xs text-muted-foreground">{s.admission_number}</TableCell>
                    <TableCell>
                      <span className="font-medium">{lang === 'ur' ? s.name_ur : s.name_en}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs font-normal">{s.classes?.name_en || 'None'}</Badge>
                    </TableCell>
                    <TableCell className="text-center">{s.totalTracked}</TableCell>
                    <TableCell className="text-center text-green-600 font-semibold">{s.completedSurahs}</TableCell>
                    <TableCell className="text-center text-blue-600">{s.inProgressSurahs}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
