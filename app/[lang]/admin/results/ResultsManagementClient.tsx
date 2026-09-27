'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Award, Download, Eye, FileCheck, TrendingUp, Users } from 'lucide-react'
import { toast } from 'sonner'

type Exam = {
  id: string
  name_en: string
  name_ur: string | null
  exam_type: string
  start_date: string
}

type Class = {
  id: string
  name_en: string
  name_ur: string | null
}

type Result = {
  id: string
  total_marks_obtained: number
  total_marks_max: number
  percentage: number
  grade: string
  position: number
  is_pass: boolean
  student: {
    name_en: string
    name_ur: string | null
    admission_number: string
  }
}

export default function ResultsManagementClient({
  exams,
  classes,
  isRtl,
}: {
  exams: Exam[]
  classes: Class[]
  isRtl: boolean
}) {
  const [selectedExam, setSelectedExam] = useState<string>('')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    passed: 0,
    failed: 0,
    avgPercentage: 0,
  })

  const supabase = createClient()

  const loadResults = async () => {
    if (!selectedExam || !selectedClass) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('results')
        .select(`
          *,
          student:students!inner(name_en, name_ur, admission_number)
        `)
        .eq('exam_id', selectedExam)
        .eq('class_id', selectedClass)
        .order('position', { ascending: true })

      if (error) throw error

      setResults(data || [])

      // Calculate stats
      const total = data?.length || 0
      const passed = data?.filter((r) => r.is_pass).length || 0
      const failed = total - passed
      const avgPercentage = total > 0 ? data.reduce((sum, r) => sum + Number(r.percentage), 0) / total : 0

      setStats({ total, passed, failed, avgPercentage })
    } catch (error: any) {
      toast.error(error.message || 'Failed to load results')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selectedExam && selectedClass) {
      loadResults()
    }
  }, [selectedExam, selectedClass])

  const handleCalculateResults = async () => {
    if (!selectedExam) {
      toast.error(isRtl ? 'براہ کرم امتحان منتخب کریں' : 'Please select an exam')
      return
    }

    setCalculating(true)
    try {
      const response = await fetch('/api/results/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: selectedExam }),
      })

      if (!response.ok) throw new Error('Failed to calculate results')

      toast.success(isRtl ? 'نتائج کی گنتی مکمل' : 'Results calculated successfully')
      loadResults()
    } catch (error: any) {
      toast.error(error.message || 'Failed to calculate results')
    } finally {
      setCalculating(false)
    }
  }

  const handlePublishResults = async () => {
    if (!selectedExam) return

    if (!confirm(isRtl ? 'کیا آپ واقعی نتائج شائع کرنا چاہتے ہیں؟' : 'Are you sure you want to publish results?')) {
      return
    }

    try {
      const response = await fetch('/api/results/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ examId: selectedExam }),
      })

      if (!response.ok) throw new Error('Failed to publish results')

      toast.success(isRtl ? 'نتائج شائع ہو گئے' : 'Results published successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish results')
    }
  }

  const handleDownloadResults = async () => {
    toast.info(isRtl ? 'PDF ڈاؤن لوڈ جلد آ رہا ہے' : 'PDF download coming soon')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isRtl ? 'نتائج کا انتظام' : 'Results Management'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isRtl ? 'نتائج کی گنتی، تصدیق اور اشاعت' : 'Calculate, verify, and publish examination results'}
          </p>
        </div>
      </div>

      {/* Selection Controls */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle>{isRtl ? 'امتحان اور کلاس منتخب کریں' : 'Select Exam & Class'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Select value={selectedExam} onValueChange={setSelectedExam}>
                <SelectTrigger>
                  <SelectValue placeholder={isRtl ? 'امتحان منتخب کریں' : 'Select exam'} />
                </SelectTrigger>
                <SelectContent>
                  {exams.map((exam) => (
                    <SelectItem key={exam.id} value={exam.id}>
                      {exam.name_en} {exam.name_ur && `(${exam.name_ur})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder={isRtl ? 'کلاس منتخب کریں' : 'Select class'} />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name_en} {cls.name_ur && `(${cls.name_ur})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleCalculateResults} disabled={calculating || !selectedExam} className="gap-2">
                <FileCheck className="w-4 h-4" />
                {calculating ? (isRtl ? 'گنتی ہو رہی ہے...' : 'Calculating...') : isRtl ? 'نتائج شمار کریں' : 'Calculate'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      {results.length > 0 && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-primary/15 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isRtl ? 'کل طلباء' : 'Total Students'}
              </CardTitle>
              <Users className="w-4 h-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-primary/15 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isRtl ? 'کامیاب' : 'Passed'}
              </CardTitle>
              <Award className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats.passed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/15 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isRtl ? 'ناکام' : 'Failed'}
              </CardTitle>
              <Award className="w-4 h-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.failed}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.total > 0 ? ((stats.failed / stats.total) * 100).toFixed(1) : 0}%
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/15 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {isRtl ? 'اوسط فیصد' : 'Avg Percentage'}
              </CardTitle>
              <TrendingUp className="w-4 h-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.avgPercentage.toFixed(2)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Results Table */}
      {loading && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{isRtl ? 'لوڈ ہو رہا ہے...' : 'Loading results...'}</p>
          </CardContent>
        </Card>
      )}

      {!loading && results.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{isRtl ? 'کلاس کے نتائج' : 'Class Results'}</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleDownloadResults} className="gap-2">
                <Download className="w-4 h-4" />
                {isRtl ? 'PDF ڈاؤن لوڈ' : 'Download PDF'}
              </Button>
              <Button onClick={handlePublishResults} size="sm" className="gap-2">
                <Eye className="w-4 h-4" />
                {isRtl ? 'نتائج شائع کریں' : 'Publish Results'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left">{isRtl ? 'پوزیشن' : 'Position'}</th>
                    <th className="p-3 text-left">{isRtl ? 'داخلہ نمبر' : 'Admission #'}</th>
                    <th className="p-3 text-left">{isRtl ? 'طالب علم' : 'Student Name'}</th>
                    <th className="p-3 text-center">{isRtl ? 'حاصل شدہ نمبر' : 'Marks Obtained'}</th>
                    <th className="p-3 text-center">{isRtl ? 'کل نمبر' : 'Total Marks'}</th>
                    <th className="p-3 text-center">{isRtl ? 'فیصد' : 'Percentage'}</th>
                    <th className="p-3 text-center">{isRtl ? 'گریڈ' : 'Grade'}</th>
                    <th className="p-3 text-center">{isRtl ? 'نتیجہ' : 'Result'}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={result.id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          {result.position <= 3 && (
                            <span className="text-lg">
                              {result.position === 1 ? '🥇' : result.position === 2 ? '🥈' : '🥉'}
                            </span>
                          )}
                          <span className="font-semibold">{result.position}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-muted-foreground">{result.student.admission_number}</td>
                      <td className="p-3">
                        <div className="font-medium">{result.student.name_en}</div>
                        {result.student.name_ur && (
                          <div className="text-xs text-muted-foreground" dir="rtl">
                            {result.student.name_ur}
                          </div>
                        )}
                      </td>
                      <td className="p-3 text-center font-semibold">{result.total_marks_obtained}</td>
                      <td className="p-3 text-center">{result.total_marks_max}</td>
                      <td className="p-3 text-center font-bold">{Number(result.percentage).toFixed(2)}%</td>
                      <td className="p-3 text-center">
                        <span className="px-2 py-1 rounded bg-primary/10 text-primary font-medium text-sm">
                          {result.grade}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`font-semibold ${
                            result.is_pass ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {result.is_pass ? (isRtl ? 'کامیاب' : 'PASS') : (isRtl ? 'ناکام' : 'FAIL')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && results.length === 0 && selectedExam && selectedClass && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Award className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {isRtl ? 'کوئی نتائج نہیں ملے' : 'No Results Found'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {isRtl
                ? 'اس کلاس کے لیے نتائج ابھی تک شمار نہیں کیے گئے'
                : 'Results have not been calculated yet for this class'}
            </p>
            <Button onClick={handleCalculateResults} disabled={calculating} className="gap-2">
              <FileCheck className="w-4 h-4" />
              {isRtl ? 'نتائج شمار کریں' : 'Calculate Results Now'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
