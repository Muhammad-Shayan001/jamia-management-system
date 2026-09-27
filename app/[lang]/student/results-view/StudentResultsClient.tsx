'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Award, Download, TrendingUp, Trophy } from 'lucide-react'
import { toast } from 'sonner'

type Student = {
  id: string
  name_en: string
  name_ur: string | null
  admission_number: string
  class_id: string
}

type Result = {
  id: string
  total_marks_obtained: number
  total_marks_max: number
  percentage: number
  grade: string
  position: number
  is_pass: boolean
  exam: {
    name_en: string
    name_ur: string | null
    exam_type: string
  }
}

export default function StudentResultsClient({
  student,
  results,
  isRtl,
}: {
  student: Student
  results: Result[]
  isRtl: boolean
}) {
  const handleDownloadResult = (resultId: string) => {
    toast.info(isRtl ? 'نتائج کا PDF ڈاؤن لوڈ جلد آ رہا ہے' : 'Result PDF download coming soon')
  }

  const getResultStats = () => {
    if (results.length === 0) return { avgPercentage: 0, totalPassed: 0, totalFailed: 0 }

    const totalPassed = results.filter((r) => r.is_pass).length
    const totalFailed = results.length - totalPassed
    const avgPercentage = results.reduce((sum, r) => sum + Number(r.percentage), 0) / results.length

    return { avgPercentage, totalPassed, totalFailed }
  }

  const stats = getResultStats()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground shadow-lg border border-accent/20">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
            <Award className="w-8 h-8 text-accent" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">{student.name_en}</h2>
            {student.name_ur && (
              <p className="text-primary-foreground/80" dir="rtl">
                {student.name_ur}
              </p>
            )}
            <p className="text-sm text-primary-foreground/70 mt-1">
              {isRtl ? 'داخلہ نمبر' : 'Admission Number'}: {student.admission_number}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {results.length > 0 && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-primary/15 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isRtl ? 'اوسط فیصد' : 'Average Percentage'}
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avgPercentage.toFixed(2)}%</div>
            </CardContent>
          </Card>

          <Card className="border-primary/15 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isRtl ? 'کامیابیاں' : 'Passed Exams'}
              </CardTitle>
              <Trophy className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.totalPassed}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/15 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isRtl ? 'کل امتحانات' : 'Total Exams'}
              </CardTitle>
              <Award className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{results.length}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">
          {isRtl ? 'تمام نتائج' : 'All Results'}
        </h3>

        {results.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Award className="w-16 h-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {isRtl ? 'ابھی کوئی نتائج نہیں' : 'No Results Yet'}
              </h3>
              <p className="text-muted-foreground text-center">
                {isRtl
                  ? 'آپ کے نتائج شائع ہونے کے بعد یہاں دکھائی دیں گے'
                  : 'Your results will appear here once they are published'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {results.map((result) => (
              <Card
                key={result.id}
                className={`hover:shadow-md transition-shadow ${
                  result.is_pass ? 'border-green-200 dark:border-green-900' : 'border-red-200 dark:border-red-900'
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h4 className="text-lg font-semibold">{result.exam.name_en}</h4>
                        {result.exam.name_ur && (
                          <span className="text-sm text-muted-foreground" dir="rtl">
                            ({result.exam.name_ur})
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium uppercase">
                          {result.exam.exam_type}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">{isRtl ? 'حاصل شدہ نمبر' : 'Marks Obtained'}</p>
                          <p className="text-xl font-bold">{result.total_marks_obtained}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{isRtl ? 'کل نمبر' : 'Total Marks'}</p>
                          <p className="text-xl font-bold">{result.total_marks_max}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{isRtl ? 'فیصد' : 'Percentage'}</p>
                          <p className="text-xl font-bold text-blue-600">{Number(result.percentage).toFixed(2)}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">{isRtl ? 'گریڈ' : 'Grade'}</p>
                          <p className="text-xl font-bold text-accent">{result.grade}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          {result.position <= 3 && (
                            <span className="text-2xl">
                              {result.position === 1 ? '🥇' : result.position === 2 ? '🥈' : '🥉'}
                            </span>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {isRtl ? 'پوزیشن' : 'Position'}: <span className="font-semibold">{result.position}</span>
                          </span>
                        </div>

                        <div
                          className={`px-3 py-1 rounded-full font-semibold text-sm ${
                            result.is_pass
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          }`}
                        >
                          {result.is_pass ? (isRtl ? '✓ کامیاب' : '✓ PASSED') : (isRtl ? '✗ ناکام' : '✗ FAILED')}
                        </div>
                      </div>
                    </div>

                    <Button variant="outline" size="sm" onClick={() => handleDownloadResult(result.id)} className="gap-2">
                      <Download className="w-4 h-4" />
                      {isRtl ? 'ڈاؤن لوڈ' : 'Download'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
