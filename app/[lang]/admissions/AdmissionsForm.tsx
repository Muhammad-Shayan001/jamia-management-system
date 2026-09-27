'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function AdmissionsForm({ institutions, lang }: { institutions: any[], lang: string }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    institution_id: '',
    student_name_en: '',
    student_name_ur: '',
    father_name_en: '',
    guardian_phone: '',
    cnic_or_bform: '',
    gender: 'male',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const appNumber = `APP-${Math.floor(Math.random() * 1000000)}`
    
    const { error } = await supabase.from('admissions').insert({
      application_number: appNumber,
      institution_id: formData.institution_id,
      student_name_en: formData.student_name_en,
      student_name_ur: formData.student_name_ur,
      father_name_en: formData.father_name_en,
      guardian_phone: formData.guardian_phone,
      cnic_or_bform: formData.cnic_or_bform,
      gender: formData.gender,
      status: 'submitted'
    })

    if (error) {
      toast.error('Submission failed: ' + error.message)
    } else {
      toast.success('Application submitted successfully!')
      setSuccess(true)
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="text-center py-10">
        <h3 className="text-2xl font-bold text-emerald-600 mb-2">Application Received!</h3>
        <p className="text-gray-600">Your application has been submitted and is pending review.</p>
        <Button className="mt-6" onClick={() => setSuccess(false)}>Submit Another</Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Select Jamia (Institution)</Label>
        <Select required value={formData.institution_id} onValueChange={(v) => setFormData({...formData, institution_id: v})}>
          <SelectTrigger>
            <SelectValue placeholder="Choose institution..." />
          </SelectTrigger>
          <SelectContent>
            {institutions.map(inst => (
              <SelectItem key={inst.id} value={inst.id}>
                {lang === 'ur' && inst.urdu_name ? inst.urdu_name : inst.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Student Full Name (English)</Label>
          <Input required value={formData.student_name_en} onChange={e => setFormData({...formData, student_name_en: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Student Full Name (Urdu)</Label>
          <Input value={formData.student_name_ur} onChange={e => setFormData({...formData, student_name_ur: e.target.value})} dir="rtl" />
        </div>
        <div className="space-y-2">
          <Label>Father's Name (English)</Label>
          <Input required value={formData.father_name_en} onChange={e => setFormData({...formData, father_name_en: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Guardian Phone Number</Label>
          <Input required value={formData.guardian_phone} onChange={e => setFormData({...formData, guardian_phone: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>CNIC / B-Form Number</Label>
          <Input value={formData.cnic_or_bform} onChange={e => setFormData({...formData, cnic_or_bform: e.target.value})} />
        </div>
        <div className="space-y-2">
          <Label>Gender</Label>
          <Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={loading || !formData.institution_id}>
        {loading ? 'Submitting...' : 'Submit Application'}
      </Button>
    </form>
  )
}
