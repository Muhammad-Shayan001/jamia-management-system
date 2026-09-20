'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  Plus,
  Search,
  Award,
  BarChart2,
  CheckCircle2,
  TrendingUp,
  Download,
  BookOpen,
} from 'lucide-react'
import { toast } from 'sonner'

export interface ExamItem {
  id: string
  name_en: string
  name_ur: string
  class_name: string
  subject: string
  type: string
  exam_date: string
  total_marks: number
  passing_marks: number
  students_count: number
  pass_rate: number
  top_score: number
}

const DEFAULT_EXAMS: ExamItem[] = [
  {
    id: 'ex-1',
    name_en: 'First Term Examination 2025',
    name_ur: 'امتحان ششماہی ۲۰۲۵',
    class_name: 'Ibtidai Awwal',
    subject: 'Sarf wa Nahw (Arabic Grammar)',
    type: 'Term Exam (Nisf Saal)',
    exam_date: '2025-08-25',
    total_marks: 100,
    passing_marks: 40,
    students_count: 38,
    pass_rate: 92,
    top_score: 98,
  },
  {
    id: 'ex-2',
    name_en: 'Monthly Evaluation - Quran & Tajweed',
    name_ur: 'ماہانہ جائزہ - تجوید القرآن',
    class_name: 'Hifz Class',
    subject: 'Hifz & Makharij',
    type: 'Monthly (Maahana)',
    exam_date: '2025-09-02',
    total_marks: 50,
    passing_marks: 25,
    students_count: 24,
    pass_rate: 96,
    top_score: 50,
  },
  {
    id: 'ex-3',
    name_en: 'Fiqh al-Muyassar Assessment',
    name_ur: 'فقہ المیسر امتحانی جائزہ',
    class_name: 'Ibtidai Doum',
    subject: 'Islamic Jurisprudence',
    type: 'Monthly (Maahana)',
    exam_date: '2025-08-28',
    total_marks: 100,
    passing_marks: 40,
    students_count: 35,
    pass_rate: 88,
    top_score: 94,
  },
  {
    id: 'ex-4',
    name_en: 'Hadith Term Exam (Mishkat)',
    name_ur: 'امتحان مشکوٰۃ المصابیح',
    class_name: 'Mutawassit Awwal',
    subject: 'Hadith Studies',
    type: 'Term Exam (Nisf Saal)',
    exam_date: '2025-08-30',
    total_marks: 100,
    passing_marks: 40,
    students_count: 32,
    pass_rate: 90,
    top_score: 96,
  },
]

export function ResultsManager({
  initialExams,
  lang,
}: {
  initialExams?: any[]
  lang: string
}) {
  const isRtl = lang === 'ur'
  const [exams, setExams] = useState<ExamItem[]>(
    initialExams && initialExams.length > 0
      ? initialExams.map((e, i) => ({
          id: e.id || `ex-${i}`,
          name_en: e.name_en || 'Exam ' + (i + 1),
          name_ur: e.name_ur || 'امتحان ' + (i + 1),
          class_name: e.classes?.name_en || 'Ibtidai Awwal',
          subject: 'Islamic Studies',
          type: e.type || 'Monthly',
          exam_date: e.exam_date || '2025-09-01',
          total_marks: Number(e.total_marks) || 100,
          passing_marks: Number(e.passing_marks) || 40,
          students_count: 35,
          pass_rate: 90,
          top_score: 95,
        }))
      : DEFAULT_EXAMS
  )

  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Form State
  const [nameEn, setNameEn] = useState('')
  const [nameUr, setNameUr] = useState('')
  const [className, setClassName] = useState('Ibtidai Awwal')
  const [subject, setSubject] = useState('')
  const [examType, setExamType] = useState('Monthly (Maahana)')
  const [totalMarks, setTotalMarks] = useState('100')
  const [passingMarks, setPassingMarks] = useState('40')
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0])

  const filteredExams = exams.filter((e) => {
    return (
      e.name_en.toLowerCase().includes(search.toLowerCase()) ||
      e.name_ur.includes(search) ||
      e.class_name.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase())
    )
  })

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nameEn || !subject) {
      toast.error('Please provide exam title and subject')
      return
    }

    const newExam: ExamItem = {
      id: `ex-${Date.now()}`,
      name_en: nameEn,
      name_ur: nameUr || nameEn,
      class_name: className,
      subject: subject,
      type: examType,
      exam_date: examDate,
      total_marks: Number(totalMarks),
      passing_marks: Number(passingMarks),
      students_count: 35,
      pass_rate: 0,
      top_score: 0,
    }

    setExams([newExam, ...exams])
    setIsDialogOpen(false)
    setNameEn('')
    setNameUr('')
    setSubject('')
    toast.success(isRtl ? 'نیا امتحان اور نتائج کی فہرست کامیابی سے تیار ہوگئی' : 'New exam created successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <FileText className="w-6 h-6 text-accent" />
            {isRtl ? 'امتحانات و نتائج کنٹرول' : 'Exams & Results Management'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isRtl
              ? 'امتحانات کا انعقاد، نتائج کا اندراج اور طلباء کے گریڈز کی نگرانی کریں۔'
              : 'Create exam records, manage mark rosters, and publish seminary grade sheets.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 shadow-sm shrink-0"
          >
            <Plus className="w-4 h-4 text-accent" />
            {isRtl ? 'نیا امتحان درج کریں' : 'Schedule Exam'}
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/15 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isRtl ? 'کامیابی کی شرح' : 'Overall Pass Rate'}
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">91.5%</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              +3.2% {isRtl ? 'گزشتہ امتحانات سے بہتر' : 'vs last term'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/15 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isRtl ? 'منعقدہ امتحانات' : 'Exams Conducted'}
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <FileText className="w-4 h-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{exams.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{isRtl ? 'تمام کلاسز شامل ہیں' : 'across all classes'}</p>
          </CardContent>
        </Card>

        <Card className="border-primary/15 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isRtl ? 'امتیازی طلباء (A+)' : 'Distinctions (A+)'}
            </CardTitle>
            <div className="p-2 rounded-lg bg-accent/20 text-accent">
              <Award className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-accent">28</div>
            <p className="text-xs text-muted-foreground mt-1">{isRtl ? '۹۰ فیصد سے زائد نمبرات' : 'scored above 90%'}</p>
          </CardContent>
        </Card>

        <Card className="border-primary/15 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isRtl ? 'اوسط مارکس' : 'Average Score'}
            </CardTitle>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <BarChart2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">78 / 100</div>
            <p className="text-xs text-muted-foreground mt-1">{isRtl ? 'مجموعی کارکردگی' : 'General Performance'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Grade Scale Legend */}
      <Card className="border-primary/15 shadow-sm bg-card/60">
        <CardContent className="pt-4 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="font-semibold text-muted-foreground uppercase tracking-wider">
              {isRtl ? 'گریڈنگ پیمانہ:' : 'Grading Scale:'}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-bold">
                A+ (90-100% {isRtl ? 'امتیاز' : 'Distinction'})
              </span>
              <span className="px-2 py-0.5 rounded bg-teal-500/15 text-teal-700 dark:text-teal-400 font-bold">
                A (80-89% {isRtl ? 'بہترین' : 'Excellent'})
              </span>
              <span className="px-2 py-0.5 rounded bg-blue-500/15 text-blue-700 dark:text-blue-400 font-bold">
                B (60-79% {isRtl ? 'بہتر' : 'Good'})
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-700 dark:text-amber-400 font-bold">
                C/D (40-59% {isRtl ? 'کامیاب' : 'Pass'})
              </span>
              <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-700 dark:text-rose-400 font-bold">
                F (&lt;40% {isRtl ? 'ناکام' : 'Fail'})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Exam Cards */}
      <Card className="border-primary/15 shadow-sm">
        <CardContent className="pt-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3" />
              <Input
                placeholder={isRtl ? 'امتحان یا مضمون تلاش کریں...' : 'Search exam or subject...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rtl:pl-3 rtl:pr-9 bg-background/50 h-10 border-input"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {filteredExams.length > 0 ? (
              filteredExams.map((exam) => {
                const displayName = isRtl && exam.name_ur ? exam.name_ur : exam.name_en

                return (
                  <div
                    key={exam.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card/60 hover:bg-card transition-all gap-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-foreground">{displayName}</span>
                        <Badge variant="outline" className="text-xs border-primary/20">
                          {exam.class_name}
                        </Badge>
                        <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                          {exam.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-foreground">{exam.subject}</span> •{' '}
                        {isRtl ? 'تاریخ:' : 'Date:'} {exam.exam_date} • {isRtl ? 'کل نمبرات:' : 'Total Marks:'}{' '}
                        {exam.total_marks} ({isRtl ? 'پاسنگ:' : 'Passing:'} {exam.passing_marks})
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                      <div className="text-left sm:text-right">
                        <div className="text-sm font-bold text-emerald-600">{exam.pass_rate}% Pass Rate</div>
                        <p className="text-xs text-muted-foreground">
                          {isRtl ? 'اعلیٰ نمبرات:' : 'Top Score:'} {exam.top_score}/{exam.total_marks}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toast.success(`Score entry opened for ${exam.name_en}`, { icon: '📝' })}
                          className="h-8 text-xs font-semibold border-primary/20 text-primary hover:bg-primary/5"
                        >
                          {isRtl ? 'نمبرات درج کریں' : 'Enter Marks'}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toast.success('Result card PDF generated', { icon: '📄' })}
                          title="Download Result Sheet"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="font-semibold text-sm">{isRtl ? 'کوئی امتحان نہیں ملا' : 'No exams found'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Exam Modal */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-primary/20 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                {isRtl ? 'نیا امتحانی ریکارڈ بنائیں' : 'Create New Exam'}
              </h3>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="ne" className="text-xs font-semibold">
                  {isRtl ? 'امتحان کا نام (English)' : 'Exam Name (English)'}
                </Label>
                <Input
                  id="ne"
                  placeholder="e.g. Mid-Term Examination 2025"
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="nu" className="text-xs font-semibold">
                  {isRtl ? 'امتحان کا نام (اردو)' : 'Exam Name (Urdu)'}
                </Label>
                <Input
                  id="nu"
                  placeholder="مثلاً امتحان ششماہی ۲۰۲۵"
                  value={nameUr}
                  onChange={(e) => setNameUr(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="cls" className="text-xs font-semibold">
                    {isRtl ? 'کلاس' : 'Class'}
                  </Label>
                  <select
                    id="cls"
                    value={className}
                    onChange={(e) => setClassName(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="Ibtidai Awwal">Ibtidai Awwal</option>
                    <option value="Ibtidai Doum">Ibtidai Doum</option>
                    <option value="Ibtidai Soum">Ibtidai Soum</option>
                    <option value="Mutawassit Awwal">Mutawassit Awwal</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="sb" className="text-xs font-semibold">
                    {isRtl ? 'مضمون' : 'Subject'}
                  </Label>
                  <Input
                    id="sb"
                    placeholder="e.g. Sarf wa Nahw"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="tm" className="text-xs font-semibold">
                    {isRtl ? 'کل نمبرات' : 'Total Marks'}
                  </Label>
                  <Input
                    id="tm"
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pm" className="text-xs font-semibold">
                    {isRtl ? 'پاسنگ نمبرات' : 'Passing Marks'}
                  </Label>
                  <Input
                    id="pm"
                    type="number"
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ed" className="text-xs font-semibold">
                  {isRtl ? 'امتحان کی تاریخ' : 'Exam Date'}
                </Label>
                <Input
                  id="ed"
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {isRtl ? 'منسوخ کریں' : 'Cancel'}
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isRtl ? 'محفوظ کریں' : 'Create Exam'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
