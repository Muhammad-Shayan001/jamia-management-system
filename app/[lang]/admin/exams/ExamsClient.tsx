'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Plus, Edit, Trash2, Eye, FileCheck } from 'lucide-react'
import { toast } from 'sonner'

type Exam = {
  id: string
  name_en: string
  name_ur: string | null
  exam_type: string
  start_date: string
  end_date: string
  is_published: boolean
  session?: { name_en: string }
  campus?: { name: string }
}

export default function ExamsClient({
  initialExams,
  sessions,
  campuses,
  isRtl,
}: {
  initialExams: Exam[]
  sessions: any[]
  campuses: any[]
  isRtl: boolean
}) {
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [showForm, setShowForm] = useState(false)
  const [editingExam, setEditingExam] = useState<Exam | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name_en: '',
    name_ur: '',
    exam_type: 'monthly',
    start_date: '',
    end_date: '',
    session_id: '',
    campus_id: '',
  })

  const supabase = createClient()

  const examTypes = [
    { value: 'monthly', label: isRtl ? 'ماہانہ' : 'Monthly' },
    { value: 'midterm', label: isRtl ? 'نصف سالانہ' : 'Midterm' },
    { value: 'final', label: isRtl ? 'سالانہ' : 'Final' },
    { value: 'annual', label: isRtl ? 'سالانہ' : 'Annual' },
    { value: 'oral', label: isRtl ? 'زبانی' : 'Oral' },
    { value: 'practical', label: isRtl ? 'عملی' : 'Practical' },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('Not authenticated')
        return
      }

      const payload = {
        ...formData,
        name_ur: formData.name_ur || null,
        campus_id: formData.campus_id || null,
        created_by: user.id,
      }

      if (editingExam) {
        const { error } = await supabase
          .from('exams')
          .update(payload)
          .eq('id', editingExam.id)

        if (error) throw error
        toast.success(isRtl ? 'امتحان اپ ڈیٹ ہو گیا' : 'Exam updated successfully')
      } else {
        const { error } = await supabase.from('exams').insert(payload)
        if (error) throw error
        toast.success(isRtl ? 'امتحان بنایا گیا' : 'Exam created successfully')
      }

      // Refresh list
      const { data } = await supabase
        .from('exams')
        .select('*, session:sessions(name_en), campus:campuses(name)')
        .order('start_date', { ascending: false })

      if (data) setExams(data)

      setShowForm(false)
      setEditingExam(null)
      setFormData({
        name_en: '',
        name_ur: '',
        exam_type: 'monthly',
        start_date: '',
        end_date: '',
        session_id: '',
        campus_id: '',
      })
    } catch (error: any) {
      toast.error(error.message || 'Failed to save exam')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam)
    setFormData({
      name_en: exam.name_en,
      name_ur: exam.name_ur || '',
      exam_type: exam.exam_type,
      start_date: exam.start_date,
      end_date: exam.end_date,
      session_id: '',
      campus_id: '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(isRtl ? 'کیا آپ واقعی اس امتحان کو حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this exam?')) {
      return
    }

    try {
      const { error } = await supabase.from('exams').delete().eq('id', id)
      if (error) throw error

      setExams(exams.filter((e) => e.id !== id))
      toast.success(isRtl ? 'امتحان حذف ہو گیا' : 'Exam deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete exam')
    }
  }

  const handlePublish = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('exams')
        .update({ is_published: !currentStatus })
        .eq('id', id)

      if (error) throw error

      setExams(exams.map((e) => (e.id === id ? { ...e, is_published: !currentStatus } : e)))
      toast.success(
        !currentStatus
          ? isRtl ? 'امتحان شائع ہو گیا' : 'Exam published'
          : isRtl ? 'امتحان غیر شائع ہو گیا' : 'Exam unpublished'
      )
    } catch (error: any) {
      toast.error(error.message || 'Failed to update exam')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isRtl ? 'امتحانات کا انتظام' : 'Examination Management'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isRtl ? 'امتحانات بنائیں، شیڈول کریں اور منظم کریں' : 'Create, schedule, and manage examinations'}
          </p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          {isRtl ? 'نیا امتحان' : 'New Exam'}
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>
              {editingExam
                ? isRtl ? 'امتحان میں ترمیم' : 'Edit Exam'
                : isRtl ? 'نیا امتحان بنائیں' : 'Create New Exam'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRtl ? 'امتحان کا نام (انگلش)' : 'Exam Name (English)'}</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder={isRtl ? 'مثال: Monthly Test - October 2026' : 'e.g., Monthly Test - October 2026'}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isRtl ? 'امتحان کا نام (اردو)' : 'Exam Name (Urdu)'}</Label>
                  <Input
                    value={formData.name_ur}
                    onChange={(e) => setFormData({ ...formData, name_ur: e.target.value })}
                    placeholder={isRtl ? 'اختیاری' : 'Optional'}
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isRtl ? 'امتحان کی قسم' : 'Exam Type'}</Label>
                  <Select value={formData.exam_type} onValueChange={(val) => setFormData({ ...formData, exam_type: val })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {examTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isRtl ? 'تعلیمی سال' : 'Academic Session'}</Label>
                  <Select value={formData.session_id} onValueChange={(val) => setFormData({ ...formData, session_id: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder={isRtl ? 'منتخب کریں' : 'Select session'} />
                    </SelectTrigger>
                    <SelectContent>
                      {sessions.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isRtl ? 'شروع کی تاریخ' : 'Start Date'}</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isRtl ? 'اختتام کی تاریخ' : 'End Date'}</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    required
                  />
                </div>

                {campuses.length > 0 && (
                  <div className="space-y-2">
                    <Label>{isRtl ? 'کیمپس (اختیاری)' : 'Campus (Optional)'}</Label>
                    <Select value={formData.campus_id} onValueChange={(val) => setFormData({ ...formData, campus_id: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder={isRtl ? 'تمام کیمپس' : 'All campuses'} />
                      </SelectTrigger>
                      <SelectContent>
                        {campuses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingExam(null)
                  }}
                >
                  {isRtl ? 'منسوخ' : 'Cancel'}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (isRtl ? 'محفوظ ہو رہا ہے...' : 'Saving...') : isRtl ? 'محفوظ کریں' : 'Save Exam'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {exams.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {isRtl ? 'کوئی امتحان نہیں ملا' : 'No Exams Found'}
            </h3>
            <p className="text-muted-foreground text-center mb-4">
              {isRtl
                ? 'ابھی تک کوئی امتحان نہیں بنایا گیا۔ شروع کرنے کے لیے اوپر کلک کریں۔'
                : 'No examinations have been created yet. Click above to get started.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {exams.map((exam) => (
            <Card key={exam.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{exam.name_en}</h3>
                      {exam.name_ur && (
                        <span className="text-sm text-muted-foreground" dir="rtl">
                          ({exam.name_ur})
                        </span>
                      )}
                      {exam.is_published && (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                          {isRtl ? 'شائع شدہ' : 'Published'}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(exam.start_date).toLocaleDateString()} - {new Date(exam.end_date).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium uppercase">
                        {examTypes.find((t) => t.value === exam.exam_type)?.label || exam.exam_type}
                      </span>
                      {exam.campus && <span>📍 {exam.campus.name}</span>}
                      {exam.session && <span>📅 {exam.session.name_en}</span>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(exam)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePublish(exam.id, exam.is_published)}
                      className={exam.is_published ? 'text-amber-600' : 'text-green-600'}
                    >
                      {exam.is_published ? <Eye className="w-4 h-4" /> : <FileCheck className="w-4 h-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(exam.id)} className="text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
