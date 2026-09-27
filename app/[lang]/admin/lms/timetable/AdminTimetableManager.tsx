'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Clock, Plus, Trash2 } from 'lucide-react'

const DAYS = [
  { id: 1, name: 'Monday' },
  { id: 2, name: 'Tuesday' },
  { id: 3, name: 'Wednesday' },
  { id: 4, name: 'Thursday' },
  { id: 5, name: 'Friday' },
  { id: 6, name: 'Saturday' },
  { id: 7, name: 'Sunday' }
]

export default function AdminTimetableManager({ classes, subjects, teachers, initialTimetable, institutionId, lang }: { classes: any[], subjects: any[], teachers: any[], initialTimetable: any[], institutionId: string, lang: string }) {
  const [timetable, setTimetable] = useState(initialTimetable)
  const [selectedClass, setSelectedClass] = useState<string>(classes[0]?.id || '')
  
  // Dialog state
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    day_of_week: 1,
    period: 1,
    subject_id: '',
    teacher_id: '',
    start_time: '08:00',
    end_time: '09:00'
  })

  const supabase = createClient()

  // Filter subjects for the selected class
  const classSubjects = subjects.filter(s => s.class_id === selectedClass)
  // Filter timetable for the selected class
  const classTimetable = timetable.filter(t => t.class_id === selectedClass)

  const handleAddSlot = async () => {
    setLoading(true)
    const { data, error } = await supabase.from('timetable').insert([{
      institution_id: institutionId,
      class_id: selectedClass,
      day_of_week: formData.day_of_week,
      period: formData.period,
      subject_id: formData.subject_id,
      teacher_id: formData.teacher_id,
      start_time: formData.start_time,
      end_time: formData.end_time
    }]).select()

    if (error) {
      toast.error('Failed to schedule: ' + error.message)
    } else if (data) {
      toast.success('Period scheduled successfully!')
      setTimetable([...timetable, data[0]])
      setOpen(false)
    }
    setLoading(false)
  }

  const handleDeleteSlot = async (id: string) => {
    const { error } = await supabase.from('timetable').delete().eq('id', id)
    if (error) {
      toast.error('Failed to delete')
    } else {
      toast.success('Period removed')
      setTimetable(timetable.filter(t => t.id !== id))
    }
  }

  const getSubjectName = (id: string) => subjects.find(s => s.id === id)?.name_en || 'Unknown Subject'
  const getTeacherName = (id: string) => teachers.find(t => t.id === id)?.name_en || 'Unknown Teacher'

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <span className="text-sm font-semibold text-gray-500 whitespace-nowrap">Select Daraja:</span>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Choose Class..." />
            </SelectTrigger>
            <SelectContent>
              {classes.map(c => (
                <SelectItem key={c.id} value={c.id}>{c.name_en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="mt-4 sm:mt-0 gap-2" onClick={() => { setFormData({...formData, subject_id: '', teacher_id: ''}); setOpen(true) }} disabled={!selectedClass}>
          <Plus className="w-4 h-4" /> Add Period
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {DAYS.map(day => {
          const daySlots = classTimetable.filter(t => t.day_of_week === day.id).sort((a, b) => a.period - b.period)
          return (
            <div key={day.id} className="flex flex-col gap-3">
              <div className="bg-primary/10 text-primary font-bold text-center py-2 rounded-lg border border-primary/20">
                {day.name}
              </div>
              
              {daySlots.length === 0 ? (
                <div className="text-center text-xs text-gray-400 py-4 border border-dashed rounded-lg">No classes</div>
              ) : (
                daySlots.map(slot => (
                  <Card key={slot.id} className="relative group border-blue-100 hover:border-blue-300 transition-all">
                    <button 
                      onClick={() => handleDeleteSlot(slot.id)}
                      className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    <CardHeader className="p-3 pb-1 border-b border-gray-50 bg-gray-50/50">
                      <div className="flex justify-between items-center">
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">Period {slot.period}</Badge>
                        <span className="text-[10px] text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3"/> {slot.start_time.slice(0,5)}</span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 pt-2">
                      <p className="font-bold text-sm text-blue-900 leading-tight">{getSubjectName(slot.subject_id)}</p>
                      <p className="text-xs text-gray-500 mt-1">{getTeacherName(slot.teacher_id)}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule New Period</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Day</label>
                <Select value={formData.day_of_week.toString()} onValueChange={(v) => setFormData({...formData, day_of_week: parseInt(v)})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DAYS.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Period Number</label>
                <Select value={formData.period.toString()} onValueChange={(v) => setFormData({...formData, period: parseInt(v)})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8].map(p => <SelectItem key={p} value={p.toString()}>Period {p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Subject (Kitab)</label>
              <Select value={formData.subject_id} onValueChange={(v) => setFormData({...formData, subject_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
                <SelectContent>
                  {classSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name_en}</SelectItem>)}
                  {classSubjects.length === 0 && <SelectItem value="none" disabled>No subjects found for this class</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold">Teacher (Ustad)</label>
              <Select value={formData.teacher_id} onValueChange={(v) => setFormData({...formData, teacher_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name_en}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Start Time</label>
                <Input type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">End Time</label>
                <Input type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAddSlot} disabled={loading || !formData.subject_id || !formData.teacher_id}>
              {loading ? 'Saving...' : 'Save Period'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
