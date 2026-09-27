'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { format } from 'date-fns'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarDays, BookOpen, GraduationCap, Layers, BookMarked, Plus, Inbox } from 'lucide-react'

// ─── Types ──────────────────────────────────────────────────────────────────

interface Program {
  id: string
  institution_id: string
  name_en: string
  name_ur: string | null
  description: string | null
  is_active: boolean
  created_at: string
}

interface Level {
  id: string
  program_id: string
  institution_id: string
  name_en: string
  name_ur: string | null
  order_index: number
  is_active: boolean
  created_at: string
}

interface AcademicSession {
  id: string
  institution_id: string
  name: string
  start_date: string
  end_date: string
  is_current: boolean
  created_at: string
}

interface ClassRow {
  id: string
  institution_id: string
  name_en: string
  name_ur: string | null
  level: number
  level_id: string | null
  session_id: string
  section: string | null
  capacity: number
  created_at: string
}

interface SubjectRow {
  id: string
  institution_id: string
  name_en: string
  name_ur: string | null
  class_id: string
  code: string | null
  subject_type: string | null
  max_marks: number | null
  passing_marks: number | null
  is_active: boolean
  created_at: string
}

interface AcademicClientProps {
  institutionId: string
  initialPrograms: Program[]
  initialLevels: Level[]
  initialSessions: AcademicSession[]
  initialClasses: ClassRow[]
  initialSubjects: SubjectRow[]
}

// ─── Preset Quick-Add Data ───────────────────────────────────────────────────

const PRESET_PROGRAMS = [
  { name_en: 'Dars-e-Nizami', name_ur: 'درس نظامی', description: 'Traditional Islamic scholarly curriculum' },
  { name_en: 'Hifz ul Quran', name_ur: 'حفظ القرآن', description: 'Quranic memorization program' },
  { name_en: 'Nazira', name_ur: 'ناظرہ', description: 'Quran recitation program' },
  { name_en: 'Arabic Language', name_ur: 'عربی زبان', description: 'Arabic language and grammar studies' },
]

const PRESET_DARAJA = [
  { name_en: 'Ibtidaiyya', name_ur: 'ابتدائیہ', order_index: 1 },
  { name_en: 'Mutawassita', name_ur: 'متوسطہ', order_index: 2 },
  { name_en: 'Thanawiyya', name_ur: 'ثانویہ', order_index: 3 },
  { name_en: 'Aliyya', name_ur: 'عالیہ', order_index: 4 },
  { name_en: 'Alamiyya', name_ur: 'عالمیہ', order_index: 5 },
]

const SUBJECT_TYPES = [
  { value: 'kitab', label: 'Kitab (کتاب)' },
  { value: 'subject', label: 'Subject (مضمون)' },
  { value: 'practical', label: 'Practical (عملی)' },
  { value: 'oral', label: 'Oral / Zubaani (زبانی)' },
  { value: 'memorization', label: 'Memorization (حفظ)' },
  { value: 'assignment', label: 'Assignment (تفویض)' },
]

const SECTIONS = ['A', 'B', 'C', 'D', 'E']

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, message }: { icon: React.ElementType; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
      <Icon className="w-10 h-10 opacity-40" />
      <p className="text-sm">{message}</p>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function AcademicClient({
  institutionId,
  initialPrograms,
  initialLevels,
  initialSessions,
  initialClasses,
  initialSubjects,
}: AcademicClientProps) {
  const supabase = createClient()

  const [programs, setPrograms] = useState<Program[]>(initialPrograms)
  const [levels, setLevels] = useState<Level[]>(initialLevels)
  const [sessions, setSessions] = useState<AcademicSession[]>(initialSessions)
  const [classes, setClasses] = useState<ClassRow[]>(initialClasses)
  const [subjects, setSubjects] = useState<SubjectRow[]>(initialSubjects)

  // ─── Academic Year / Session Form ─────────────────────────────────────────

  const [sessionOpen, setSessionOpen] = useState(false)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [sessionForm, setSessionForm] = useState({
    name: '',
    start_date: '',
    end_date: '',
    is_current: false,
  })

  async function handleCreateSession() {
    if (!sessionForm.name.trim() || !sessionForm.start_date || !sessionForm.end_date) {
      toast.error('Please fill in all required fields.')
      return
    }
    setSessionLoading(true)
    try {
      // If is_current, unset existing current sessions first
      if (sessionForm.is_current) {
        await supabase
          .from('sessions')
          .update({ is_current: false })
          .eq('institution_id', institutionId)
          .eq('is_current', true)
      }

      const { data, error } = await supabase
        .from('sessions')
        .insert({
          institution_id: institutionId,
          name: sessionForm.name.trim(),
          start_date: sessionForm.start_date,
          end_date: sessionForm.end_date,
          is_current: sessionForm.is_current,
        })
        .select()
        .single()

      if (error) throw error

      if (sessionForm.is_current) {
        // Update local state to reflect the unset
        setSessions((prev) => prev.map((s) => ({ ...s, is_current: false })))
      }
      setSessions((prev) => [data as AcademicSession, ...prev])
      toast.success(`Academic year "${data.name}" created successfully.`)
      setSessionForm({ name: '', start_date: '', end_date: '', is_current: false })
      setSessionOpen(false)
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Failed to create academic year.')
    } finally {
      setSessionLoading(false)
    }
  }

  // ─── Program Form ──────────────────────────────────────────────────────────

  const [programOpen, setProgramOpen] = useState(false)
  const [programLoading, setProgramLoading] = useState(false)
  const [programForm, setProgramForm] = useState({
    name_en: '',
    name_ur: '',
    description: '',
  })

  async function handleCreateProgram(override?: { name_en: string; name_ur: string; description: string }) {
    const payload = override ?? programForm
    if (!payload.name_en.trim()) {
      toast.error('Program name (English) is required.')
      return
    }
    setProgramLoading(true)
    try {
      const { data, error } = await supabase
        .from('programs')
        .insert({
          institution_id: institutionId,
          name_en: payload.name_en.trim(),
          name_ur: payload.name_ur.trim() || null,
          description: payload.description.trim() || null,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      setPrograms((prev) => [...prev, data as Program])
      toast.success(`Program "${data.name_en}" created.`)
      setProgramForm({ name_en: '', name_ur: '', description: '' })
      setProgramOpen(false)
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Failed to create program.')
    } finally {
      setProgramLoading(false)
    }
  }

  // ─── Level / Daraja Form ───────────────────────────────────────────────────

  const [levelOpen, setLevelOpen] = useState(false)
  const [levelLoading, setLevelLoading] = useState(false)
  const [levelForm, setLevelForm] = useState({
    program_id: '',
    name_en: '',
    name_ur: '',
    order_index: 0,
  })

  async function handleCreateLevel(override?: { program_id: string; name_en: string; name_ur: string; order_index: number }) {
    const payload = override ?? levelForm
    if (!payload.program_id || !payload.name_en.trim()) {
      toast.error('Program and level name are required.')
      return
    }
    setLevelLoading(true)
    try {
      const { data, error } = await supabase
        .from('levels')
        .insert({
          institution_id: institutionId,
          program_id: payload.program_id,
          name_en: payload.name_en.trim(),
          name_ur: payload.name_ur.trim() || null,
          order_index: payload.order_index,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      setLevels((prev) => [...prev, data as Level])
      toast.success(`Daraja "${data.name_en}" created.`)
      setLevelForm({ program_id: '', name_en: '', name_ur: '', order_index: 0 })
      setLevelOpen(false)
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Failed to create level.')
    } finally {
      setLevelLoading(false)
    }
  }

  // ─── Class Form ────────────────────────────────────────────────────────────

  const [classOpen, setClassOpen] = useState(false)
  const [classLoading, setClassLoading] = useState(false)
  const [classForm, setClassForm] = useState({
    name_en: '',
    name_ur: '',
    level_id: '',
    session_id: '',
    section: 'A',
    capacity: 30,
    level: 1,
  })

  async function handleCreateClass() {
    if (!classForm.name_en.trim() || !classForm.session_id) {
      toast.error('Class name and academic year are required.')
      return
    }
    setClassLoading(true)
    try {
      const { data, error } = await supabase
        .from('classes')
        .insert({
          institution_id: institutionId,
          name_en: classForm.name_en.trim(),
          name_ur: classForm.name_ur.trim() || null,
          level_id: classForm.level_id || null,
          session_id: classForm.session_id,
          section: classForm.section,
          capacity: classForm.capacity,
          level: classForm.level,
        })
        .select()
        .single()

      if (error) throw error

      setClasses((prev) => [...prev, data as ClassRow])
      toast.success(`Class "${data.name_en}" created.`)
      setClassForm({ name_en: '', name_ur: '', level_id: '', session_id: '', section: 'A', capacity: 30, level: 1 })
      setClassOpen(false)
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Failed to create class.')
    } finally {
      setClassLoading(false)
    }
  }

  // ─── Subject Form ──────────────────────────────────────────────────────────

  const [subjectOpen, setSubjectOpen] = useState(false)
  const [subjectLoading, setSubjectLoading] = useState(false)
  const [subjectForm, setSubjectForm] = useState({
    name_en: '',
    name_ur: '',
    code: '',
    class_id: '',
    subject_type: 'kitab',
    max_marks: 100,
    passing_marks: 40,
  })

  async function handleCreateSubject() {
    if (!subjectForm.name_en.trim() || !subjectForm.class_id) {
      toast.error('Subject name and class are required.')
      return
    }
    setSubjectLoading(true)
    try {
      const { data, error } = await supabase
        .from('subjects')
        .insert({
          institution_id: institutionId,
          name_en: subjectForm.name_en.trim(),
          name_ur: subjectForm.name_ur.trim() || null,
          code: subjectForm.code.trim() || null,
          class_id: subjectForm.class_id,
          subject_type: subjectForm.subject_type,
          max_marks: subjectForm.max_marks,
          passing_marks: subjectForm.passing_marks,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      setSubjects((prev) => [...prev, data as SubjectRow])
      toast.success(`Subject "${data.name_en}" created.`)
      setSubjectForm({ name_en: '', name_ur: '', code: '', class_id: '', subject_type: 'kitab', max_marks: 100, passing_marks: 40 })
      setSubjectOpen(false)
    } catch (err: unknown) {
      toast.error((err as Error).message ?? 'Failed to create subject.')
    } finally {
      setSubjectLoading(false)
    }
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  function getProgramName(id: string) {
    return programs.find((p) => p.id === id)?.name_en ?? '—'
  }

  function getLevelName(id: string | null) {
    if (!id) return '—'
    const l = levels.find((lv) => lv.id === id)
    return l ? `${l.name_en}${l.name_ur ? ` (${l.name_ur})` : ''}` : '—'
  }

  function getSessionName(id: string) {
    return sessions.find((s) => s.id === id)?.name ?? '—'
  }

  function getClassName(id: string) {
    return classes.find((c) => c.id === id)?.name_en ?? '—'
  }

  // Group levels by program
  const levelsByProgram = levels.reduce<Record<string, Level[]>>((acc, lv) => {
    if (!acc[lv.program_id]) acc[lv.program_id] = []
    acc[lv.program_id].push(lv)
    return acc
  }, {})

  // Group subjects by class
  const subjectsByClass = subjects.reduce<Record<string, SubjectRow[]>>((acc, s) => {
    if (!acc[s.class_id]) acc[s.class_id] = []
    acc[s.class_id].push(s)
    return acc
  }, {})

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Academic Structure</h2>
        <p className="text-muted-foreground mt-1">
          Manage academic years, programs, Darajas (levels), classes, and Kutub (subjects) for your institution.
        </p>
      </div>

      <Tabs defaultValue="sessions">
        <TabsList className="flex flex-wrap gap-1 h-auto">
          <TabsTrigger value="sessions" className="gap-1.5">
            <CalendarDays className="w-4 h-4" />
            Academic Years
          </TabsTrigger>
          <TabsTrigger value="programs" className="gap-1.5">
            <GraduationCap className="w-4 h-4" />
            Programs
          </TabsTrigger>
          <TabsTrigger value="levels" className="gap-1.5">
            <Layers className="w-4 h-4" />
            Levels (Daraja)
          </TabsTrigger>
          <TabsTrigger value="classes" className="gap-1.5">
            <BookOpen className="w-4 h-4" />
            Classes
          </TabsTrigger>
          <TabsTrigger value="subjects" className="gap-1.5">
            <BookMarked className="w-4 h-4" />
            Subjects (Kutub)
          </TabsTrigger>
        </TabsList>

        {/* ──────────────── TAB 1: Academic Years ──────────────── */}
        <TabsContent value="sessions" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Academic Years / Sessions</h3>
            <Dialog open={sessionOpen} onOpenChange={setSessionOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  New Academic Year
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Academic Year</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="session-name">
                      Session Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="session-name"
                      placeholder="e.g. 2025-2026"
                      value={sessionForm.name}
                      onChange={(e) => setSessionForm((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="session-start">
                        Start Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="session-start"
                        type="date"
                        value={sessionForm.start_date}
                        onChange={(e) => setSessionForm((f) => ({ ...f, start_date: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="session-end">
                        End Date <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="session-end"
                        type="date"
                        value={sessionForm.end_date}
                        onChange={(e) => setSessionForm((f) => ({ ...f, end_date: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      id="session-current"
                      checked={sessionForm.is_current}
                      onCheckedChange={(v) => setSessionForm((f) => ({ ...f, is_current: v }))}
                    />
                    <Label htmlFor="session-current">Mark as current session</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSessionOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSession} disabled={sessionLoading}>
                    {sessionLoading ? 'Creating…' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {sessions.length === 0 ? (
            <EmptyState icon={CalendarDays} message="No academic years yet. Create your first one." />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session Name</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium">{s.name}</TableCell>
                      <TableCell>
                        {s.start_date ? format(new Date(s.start_date), 'dd MMM yyyy') : '—'}
                      </TableCell>
                      <TableCell>
                        {s.end_date ? format(new Date(s.end_date), 'dd MMM yyyy') : '—'}
                      </TableCell>
                      <TableCell>
                        {s.is_current ? (
                          <Badge className="bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 border-green-200">
                            Current
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Past</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ──────────────── TAB 2: Programs ──────────────── */}
        <TabsContent value="programs" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Programs</h3>
            <Dialog open={programOpen} onOpenChange={setProgramOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  New Program
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Program</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="prog-name-en">
                      Name (English) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="prog-name-en"
                      placeholder="e.g. Dars-e-Nizami"
                      value={programForm.name_en}
                      onChange={(e) => setProgramForm((f) => ({ ...f, name_en: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="prog-name-ur">Name (Urdu)</Label>
                    <Input
                      id="prog-name-ur"
                      placeholder="مثلاً درس نظامی"
                      dir="rtl"
                      value={programForm.name_ur}
                      onChange={(e) => setProgramForm((f) => ({ ...f, name_ur: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="prog-desc">Description</Label>
                    <Textarea
                      id="prog-desc"
                      placeholder="Brief description of the program…"
                      rows={3}
                      value={programForm.description}
                      onChange={(e) => setProgramForm((f) => ({ ...f, description: e.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setProgramOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleCreateProgram()} disabled={programLoading}>
                    {programLoading ? 'Creating…' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quick-add preset buttons */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Quick-add presets:</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_PROGRAMS.map((p) => {
                const exists = programs.some(
                  (pr) => pr.name_en.toLowerCase() === p.name_en.toLowerCase()
                )
                return (
                  <Button
                    key={p.name_en}
                    variant="outline"
                    size="sm"
                    disabled={exists || programLoading}
                    onClick={() => handleCreateProgram(p)}
                  >
                    {exists ? '✓ ' : '+ '}
                    {p.name_en}
                    {p.name_ur && (
                      <span className="mr-1 text-muted-foreground" dir="rtl">
                        {' '}({p.name_ur})
                      </span>
                    )}
                  </Button>
                )
              })}
            </div>
          </div>

          {programs.length === 0 ? (
            <EmptyState icon={GraduationCap} message="No programs yet. Use quick-add or create manually." />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {programs.map((p) => (
                <Card key={p.id} className="border-primary/10">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-base">{p.name_en}</CardTitle>
                      <Badge variant={p.is_active ? 'default' : 'secondary'} className="shrink-0 text-xs">
                        {p.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    {p.name_ur && (
                      <p className="text-sm text-muted-foreground font-urdu" dir="rtl">
                        {p.name_ur}
                      </p>
                    )}
                  </CardHeader>
                  {p.description && (
                    <CardContent className="pt-0">
                      <p className="text-xs text-muted-foreground">{p.description}</p>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ──────────────── TAB 3: Levels (Daraja) ──────────────── */}
        <TabsContent value="levels" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Levels / Darajaat (درجات)</h3>
            <Dialog open={levelOpen} onOpenChange={setLevelOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5" disabled={programs.length === 0}>
                  <Plus className="w-4 h-4" />
                  New Daraja
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Daraja (Level)</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>
                      Program <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={levelForm.program_id}
                      onValueChange={(v) => setLevelForm((f) => ({ ...f, program_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select program…" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name_en}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="level-name-en">
                      Name (English) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="level-name-en"
                      placeholder="e.g. Ibtidaiyya"
                      value={levelForm.name_en}
                      onChange={(e) => setLevelForm((f) => ({ ...f, name_en: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="level-name-ur">Name (Urdu)</Label>
                    <Input
                      id="level-name-ur"
                      placeholder="مثلاً ابتدائیہ"
                      dir="rtl"
                      value={levelForm.name_ur}
                      onChange={(e) => setLevelForm((f) => ({ ...f, name_ur: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="level-order">Order Index</Label>
                    <Input
                      id="level-order"
                      type="number"
                      min={0}
                      value={levelForm.order_index}
                      onChange={(e) =>
                        setLevelForm((f) => ({ ...f, order_index: parseInt(e.target.value) || 0 }))
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setLevelOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => handleCreateLevel()} disabled={levelLoading}>
                    {levelLoading ? 'Creating…' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {programs.length === 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-300">
              Create a Program first before adding Darajaat.
            </div>
          )}

          {/* Quick-add presets (only shown if Dars-e-Nizami exists) */}
          {programs.some((p) => p.name_en === 'Dars-e-Nizami') && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Quick-add Dars-e-Nizami Darajaat:
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESET_DARAJA.map((d) => {
                  const dnProgram = programs.find((p) => p.name_en === 'Dars-e-Nizami')
                  if (!dnProgram) return null
                  const exists = levels.some(
                    (lv) =>
                      lv.program_id === dnProgram.id &&
                      lv.name_en.toLowerCase() === d.name_en.toLowerCase()
                  )
                  return (
                    <Button
                      key={d.name_en}
                      variant="outline"
                      size="sm"
                      disabled={exists || levelLoading}
                      onClick={() =>
                        handleCreateLevel({
                          program_id: dnProgram.id,
                          name_en: d.name_en,
                          name_ur: d.name_ur,
                          order_index: d.order_index,
                        })
                      }
                    >
                      {exists ? '✓ ' : '+ '}
                      <span dir="rtl">{d.name_ur}</span>
                      <span className="text-muted-foreground"> ({d.name_en})</span>
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          {levels.length === 0 ? (
            <EmptyState icon={Layers} message="No Darajaat yet. Add levels for each program." />
          ) : (
            <div className="space-y-6">
              {programs.map((prog) => {
                const progLevels = levelsByProgram[prog.id] ?? []
                if (progLevels.length === 0) return null
                return (
                  <div key={prog.id}>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      {prog.name_en}
                      {prog.name_ur && (
                        <span className="mr-2 normal-case" dir="rtl">
                          {' '}— {prog.name_ur}
                        </span>
                      )}
                    </h4>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-16">Order</TableHead>
                            <TableHead>Name (English)</TableHead>
                            <TableHead>Name (Urdu)</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {progLevels
                            .sort((a, b) => a.order_index - b.order_index)
                            .map((lv) => (
                              <TableRow key={lv.id}>
                                <TableCell className="text-muted-foreground">{lv.order_index}</TableCell>
                                <TableCell className="font-medium">{lv.name_en}</TableCell>
                                <TableCell dir="rtl" className="text-right">
                                  {lv.name_ur ?? '—'}
                                </TableCell>
                                <TableCell>
                                  <Badge variant={lv.is_active ? 'default' : 'secondary'}>
                                    {lv.is_active ? 'Active' : 'Inactive'}
                                  </Badge>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* ──────────────── TAB 4: Classes ──────────────── */}
        <TabsContent value="classes" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Classes</h3>
            <Dialog open={classOpen} onOpenChange={setClassOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5">
                  <Plus className="w-4 h-4" />
                  New Class
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create Class</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="class-name-en">
                      Class Name (English) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="class-name-en"
                      placeholder="e.g. Year 1 / Awwal"
                      value={classForm.name_en}
                      onChange={(e) => setClassForm((f) => ({ ...f, name_en: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="class-name-ur">Class Name (Urdu)</Label>
                    <Input
                      id="class-name-ur"
                      placeholder="مثلاً اول"
                      dir="rtl"
                      value={classForm.name_ur}
                      onChange={(e) => setClassForm((f) => ({ ...f, name_ur: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>
                      Academic Year <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={classForm.session_id}
                      onValueChange={(v) => setClassForm((f) => ({ ...f, session_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select academic year…" />
                      </SelectTrigger>
                      <SelectContent>
                        {sessions.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                            {s.is_current && ' (Current)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Daraja (Level)</Label>
                    <Select
                      value={classForm.level_id}
                      onValueChange={(v) => setClassForm((f) => ({ ...f, level_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level (optional)…" />
                      </SelectTrigger>
                      <SelectContent>
                        {levels.map((lv) => (
                          <SelectItem key={lv.id} value={lv.id}>
                            {lv.name_en}
                            {lv.name_ur && ` (${lv.name_ur})`}
                            {' — '}
                            {getProgramName(lv.program_id)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label>Section</Label>
                      <Select
                        value={classForm.section}
                        onValueChange={(v) => setClassForm((f) => ({ ...f, section: v }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {SECTIONS.map((s) => (
                            <SelectItem key={s} value={s}>
                              Section {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="class-capacity">Capacity</Label>
                      <Input
                        id="class-capacity"
                        type="number"
                        min={1}
                        value={classForm.capacity}
                        onChange={(e) =>
                          setClassForm((f) => ({ ...f, capacity: parseInt(e.target.value) || 1 }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setClassOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateClass} disabled={classLoading}>
                    {classLoading ? 'Creating…' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {classes.length === 0 ? (
            <EmptyState icon={BookOpen} message="No classes yet. Create your first class." />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class Name</TableHead>
                    <TableHead>Urdu Name</TableHead>
                    <TableHead>Daraja</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Section</TableHead>
                    <TableHead className="text-right">Capacity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {classes.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name_en}</TableCell>
                      <TableCell dir="rtl" className="text-right">
                        {c.name_ur ?? '—'}
                      </TableCell>
                      <TableCell>{getLevelName(c.level_id)}</TableCell>
                      <TableCell>{getSessionName(c.session_id)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {c.section ?? 'A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">{c.capacity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        {/* ──────────────── TAB 5: Subjects (Kutub) ──────────────── */}
        <TabsContent value="subjects" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Subjects / Kutub (کتب)</h3>
            <Dialog open={subjectOpen} onOpenChange={setSubjectOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-1.5" disabled={classes.length === 0}>
                  <Plus className="w-4 h-4" />
                  New Subject
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Create Subject / Kitab</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="sub-name-en">
                        Name (English) <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="sub-name-en"
                        placeholder="e.g. Al-Hidaya"
                        value={subjectForm.name_en}
                        onChange={(e) => setSubjectForm((f) => ({ ...f, name_en: e.target.value }))}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sub-code">Code</Label>
                      <Input
                        id="sub-code"
                        placeholder="e.g. HID-101"
                        value={subjectForm.code}
                        onChange={(e) => setSubjectForm((f) => ({ ...f, code: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="sub-name-ur">Name (Urdu)</Label>
                    <Input
                      id="sub-name-ur"
                      placeholder="مثلاً الہدایہ"
                      dir="rtl"
                      value={subjectForm.name_ur}
                      onChange={(e) => setSubjectForm((f) => ({ ...f, name_ur: e.target.value }))}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>
                      Class <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={subjectForm.class_id}
                      onValueChange={(v) => setSubjectForm((f) => ({ ...f, class_id: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select class…" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name_en}
                            {c.name_ur && ` (${c.name_ur})`}
                            {' — '}
                            {getSessionName(c.session_id)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Subject Type</Label>
                    <Select
                      value={subjectForm.subject_type}
                      onValueChange={(v) => setSubjectForm((f) => ({ ...f, subject_type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECT_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="sub-max">Max Marks</Label>
                      <Input
                        id="sub-max"
                        type="number"
                        min={0}
                        value={subjectForm.max_marks}
                        onChange={(e) =>
                          setSubjectForm((f) => ({ ...f, max_marks: parseFloat(e.target.value) || 0 }))
                        }
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="sub-pass">Passing Marks</Label>
                      <Input
                        id="sub-pass"
                        type="number"
                        min={0}
                        value={subjectForm.passing_marks}
                        onChange={(e) =>
                          setSubjectForm((f) => ({ ...f, passing_marks: parseFloat(e.target.value) || 0 }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSubjectOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSubject} disabled={subjectLoading}>
                    {subjectLoading ? 'Creating…' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {classes.length === 0 && (
            <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/30 p-4 text-sm text-amber-800 dark:text-amber-300">
              Create at least one Class before adding Subjects/Kutub.
            </div>
          )}

          {subjects.length === 0 ? (
            <EmptyState icon={BookMarked} message="No subjects yet. Add Kutub for each class." />
          ) : (
            <div className="space-y-6">
              {classes.map((cls) => {
                const clsSubjects = subjectsByClass[cls.id] ?? []
                if (clsSubjects.length === 0) return null
                return (
                  <div key={cls.id}>
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
                      {cls.name_en}
                      {cls.name_ur && (
                        <span className="mr-2 normal-case" dir="rtl">
                          {' '}— {cls.name_ur}
                        </span>
                      )}
                      <span className="text-xs font-normal normal-case ml-2 text-muted-foreground/70">
                        ({getSessionName(cls.session_id)})
                      </span>
                    </h4>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Urdu Name</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Max Marks</TableHead>
                            <TableHead className="text-right">Pass Marks</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {clsSubjects.map((sub) => (
                            <TableRow key={sub.id}>
                              <TableCell className="font-medium">{sub.name_en}</TableCell>
                              <TableCell dir="rtl" className="text-right">
                                {sub.name_ur ?? '—'}
                              </TableCell>
                              <TableCell>
                                {sub.code ? (
                                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                    {sub.code}
                                  </code>
                                ) : (
                                  '—'
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize text-xs">
                                  {sub.subject_type ?? 'kitab'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">{sub.max_marks ?? 100}</TableCell>
                              <TableCell className="text-right">{sub.passing_marks ?? 40}</TableCell>
                              <TableCell>
                                <Badge variant={sub.is_active ? 'default' : 'secondary'}>
                                  {sub.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )
              })}
              {/* Classes with no subjects yet still exist but are skipped — show a summary */}
              {classes.filter((c) => !subjectsByClass[c.id]?.length).length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {classes.filter((c) => !subjectsByClass[c.id]?.length).length} class(es) have no subjects yet.
                </p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
