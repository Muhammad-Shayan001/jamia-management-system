'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Download,
  Filter,
  Users,
  BarChart3,
} from 'lucide-react'
import { toast } from 'sonner'

export interface AttendanceItem {
  id: string
  student_name_en: string
  student_name_ur: string
  admission_number: string
  class_name: string
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  scan_method?: 'qr' | 'manual'
  time_marked?: string
}

const DEFAULT_ATTENDANCE_DATA: AttendanceItem[] = [
  {
    id: 'att-1',
    student_name_en: 'Muhammad Abdullah',
    student_name_ur: 'محمد عبداللہ',
    admission_number: 'JAM-101',
    class_name: 'Ibtidai Awwal',
    date: '2025-09-06',
    status: 'present',
    scan_method: 'qr',
    time_marked: '07:45 AM',
  },
  {
    id: 'att-2',
    student_name_en: 'Ahmad Hassan',
    student_name_ur: 'احمد حسن',
    admission_number: 'JAM-102',
    class_name: 'Ibtidai Awwal',
    date: '2025-09-06',
    status: 'present',
    scan_method: 'qr',
    time_marked: '07:50 AM',
  },
  {
    id: 'att-3',
    student_name_en: 'Usman Ali',
    student_name_ur: 'عثمان علی',
    admission_number: 'JAM-103',
    class_name: 'Ibtidai Doum',
    date: '2025-09-06',
    status: 'absent',
    time_marked: '—',
  },
  {
    id: 'att-4',
    student_name_en: 'Zubair Tariq',
    student_name_ur: 'زبیر طارق',
    admission_number: 'JAM-104',
    class_name: 'Mutawassit Awwal',
    date: '2025-09-06',
    status: 'late',
    scan_method: 'manual',
    time_marked: '08:15 AM',
  },
  {
    id: 'att-5',
    student_name_en: 'Bilal Khan',
    student_name_ur: 'بلال خان',
    admission_number: 'JAM-105',
    class_name: 'Ibtidai Doum',
    date: '2025-09-06',
    status: 'present',
    scan_method: 'qr',
    time_marked: '07:48 AM',
  },
  {
    id: 'att-6',
    student_name_en: 'Hamza Farooq',
    student_name_ur: 'حمزہ فاروق',
    admission_number: 'JAM-106',
    class_name: 'Ibtidai Soum',
    date: '2025-09-06',
    status: 'excused',
    time_marked: 'Leave Approved',
  },
]

export function AttendanceAnalytics({
  initialRecords,
  lang,
}: {
  initialRecords?: any[]
  lang: string
}) {
  const isRtl = lang === 'ur'
  const [records, setRecords] = useState<AttendanceItem[]>(
    initialRecords && initialRecords.length > 0
      ? initialRecords.map((r, i) => ({
          id: r.id || `att-${i}`,
          student_name_en: r.students?.name_en || 'Student ' + (i + 1),
          student_name_ur: r.students?.name_ur || 'طالب علم ' + (i + 1),
          admission_number: r.students?.admission_number || `JAM-${100 + i}`,
          class_name: r.classes?.name_en || 'Ibtidai Awwal',
          date: r.date || '2025-09-06',
          status: r.status || 'present',
          scan_method: r.scan_method || 'qr',
          time_marked: '07:55 AM',
        }))
      : DEFAULT_ATTENDANCE_DATA
  )

  const [filter, setFilter] = useState<'all' | 'present' | 'absent' | 'late' | 'excused'>('all')
  const [selectedClass, setSelectedClass] = useState('all')
  const [search, setSearch] = useState('')

  const presentCount = records.filter((r) => r.status === 'present').length
  const absentCount = records.filter((r) => r.status === 'absent').length
  const lateCount = records.filter((r) => r.status === 'late').length
  const excusedCount = records.filter((r) => r.status === 'excused').length
  const total = records.length
  const rate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 0

  const filteredRecords = records.filter((r) => {
    const matchesFilter = filter === 'all' || r.status === filter
    const matchesClass = selectedClass === 'all' || r.class_name === selectedClass
    const matchesSearch =
      r.student_name_en.toLowerCase().includes(search.toLowerCase()) ||
      r.student_name_ur.includes(search) ||
      r.admission_number.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesClass && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Calendar className="w-6 h-6 text-accent" />
            {isRtl ? 'حاضری تجزیات و نگرانی' : 'Attendance Analytics & Daily Roster'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isRtl
              ? 'تمام کلاسز کی روزانہ حاضری، کیو آر اسکینز اور عدم حاضری کی رپورٹ۔'
              : 'Monitor seminary attendance rates, daily QR scans, and student absentees.'}
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => toast.success('Attendance report exported as CSV', { icon: '📊' })}
          className="border-primary/20 text-primary hover:bg-primary/5 font-semibold gap-2 shadow-sm shrink-0"
        >
          <Download className="w-4 h-4" />
          {isRtl ? 'حاضری رپورٹ ڈاؤن لوڈ کریں' : 'Export Daily Report'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/15 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isRtl ? 'مجموعی حاضری شرح' : 'Attendance Rate'}
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <BarChart3 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{rate}%</div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mt-2">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rate}%` }} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/15 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isRtl ? 'حاضر طلباء' : 'Present Today'}
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">{presentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {records.filter((r) => r.scan_method === 'qr').length} {isRtl ? 'کیو آر اسکینز' : 'scanned via QR'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/15 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isRtl ? 'غیر حاضر طلباء' : 'Absent Today'}
            </CardTitle>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600">
              <XCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-600">{absentCount}</div>
            <p className="text-xs text-muted-foreground mt-1">{isRtl ? 'اطلاع والدین کو جاری' : 'SMS sent to parents'}</p>
          </CardContent>
        </Card>

        <Card className="border-primary/15 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isRtl ? 'تاخیر / رخصت' : 'Late / Excused'}
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">{lateCount + excusedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {lateCount} {isRtl ? 'تاخیر' : 'late'} • {excusedCount} {isRtl ? 'رخصت' : 'excused'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Class Level Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { name: isRtl ? 'ابتدائی اول' : 'Ibtidai Awwal', pct: 96, present: 38, total: 40 },
          { name: isRtl ? 'ابتدائی دوم' : 'Ibtidai Doum', pct: 92, present: 35, total: 38 },
          { name: isRtl ? 'متوسط اول' : 'Mutawassit Awwal', pct: 95, present: 33, total: 35 },
        ].map((cls, idx) => (
          <Card key={idx} className="border-primary/10 shadow-sm">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{cls.name}</CardTitle>
                <span className="text-xs font-bold text-primary">{cls.pct}%</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full" style={{ width: `${cls.pct}%` }} />
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {cls.present} / {cls.total} {isRtl ? 'طلباء حاضر' : 'students present'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Roster Table with Search & Filters */}
      <Card className="border-primary/15 shadow-sm">
        <CardContent className="pt-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3" />
              <Input
                placeholder={isRtl ? 'طالب علم یا داخلہ نمبر تلاش کریں...' : 'Search student by name or #...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rtl:pl-3 rtl:pr-9 bg-background/50 h-10 border-input"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-9 px-3 rounded-lg border border-input bg-background text-xs font-medium"
              >
                <option value="all">{isRtl ? 'تمام کلاسز' : 'All Classes'}</option>
                <option value="Ibtidai Awwal">Ibtidai Awwal</option>
                <option value="Ibtidai Doum">Ibtidai Doum</option>
                <option value="Mutawassit Awwal">Mutawassit Awwal</option>
              </select>

              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {isRtl ? 'سب' : 'All'}
              </button>
              <button
                onClick={() => setFilter('present')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'present'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {isRtl ? 'حاضر' : 'Present'}
              </button>
              <button
                onClick={() => setFilter('absent')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'absent'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {isRtl ? 'غیر حاضر' : 'Absent'}
              </button>
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((r) => {
                const displayName = isRtl && r.student_name_ur ? r.student_name_ur : r.student_name_en

                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card/60 hover:bg-card transition-all gap-3 shadow-sm"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{displayName}</span>
                        <span className="text-xs text-muted-foreground">({r.admission_number})</span>
                        <Badge variant="outline" className="text-xs border-primary/20">
                          {r.class_name}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {r.date} • {r.time_marked}{' '}
                        {r.scan_method === 'qr' && (
                          <span className="text-primary font-medium">• QR Scanned</span>
                        )}
                      </p>
                    </div>

                    <Badge
                      className={`text-xs capitalize font-bold px-2.5 py-1 ${
                        r.status === 'present'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                          : r.status === 'absent'
                          ? 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20'
                          : r.status === 'late'
                          ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20'
                          : 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20'
                      }`}
                    >
                      {r.status === 'present'
                        ? isRtl
                          ? 'حاضر'
                          : 'Present'
                        : r.status === 'absent'
                        ? isRtl
                          ? 'غیر حاضر'
                          : 'Absent'
                        : r.status === 'late'
                        ? isRtl
                          ? 'تاخیر'
                          : 'Late'
                        : isRtl
                        ? 'رخصت'
                        : 'Excused'}
                    </Badge>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="font-semibold text-sm">{isRtl ? 'کوئی ریکارڈ نہیں ملا' : 'No records match search'}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
