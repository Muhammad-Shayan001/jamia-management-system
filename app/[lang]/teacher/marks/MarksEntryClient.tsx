'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'
import { Save, Calculator } from 'lucide-react'

type ExamSubject = {
  id: string
  exam: { name_en: string; exam_type: string }
  subject: { name_en: string; name_ur: string | null }
  class: { name_en: string }
  total_marks: number
  passing_marks: number
  written_marks: number
  oral_marks: number
  practical_marks: number
}

type Student = {
  id: string
  name_en: string
  name_ur: string | null
  admission_number: string
}

type Mark = {
  student_id: string
  written_obtained: number
  oral_obtained: number
  practical_obtained: number
  is_absent: boolean
}

export default function MarksEntryClient({
  teacherId,
  examSubjects,
  isRtl,
}: {
  teacherId: string
  examSubjects: ExamSubject[]
  isRtl: boolean
}) {
  const [selectedExamSubject, setSelectedExamSubject] = useState<string>('')
  const [students, setStudents] = useState<Student[]>([])
  const [marks, setMarks] = useState<Map<string, Mark>>(new Map())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const supabase = createClient()
  const currentExamSubject = examSubjects.find((es) => es.id === selectedExamSubject)

  const loadStudents = async (examSubjectId: string) => {
    setLoading(true)
    try {
      const examSubject = examSubjects.find((es) => es.id === examSubjectId)
      if (!examSubject) return

      // Get students enrolled in this class
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('id, name_en, name_ur, admission_number')
        .eq('class_id', examSubject.class)
        .eq('is_active', true)
        .order('name_en')

      if (studentsError) throw studentsError

      setStudents(studentsData || [])

      // Load existing marks
      const { data: existingMarks, error: marksError } = await supabase
        .from('marks')
        .select('*')
        .eq('exam_subject_id', examSubjectId)

      if (marksError) throw marksError

      const marksMap = new Map<string, Mark>()
      existingMarks?.forEach((m: any) => {
        marksMap.set(m.student_id, {
          student_id: m.student_id,
          written_obtained: m.written_obtained || 0,
          oral_obtained: m.oral_obtained || 0,
          practical_obtained: m.practical_obtained || 0,
          is_absent: m.is_absent || false,
        })
      })

      setMarks(marksMap)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const handleExamSubjectChange = (value: string) => {
    setSelectedExamSubject(value)
    loadStudents(value)
  }

  const updateMark = (studentId: string, field: keyof Mark, value: any) => {
    const current = marks.get(studentId) || {
      student_id: studentId,
      written_obtained: 0,
      oral_obtained: 0,
      practical_obtained: 0,
      is_absent: false,
    }

    marks.set(studentId, { ...current, [field]: value })
    setMarks(new Map(marks))
  }

  const handleSave = async () => {
    if (!selectedExamSubject) {
      toast.error(isRtl ? 'براہ کرم امتحان منتخب کریں' : 'Please select an exam subject')
      return
    }

    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const marksToSave = Array.from(marks.values()).map((mark) => ({
        exam_subject_id: selectedExamSubject,
        student_id: mark.student_id,
        written_obtained: mark.is_absent ? 0 : mark.written_obtained,
        oral_obtained: mark.is_absent ? 0 : mark.oral_obtained,
        practical_obtained: mark.is_absent ? 0 : mark.practical_obtained,
        is_absent: mark.is_absent,
        entered_by: user.id,
      }))

      // Upsert marks
      const { error } = await supabase.from('marks').upsert(marksToSave, {
        onConflict: 'exam_subject_id,student_id',
      })

      if (error) throw error

      toast.success(isRtl ? 'نمبرات محفوظ ہو گئے' : 'Marks saved successfully')

      // Trigger result calculation (we'll create this later)
      await calculateResults(selectedExamSubject)
    } catch (error: any) {
      toast.error(error.message || 'Failed to save marks')
    } finally {
      setSaving(false)
    }
  }

  const calculateResults = async (examSubjectId: string) => {
    // This will be implemented in the results system
    // For now, just a placeholder
    console.log('Result calculation triggered for exam_subject:', examSubjectId)
  }

  const getTotalObtained = (studentId: string): number => {
    const mark = marks.get(studentId)
    if (!mark || mark.is_absent) return 0
    return (mark.written_obtained || 0) + (mark.oral_obtained || 0) + (mark.practical_obtained || 0)
  }

  const getPercentage = (studentId: string): string => {
    if (!currentExamSubject) return '0'
    const obtained = getTotalObtained(studentId)
    const percentage = (obtained / currentExamSubject.total_marks) * 100
    return percentage.toFixed(2)
  }

  const isPass = (studentId: string): boolean => {
    if (!currentExamSubject) return false
    return getTotalObtained(studentId) >= currentExamSubject.passing_marks
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {isRtl ? 'نمبرات درج کریں' : 'Enter Marks'}
        </h2>
        <p className="text-muted-foreground mt-1">
          {isRtl ? 'طلباء کے نمبرات درج کریں اور محفوظ کریں' : 'Enter and save student marks'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isRtl ? 'امتحان اور مضمون منتخب کریں' : 'Select Exam & Subject'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>{isRtl ? 'امتحان اور مضمون' : 'Exam & Subject'}</Label>
            <Select value={selectedExamSubject} onValueChange={handleExamSubjectChange}>
              <SelectTrigger>
                <SelectValue placeholder={isRtl ? 'منتخب کریں' : 'Select exam and subject'} />
              </SelectTrigger>
              <SelectContent>
                {examSubjects.map((es) => (
                  <SelectItem key={es.id} value={es.id}>
                    {es.exam.name_en} - {es.subject.name_en} - {es.class.name_en}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {currentExamSubject && (
            <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="font-medium">{isRtl ? 'کل نمبر:' : 'Total Marks:'}</span>
                <span>{currentExamSubject.total_marks}</span>

                <span className="font-medium">{isRtl ? 'پاس نمبر:' : 'Passing Marks:'}</span>
                <span>{currentExamSubject.passing_marks}</span>

                {currentExamSubject.written_marks > 0 && (
                  <>
                    <span className="font-medium">{isRtl ? 'تحریری:' : 'Written:'}</span>
                    <span>{currentExamSubject.written_marks}</span>
                  </>
                )}

                {currentExamSubject.oral_marks > 0 && (
                  <>
                    <span className="font-medium">{isRtl ? 'زبانی:' : 'Oral:'}</span>
                    <span>{currentExamSubject.oral_marks}</span>
                  </>
                )}

                {currentExamSubject.practical_marks > 0 && (
                  <>
                    <span className="font-medium">{isRtl ? 'عملی:' : 'Practical:'}</span>
                    <span>{currentExamSubject.practical_marks}</span>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {loading && (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">{isRtl ? 'لوڈ ہو رہا ہے...' : 'Loading students...'}</p>
          </CardContent>
        </Card>
      )}

      {!loading && students.length > 0 && currentExamSubject && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{isRtl ? 'طلباء کے نمبرات' : 'Student Marks'}</CardTitle>
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              <Save className="w-4 h-4" />
              {saving ? (isRtl ? 'محفوظ ہو رہا ہے...' : 'Saving...') : isRtl ? 'محفوظ کریں' : 'Save Marks'}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="p-3 text-left">#</th>
                    <th className="p-3 text-left">{isRtl ? 'طالب علم' : 'Student'}</th>
                    <th className="p-3 text-left">{isRtl ? 'داخلہ نمبر' : 'Admission #'}</th>
                    {currentExamSubject.written_marks > 0 && (
                      <th className="p-3 text-center">
                        {isRtl ? 'تحریری' : 'Written'}
                        <br />
                        <span className="text-xs text-muted-foreground">/{currentExamSubject.written_marks}</span>
                      </th>
                    )}
                    {currentExamSubject.oral_marks > 0 && (
                      <th className="p-3 text-center">
                        {isRtl ? 'زبانی' : 'Oral'}
                        <br />
                        <span className="text-xs text-muted-foreground">/{currentExamSubject.oral_marks}</span>
                      </th>
                    )}
                    {currentExamSubject.practical_marks > 0 && (
                      <th className="p-3 text-center">
                        {isRtl ? 'عملی' : 'Practical'}
                        <br />
                        <span className="text-xs text-muted-foreground">/{currentExamSubject.practical_marks}</span>
                      </th>
                    )}
                    <th className="p-3 text-center">
                      {isRtl ? 'کل' : 'Total'}
                      <br />
                      <span className="text-xs text-muted-foreground">/{currentExamSubject.total_marks}</span>
                    </th>
                    <th className="p-3 text-center">{isRtl ? 'فیصد' : '%'}</th>
                    <th className="p-3 text-center">{isRtl ? 'نتیجہ' : 'Result'}</th>
                    <th className="p-3 text-center">{isRtl ? 'غیر حاضر' : 'Absent'}</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, index) => {
                    const mark = marks.get(student.id) || {
                      student_id: student.id,
                      written_obtained: 0,
                      oral_obtained: 0,
                      practical_obtained: 0,
                      is_absent: false,
                    }

                    return (
                      <tr key={student.id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3">{index + 1}</td>
                        <td className="p-3">
                          <div className="font-medium">{student.name_en}</div>
                          {student.name_ur && (
                            <div className="text-xs text-muted-foreground" dir="rtl">
                              {student.name_ur}
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-sm text-muted-foreground">{student.admission_number}</td>

                        {currentExamSubject.written_marks > 0 && (
                          <td className="p-3">
                            <Input
                              type="number"
                              min="0"
                              max={currentExamSubject.written_marks}
                              value={mark.is_absent ? 0 : mark.written_obtained}
                              onChange={(e) =>
                                updateMark(student.id, 'written_obtained', parseFloat(e.target.value) || 0)
                              }
                              disabled={mark.is_absent}
                              className="w-20 text-center"
                            />
                          </td>
                        )}

                        {currentExamSubject.oral_marks > 0 && (
                          <td className="p-3">
                            <Input
                              type="number"
                              min="0"
                              max={currentExamSubject.oral_marks}
                              value={mark.is_absent ? 0 : mark.oral_obtained}
                              onChange={(e) =>
                                updateMark(student.id, 'oral_obtained', parseFloat(e.target.value) || 0)
                              }
                              disabled={mark.is_absent}
                              className="w-20 text-center"
                            />
                          </td>
                        )}

                        {currentExamSubject.practical_marks > 0 && (
                          <td className="p-3">
                            <Input
                              type="number"
                              min="0"
                              max={currentExamSubject.practical_marks}
                              value={mark.is_absent ? 0 : mark.practical_obtained}
                              onChange={(e) =>
                                updateMark(student.id, 'practical_obtained', parseFloat(e.target.value) || 0)
                              }
                              disabled={mark.is_absent}
                              className="w-20 text-center"
                            />
                          </td>
                        )}

                        <td className="p-3 text-center font-bold">{getTotalObtained(student.id)}</td>
                        <td className="p-3 text-center">{getPercentage(student.id)}%</td>
                        <td className="p-3 text-center">
                          {mark.is_absent ? (
                            <span className="text-red-600 font-medium">{isRtl ? 'غیر حاضر' : 'Absent'}</span>
                          ) : (
                            <span
                              className={`font-medium ${
                                isPass(student.id)
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }`}
                            >
                              {isPass(student.id) ? (isRtl ? 'کامیاب' : 'Pass') : (isRtl ? 'ناکام' : 'Fail')}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-center">
                          <Checkbox
                            checked={mark.is_absent}
                            onCheckedChange={(checked) => updateMark(student.id, 'is_absent', checked)}
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {!loading && students.length === 0 && selectedExamSubject && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calculator className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {isRtl ? 'کوئی طالب علم نہیں ملا' : 'No Students Found'}
            </h3>
            <p className="text-muted-foreground text-center">
              {isRtl
                ? 'اس کلاس میں کوئی طالب علم نہیں ہے'
                : 'No students are enrolled in this class'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
