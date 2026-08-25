'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CalendarCheck, Printer, Plus, Clock, BookOpen, User, Building } from 'lucide-react'
import { toast } from 'sonner'

interface Slot {
  subject: string
  subject_ur: string
  teacher: string
  teacher_ur: string
  room: string
}

const CLASS_SCHEDULES: Record<
  string,
  {
    name_en: string
    name_ur: string
    grid: Record<string, (Slot | 'BREAK')[]>
  }
> = {
  '1': {
    name_en: 'Ibtidai Awwal (First Year)',
    name_ur: 'ابتدائی اول (سال اول)',
    grid: {
      Monday: [
        { subject: 'Hifz & Tajweed', subject_ur: 'تجوید و حفظ', teacher: 'Qari Abdur Rahman', teacher_ur: 'قاری عبد الرحمن', room: 'Hall A' },
        { subject: 'Sarf (Grammar)', subject_ur: 'علم الصرف', teacher: 'Mawlana Tariq', teacher_ur: 'مولانا طارق', room: 'Room 101' },
        { subject: 'Nahw (Syntax)', subject_ur: 'علم النحو', teacher: 'Mawlana Bilal', teacher_ur: 'مولانا بلال', room: 'Room 101' },
        'BREAK',
        { subject: 'Fiqh al-Muyassar', subject_ur: 'فقہ المیسر', teacher: 'Mufti Salman', teacher_ur: 'مفتی سلمان', room: 'Room 102' },
        { subject: 'Seerah & Adab', subject_ur: 'سیرت النبی و اخلاق', teacher: 'Mawlana Asim', teacher_ur: 'مولانا عاصم', room: 'Room 101' },
      ],
      Tuesday: [
        { subject: 'Hifz & Tajweed', subject_ur: 'تجوید و حفظ', teacher: 'Qari Abdur Rahman', teacher_ur: 'قاری عبد الرحمن', room: 'Hall A' },
        { subject: 'Sarf (Grammar)', subject_ur: 'علم الصرف', teacher: 'Mawlana Tariq', teacher_ur: 'مولانا طارق', room: 'Room 101' },
        { subject: 'Arabic Conversation', subject_ur: 'عربی بول چال', teacher: 'Mawlana Asim', teacher_ur: 'مولانا عاصم', room: 'Room 101' },
        'BREAK',
        { subject: 'Nahw Exercises', subject_ur: 'تمرین النحو', teacher: 'Mawlana Bilal', teacher_ur: 'مولانا بلال', room: 'Room 101' },
        { subject: 'Urdu Adab', subject_ur: 'اردو ادب و انشاء', teacher: 'Mawlana Zubair', teacher_ur: 'مولانا زبیر', room: 'Room 102' },
      ],
      Wednesday: [
        { subject: 'Hifz & Tajweed', subject_ur: 'تجوید و حفظ', teacher: 'Qari Abdur Rahman', teacher_ur: 'قاری عبد الرحمن', room: 'Hall A' },
        { subject: 'Sarf (Grammar)', subject_ur: 'علم الصرف', teacher: 'Mawlana Tariq', teacher_ur: 'مولانا طارق', room: 'Room 101' },
        { subject: 'Nahw (Syntax)', subject_ur: 'علم النحو', teacher: 'Mawlana Bilal', teacher_ur: 'مولانا بلال', room: 'Room 101' },
        'BREAK',
        { subject: 'Fiqh al-Muyassar', subject_ur: 'فقہ المیسر', teacher: 'Mufti Salman', teacher_ur: 'مفتی سلمان', room: 'Room 102' },
        { subject: 'Islamic History', subject_ur: 'تاریخ اسلام', teacher: 'Mawlana Zubair', teacher_ur: 'مولانا زبیر', room: 'Room 101' },
      ],
      Thursday: [
        { subject: 'Hifz & Tajweed', subject_ur: 'تجوید و حفظ', teacher: 'Qari Abdur Rahman', teacher_ur: 'قاری عبد الرحمن', room: 'Hall A' },
        { subject: 'Nahw (Syntax)', subject_ur: 'علم النحو', teacher: 'Mawlana Bilal', teacher_ur: 'مولانا بلال', room: 'Room 101' },
        { subject: 'Sarf Exercises', subject_ur: 'تمرین الصرف', teacher: 'Mawlana Tariq', teacher_ur: 'مولانا طارق', room: 'Room 101' },
        'BREAK',
        { subject: 'Fiqh al-Muyassar', subject_ur: 'فقہ المیسر', teacher: 'Mufti Salman', teacher_ur: 'مفتی سلمان', room: 'Room 102' },
        { subject: 'Weekly Speech Club', subject_ur: 'انجمن خطابت', teacher: 'Mawlana Asim', teacher_ur: 'مولانا عاصم', room: 'Auditorium' },
      ],
      Friday: [
        { subject: 'Surah Kahf Recitation', subject_ur: 'تلاوت سورۃ الکہف', teacher: 'Qari Abdur Rahman', teacher_ur: 'قاری عبد الرحمن', room: 'Mosque' },
        { subject: 'Sunnah & Adab', subject_ur: 'آداب نبوی', teacher: 'Mawlana Tariq', teacher_ur: 'مولانا طارق', room: 'Mosque' },
        { subject: 'Jumu\'ah Preparation', subject_ur: 'تیاری نماز جمعہ', teacher: 'All Staff', teacher_ur: 'تمام اساتذہ', room: 'Mosque' },
        'BREAK',
        { subject: 'Jumu\'ah Congregation', subject_ur: 'نماز جمعہ', teacher: 'Shaykh-ul-Hadith', teacher_ur: 'شیخ الحدیث', room: 'Jamia Mosque' },
        { subject: 'Special Lecture', subject_ur: 'خصوصی خطاب', teacher: 'Guest Scholar', teacher_ur: 'مہمان عالم', room: 'Auditorium' },
      ],
      Saturday: [
        { subject: 'Hifz Revision', subject_ur: 'دہرائی حفظ', teacher: 'Qari Abdur Rahman', teacher_ur: 'قاری عبد الرحمن', room: 'Hall A' },
        { subject: 'Sarf & Nahw Quiz', subject_ur: 'ہفتہ وار جائزہ', teacher: 'Mawlana Bilal', teacher_ur: 'مولانا بلال', room: 'Room 101' },
        { subject: 'Tajweed Oral Test', subject_ur: 'زبانی امتحان تجوید', teacher: 'Qari Abdur Rahman', teacher_ur: 'قاری عبد الرحمن', room: 'Hall A' },
        'BREAK',
        { subject: 'Calligraphy / Khushkhati', subject_ur: 'فن خطاطی', teacher: 'Ustad Khushkhat', teacher_ur: 'استاد خوشخط', room: 'Art Hall' },
        { subject: 'Physical Exercise / Sports', subject_ur: 'ورزش و کھیل', teacher: 'Coach', teacher_ur: 'نگران', room: 'Ground' },
      ],
    },
  },
  '2': {
    name_en: 'Ibtidai Doum (Second Year)',
    name_ur: 'ابتدائی دوم (سال دوم)',
    grid: {
      Monday: [
        { subject: 'Qudoori (Taharah)', subject_ur: 'مختصر القدوری (طہارت)', teacher: 'Mufti Salman', teacher_ur: 'مفتی سلمان', room: 'Room 103' },
        { subject: 'Kafiyah (Nahw)', subject_ur: 'الکافیۃ فی النحو', teacher: 'Mawlana Farooq', teacher_ur: 'مولانا فاروق', room: 'Room 103' },
        { subject: 'Riyad us-Saliheen', subject_ur: 'ریاض الصالحین', teacher: 'Mawlana Tariq', teacher_ur: 'مولانا طارق', room: 'Room 103' },
        'BREAK',
        { subject: 'Tareekh al-Islam', subject_ur: 'تاریخ الاسلام', teacher: 'Mawlana Zubair', teacher_ur: 'مولانا زبیر', room: 'Room 102' },
        { subject: 'Arabic Literature', subject_ur: 'الادب العربی', teacher: 'Mawlana Asim', teacher_ur: 'مولانا عاصم', room: 'Room 103' },
      ],
      Tuesday: [
        { subject: 'Qudoori (Salah)', subject_ur: 'مختصر القدوری (نماز)', teacher: 'Mufti Salman', teacher_ur: 'مفتی سلمان', room: 'Room 103' },
        { subject: 'Kafiyah (Nahw)', subject_ur: 'الکافیۃ فی النحو', teacher: 'Mawlana Farooq', teacher_ur: 'مولانا فاروق', room: 'Room 103' },
        { subject: 'Riyad us-Saliheen', subject_ur: 'ریاض الصالحین', teacher: 'Mawlana Tariq', teacher_ur: 'مولانا طارق', room: 'Room 103' },
        'BREAK',
        { subject: 'Mantiq (Logic)', subject_ur: 'تیسیر المنطق', teacher: 'Mawlana Asim', teacher_ur: 'مولانا عاصم', room: 'Room 103' },
        { subject: 'Arabic Composition', subject_ur: 'الانشاء العربی', teacher: 'Mawlana Farooq', teacher_ur: 'مولانا فاروق', room: 'Room 103' },
      ],
      Wednesday: [
        { subject: 'Qudoori (Salah)', subject_ur: 'مختصر القدوری', teacher: 'Mufti Salman', teacher_ur: 'مفتی سلمان', room: 'Room 103' },
        { subject: 'Kafiyah (Nahw)', subject_ur: 'الکافیۃ فی النحو', teacher: 'Mawlana Farooq', teacher_ur: 'مولانا فاروق', room: 'Room 103' },
        { subject: 'Riyad us-Saliheen', subject_ur: 'ریاض الصالحین', teacher: 'Mawlana Tariq', teacher_ur: 'مولانا طارق', room: 'Room 103' },
        'BREAK',
        { subject: 'Mantiq (Logic)', subject_ur: 'تیسیر المنطق', teacher: 'Mawlana Asim', teacher_ur: 'مولانا عاصم', room: 'Room 103' },
        { subject: 'Tafseer-ul-Quran', subject_ur: 'تفسیر القرآن', teacher: 'Mawlana Bilal', teacher_ur: 'مولانا بلال', room: 'Room 103' },
      ],
      Thursday: [
        { subject: 'Qudoori (Review)', subject_ur: 'تکرار قدوری', teacher: 'Mufti Salman', teacher_ur: 'مفتی سلمان', room: 'Room 103' },
        { subject: 'Kafiyah (Exercises)', subject_ur: 'تمرین کافیہ', teacher: 'Mawlana Farooq', teacher_ur: 'مولانا فاروق', room: 'Room 103' },
        { subject: 'Hadith Studies', subject_ur: 'حدیث مطالعہ', teacher: 'Mawlana Tariq', teacher_ur: 'مولانا طارق', room: 'Room 103' },
        'BREAK',
        { subject: 'Mantiq Debate', subject_ur: 'مناظرہ منطق', teacher: 'Mawlana Asim', teacher_ur: 'مولانا عاصم', room: 'Room 103' },
        { subject: 'Speech Club', subject_ur: 'بزم خطابت', teacher: 'Mawlana Asim', teacher_ur: 'مولانا عاصم', room: 'Auditorium' },
      ],
      Friday: [
        { subject: 'Recitation & Tajweed', subject_ur: 'تلاوت و تجوید', teacher: 'Qari Abdur Rahman', teacher_ur: 'قاری عبد الرحمن', room: 'Mosque' },
        { subject: 'Hadith Lecture', subject_ur: 'درس حدیث', teacher: 'Shaykh-ul-Hadith', teacher_ur: 'شیخ الحدیث', room: 'Mosque' },
        { subject: 'Jumu\'ah Preparation', subject_ur: 'تیاری جمعہ', teacher: 'All Staff', teacher_ur: 'اساتذہ', room: 'Mosque' },
        'BREAK',
        { subject: 'Jumu\'ah Congregation', subject_ur: 'نماز جمعہ', teacher: 'Shaykh-ul-Hadith', teacher_ur: 'شیخ الحدیث', room: 'Jamia Mosque' },
        { subject: 'Open Discussion', subject_ur: 'تربیتی نشست', teacher: 'Mufti Salman', teacher_ur: 'مفتی سلمان', room: 'Auditorium' },
      ],
      Saturday: [
        { subject: 'Weekly Test - Kafiyah', subject_ur: 'ہفتہ وار ٹیسٹ کافیہ', teacher: 'Mawlana Farooq', teacher_ur: 'مولانا فاروق', room: 'Room 103' },
        { subject: 'Weekly Test - Qudoori', subject_ur: 'ہفتہ وار ٹیسٹ قدوری', teacher: 'Mufti Salman', teacher_ur: 'مفتی سلمان', room: 'Room 103' },
        { subject: 'Library Research', subject_ur: 'مطالعہ کتب خانہ', teacher: 'Librarian', teacher_ur: 'ناظم لائبریری', room: 'Central Library' },
        'BREAK',
        { subject: 'Arabic Calligraphy', subject_ur: 'خوشخطی عربی', teacher: 'Ustad Khushkhat', teacher_ur: 'استاد خطاطی', room: 'Art Hall' },
        { subject: 'Sports & Archery', subject_ur: 'کھیل و تیر اندازی', teacher: 'Coach', teacher_ur: 'نگران', room: 'Sports Ground' },
      ],
    },
  },
}

const PERIOD_TIMES = [
  '08:00 - 08:45',
  '08:45 - 09:30',
  '09:30 - 10:15',
  'BREAK (10:15 - 10:45)',
  '10:45 - 11:30',
  '11:30 - 12:15',
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const DAYS_UR: Record<string, string> = {
  Monday: 'پیر',
  Tuesday: 'منگل',
  Wednesday: 'بدھ',
  Thursday: 'جمعرات',
  Friday: 'جمعہ',
  Saturday: 'ہفتہ',
}

export function AdminTimetableManager({ lang }: { lang: string }) {
  const isRtl = lang === 'ur'
  const [selectedClassKey, setSelectedClassKey] = useState<'1' | '2'>('1')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Slot Dialog state
  const [newDay, setNewDay] = useState('Monday')
  const [newSubject, setNewSubject] = useState('')
  const [newTeacher, setNewTeacher] = useState('')
  const [newRoom, setNewRoom] = useState('Room 101')

  const schedule = CLASS_SCHEDULES[selectedClassKey] || CLASS_SCHEDULES['1']

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubject || !newTeacher) {
      toast.error('Please enter subject and teacher name')
      return
    }
    toast.success(
      isRtl
        ? `نیا ٹائم سلاٹ ${DAYS_UR[newDay]} کے لیے کامیابی سے شامل ہو گیا`
        : `Slot added for ${newDay} successfully!`
    )
    setIsDialogOpen(false)
    setNewSubject('')
    setNewTeacher('')
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-accent" />
            {isRtl ? 'نظام الاوقات و ٹائم ٹیبل' : 'Timetable & Class Schedule'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isRtl
              ? 'کلاس کے اوقات کار، مضامین، اساتذہ اور کمرہ جات کا شیڈول۔'
              : 'Weekly academic grid, lecture periods, assigned teachers, and lecture halls.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Class Selector Dropdown */}
          <select
            value={selectedClassKey}
            onChange={(e) => setSelectedClassKey(e.target.value as '1' | '2')}
            className="h-9 px-3 rounded-lg border border-input bg-card text-sm font-semibold text-primary shadow-sm"
          >
            <option value="1">{isRtl ? 'ابتدائی اول (سال اول)' : 'Ibtidai Awwal (1st Year)'}</option>
            <option value="2">{isRtl ? 'ابتدائی دوم (سال دوم)' : 'Ibtidai Doum (2nd Year)'}</option>
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="h-9 border-primary/20 text-primary hover:bg-primary/5 font-semibold gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4" />
            {isRtl ? 'پرنٹ / پی ڈی ایف' : 'Print / PDF'}
          </Button>

          <Button
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="h-9 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4 text-accent" />
            {isRtl ? 'نیا سلاٹ شامل کریں' : 'Add Slot'}
          </Button>
        </div>
      </div>

      {/* Class Schedule Meta Banner */}
      <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary text-accent flex items-center justify-center font-bold text-lg">
            {selectedClassKey}
          </div>
          <div>
            <h3 className="font-bold text-base text-primary">
              {isRtl ? schedule.name_ur : schedule.name_en}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isRtl ? 'تعلیمی سال: ۲۰۲۵-۲۰۲۶ • دورانیہ: پیر تا ہفتہ' : 'Academic Year: 2025-2026 • Monday to Saturday'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            {isRtl ? 'تدریسی اوقات: ۵ پیریڈز' : '5 Daily Periods'}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            {isRtl ? 'وقفہ طعام و استراحت' : '30m Break'}
          </span>
        </div>
      </div>

      {/* Visual Weekly Grid */}
      <Card className="border-primary/15 shadow-sm overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-primary/10 border-b border-primary/15 text-primary">
                <th className="p-3.5 font-bold text-center w-36 border-r border-primary/10">
                  <div className="flex items-center justify-center gap-1 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    {isRtl ? 'اوقات' : 'Period Time'}
                  </div>
                </th>
                {DAYS.map((day) => (
                  <th
                    key={day}
                    className="p-3.5 font-bold text-center border-r border-primary/10 last:border-r-0 min-w-[130px]"
                  >
                    <div>{isRtl ? DAYS_UR[day] : day}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERIOD_TIMES.map((timeLabel, periodIdx) => {
                const isBreak = timeLabel.startsWith('BREAK')

                if (isBreak) {
                  return (
                    <tr key={periodIdx} className="bg-amber-500/10 border-b border-border">
                      <td className="p-3 text-xs font-bold text-center border-r border-border text-amber-700 dark:text-amber-300">
                        {timeLabel}
                      </td>
                      <td
                        colSpan={6}
                        className="p-3 text-center text-xs font-bold uppercase tracking-widest text-amber-800 dark:text-amber-200"
                      >
                        ☕ {isRtl ? 'وقفہ طعام و استراحت (نصف گھنٹہ)' : 'B R E A K & R E F R E S H M E N T'}
                      </td>
                    </tr>
                  )
                }

                // Adjust index for data array (period 0, 1, 2, break, period 4, 5)
                const dataIdx = periodIdx > 3 ? periodIdx - 1 : periodIdx

                return (
                  <tr key={periodIdx} className="border-b border-border hover:bg-muted/10 transition-colors">
                    <td className="p-3 text-xs font-semibold text-center border-r border-border bg-muted/20 text-muted-foreground whitespace-nowrap">
                      {timeLabel}
                    </td>

                    {DAYS.map((day) => {
                      const daySlots = schedule.grid[day] || []
                      const slot = daySlots[dataIdx]

                      if (!slot || slot === 'BREAK') {
                        return (
                          <td key={day} className="p-2 border-r border-border last:border-r-0 text-center">
                            <span className="text-xs text-muted-foreground italic">—</span>
                          </td>
                        )
                      }

                      const subj = isRtl && slot.subject_ur ? slot.subject_ur : slot.subject
                      const teach = isRtl && slot.teacher_ur ? slot.teacher_ur : slot.teacher

                      return (
                        <td key={day} className="p-2 border-r border-border last:border-r-0 align-top">
                          <div className="p-2.5 rounded-xl bg-card border border-border hover:border-primary/30 hover:shadow-md transition-all space-y-1">
                            <p className="font-bold text-xs text-primary leading-tight">{subj}</p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                              <User className="w-3 h-3 text-accent" />
                              {teach}
                            </p>
                            <div className="pt-1 flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
                                {slot.room}
                              </span>
                            </div>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Add Slot Modal Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-primary/20 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-accent" />
                {isRtl ? 'نیا پیریڈ / ٹائم سلاٹ شامل کریں' : 'Add Timetable Period'}
              </h3>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSlot} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="day" className="text-xs font-semibold">
                    {isRtl ? 'دن' : 'Day of Week'}
                  </Label>
                  <select
                    id="day"
                    value={newDay}
                    onChange={(e) => setNewDay(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {isRtl ? DAYS_UR[d] : d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="rm" className="text-xs font-semibold">
                    {isRtl ? 'کمرہ / ہال' : 'Room / Hall'}
                  </Label>
                  <Input
                    id="rm"
                    value={newRoom}
                    onChange={(e) => setNewRoom(e.target.value)}
                    placeholder="Room 101"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="sub" className="text-xs font-semibold">
                  {isRtl ? 'مضمون کا نام' : 'Subject Name'}
                </Label>
                <Input
                  id="sub"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="e.g. Hidayat-un-Nahw"
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="tch" className="text-xs font-semibold">
                  {isRtl ? 'استاد کا نام' : 'Teacher Name'}
                </Label>
                <Input
                  id="tch"
                  value={newTeacher}
                  onChange={(e) => setNewTeacher(e.target.value)}
                  placeholder="e.g. Mawlana Tariq"
                  required
                  className="h-10"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {isRtl ? 'منسوخ کریں' : 'Cancel'}
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isRtl ? 'محفوظ کریں' : 'Save Slot'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
