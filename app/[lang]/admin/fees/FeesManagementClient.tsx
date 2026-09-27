'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wallet, Plus, Edit, Trash2, DollarSign } from 'lucide-react'
import { toast } from 'sonner'

type FeeStructure = {
  id: string
  name_en: string
  name_ur: string | null
  admission_fee: number
  monthly_tuition: number
  hostel_fee: number
  mess_fee: number
  transport_fee: number
  exam_fee: number
  library_fee: number
  sports_fee: number
  misc_fee: number
  is_active: boolean
  class?: { name_en: string }
  level?: { name_en: string }
}

export default function FeesManagementClient({
  initialFeeStructures,
  classes,
  levels,
  isRtl,
}: {
  initialFeeStructures: FeeStructure[]
  classes: any[]
  levels: any[]
  isRtl: boolean
}) {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(initialFeeStructures)
  const [showForm, setShowForm] = useState(false)
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null)
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    name_en: '',
    name_ur: '',
    description: '',
    admission_fee: 0,
    monthly_tuition: 0,
    hostel_fee: 0,
    mess_fee: 0,
    transport_fee: 0,
    exam_fee: 0,
    library_fee: 0,
    sports_fee: 0,
    misc_fee: 0,
    applies_to_class_id: '',
    applies_to_level_id: '',
  })

  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        name_ur: formData.name_ur || null,
        applies_to_class_id: formData.applies_to_class_id || null,
        applies_to_level_id: formData.applies_to_level_id || null,
      }

      if (editingStructure) {
        const { error } = await supabase
          .from('fee_structures')
          .update(payload)
          .eq('id', editingStructure.id)

        if (error) throw error
        toast.success(isRtl ? 'فیس سٹرکچر اپ ڈیٹ ہو گیا' : 'Fee structure updated successfully')
      } else {
        const { error } = await supabase.from('fee_structures').insert(payload)
        if (error) throw error
        toast.success(isRtl ? 'فیس سٹرکچر بنایا گیا' : 'Fee structure created successfully')
      }

      // Refresh list
      const { data } = await supabase
        .from('fee_structures')
        .select('*, class:classes(name_en), level:levels(name_en)')
        .order('created_at', { ascending: false })

      if (data) setFeeStructures(data)

      setShowForm(false)
      setEditingStructure(null)
      resetForm()
    } catch (error: any) {
      toast.error(error.message || 'Failed to save fee structure')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_ur: '',
      description: '',
      admission_fee: 0,
      monthly_tuition: 0,
      hostel_fee: 0,
      mess_fee: 0,
      transport_fee: 0,
      exam_fee: 0,
      library_fee: 0,
      sports_fee: 0,
      misc_fee: 0,
      applies_to_class_id: '',
      applies_to_level_id: '',
    })
  }

  const handleEdit = (structure: FeeStructure) => {
    setEditingStructure(structure)
    setFormData({
      name_en: structure.name_en,
      name_ur: structure.name_ur || '',
      description: '',
      admission_fee: structure.admission_fee,
      monthly_tuition: structure.monthly_tuition,
      hostel_fee: structure.hostel_fee,
      mess_fee: structure.mess_fee,
      transport_fee: structure.transport_fee,
      exam_fee: structure.exam_fee,
      library_fee: structure.library_fee,
      sports_fee: structure.sports_fee,
      misc_fee: structure.misc_fee,
      applies_to_class_id: '',
      applies_to_level_id: '',
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(isRtl ? 'کیا آپ واقعی اس فیس سٹرکچر کو حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this fee structure?')) {
      return
    }

    try {
      const { error } = await supabase.from('fee_structures').delete().eq('id', id)
      if (error) throw error

      setFeeStructures(feeStructures.filter((f) => f.id !== id))
      toast.success(isRtl ? 'فیس سٹرکچر حذف ہو گیا' : 'Fee structure deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete fee structure')
    }
  }

  const calculateTotal = () => {
    return Object.entries(formData)
      .filter(([key]) => key.endsWith('_fee') || key === 'monthly_tuition')
      .reduce((sum, [, value]) => sum + (Number(value) || 0), 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {isRtl ? 'فیس کا انتظام' : 'Fee Management'}
          </h2>
          <p className="text-muted-foreground mt-1">
            {isRtl ? 'فیس سٹرکچر بنائیں اور منظم کریں' : 'Create and manage fee structures'}
          </p>
        </div>
        <Button onClick={() => { setShowForm(!showForm); setEditingStructure(null); resetForm(); }} className="gap-2">
          <Plus className="w-4 h-4" />
          {isRtl ? 'نیا فیس سٹرکچر' : 'New Fee Structure'}
        </Button>
      </div>

      {showForm && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>
              {editingStructure
                ? isRtl ? 'فیس سٹرکچر میں ترمیم' : 'Edit Fee Structure'
                : isRtl ? 'نیا فیس سٹرکچر بنائیں' : 'Create New Fee Structure'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRtl ? 'نام (انگلش)' : 'Name (English)'} *</Label>
                  <Input
                    value={formData.name_en}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    placeholder="e.g., Standard Fee Structure 2026"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>{isRtl ? 'نام (اردو)' : 'Name (Urdu)'}</Label>
                  <Input
                    value={formData.name_ur}
                    onChange={(e) => setFormData({ ...formData, name_ur: e.target.value })}
                    placeholder="اختیاری"
                    dir="rtl"
                  />
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  {isRtl ? 'فیس کی تفصیلات (PKR)' : 'Fee Components (PKR)'}
                </h3>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>{isRtl ? 'داخلہ فیس' : 'Admission Fee'}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.admission_fee}
                      onChange={(e) => setFormData({ ...formData, admission_fee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{isRtl ? 'ماہانہ ٹیوشن' : 'Monthly Tuition'} *</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.monthly_tuition}
                      onChange={(e) => setFormData({ ...formData, monthly_tuition: parseFloat(e.target.value) || 0 })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{isRtl ? 'ہاسٹل فیس' : 'Hostel Fee'}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.hostel_fee}
                      onChange={(e) => setFormData({ ...formData, hostel_fee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{isRtl ? 'میس فیس' : 'Mess Fee'}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.mess_fee}
                      onChange={(e) => setFormData({ ...formData, mess_fee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{isRtl ? 'ٹرانسپورٹ فیس' : 'Transport Fee'}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.transport_fee}
                      onChange={(e) => setFormData({ ...formData, transport_fee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{isRtl ? 'امتحان فیس' : 'Exam Fee'}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.exam_fee}
                      onChange={(e) => setFormData({ ...formData, exam_fee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{isRtl ? 'لائبریری فیس' : 'Library Fee'}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.library_fee}
                      onChange={(e) => setFormData({ ...formData, library_fee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{isRtl ? 'سپورٹس فیس' : 'Sports Fee'}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.sports_fee}
                      onChange={(e) => setFormData({ ...formData, sports_fee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{isRtl ? 'متفرق فیس' : 'Miscellaneous'}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.misc_fee}
                      onChange={(e) => setFormData({ ...formData, misc_fee: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div className="p-3 bg-primary/10 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{isRtl ? 'کل ماہانہ فیس:' : 'Total Monthly Fee:'}</span>
                    <span className="text-xl font-bold text-primary">PKR {calculateTotal().toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isRtl ? 'کلاس (اختیاری)' : 'Applies to Class (Optional)'}</Label>
                  <Select value={formData.applies_to_class_id} onValueChange={(val) => setFormData({ ...formData, applies_to_class_id: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder={isRtl ? 'تمام کلاسیں' : 'All classes'} />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isRtl ? 'درجہ (اختیاری)' : 'Applies to Level (Optional)'}</Label>
                  <Select value={formData.applies_to_level_id} onValueChange={(val) => setFormData({ ...formData, applies_to_level_id: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder={isRtl ? 'تمام درجے' : 'All levels'} />
                    </SelectTrigger>
                    <SelectContent>
                      {levels.map((l) => (
                        <SelectItem key={l.id} value={l.id}>
                          {l.name_en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    setEditingStructure(null)
                    resetForm()
                  }}
                >
                  {isRtl ? 'منسوخ' : 'Cancel'}
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (isRtl ? 'محفوظ ہو رہا ہے...' : 'Saving...') : isRtl ? 'محفوظ کریں' : 'Save Structure'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {feeStructures.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Wallet className="w-16 h-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {isRtl ? 'کوئی فیس سٹرکچر نہیں' : 'No Fee Structures'}
            </h3>
            <p className="text-muted-foreground text-center">
              {isRtl
                ? 'فیس سٹرکچر بنانے کے لیے اوپر کلک کریں'
                : 'Click above to create your first fee structure'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {feeStructures.map((structure) => (
            <Card key={structure.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{structure.name_en}</h3>
                      {structure.name_ur && (
                        <span className="text-sm text-muted-foreground" dir="rtl">
                          ({structure.name_ur})
                        </span>
                      )}
                      {structure.is_active && (
                        <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium">
                          {isRtl ? 'فعال' : 'Active'}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-4">
                      {structure.admission_fee > 0 && (
                        <div>
                          <p className="text-muted-foreground">{isRtl ? 'داخلہ' : 'Admission'}</p>
                          <p className="font-semibold">PKR {structure.admission_fee.toLocaleString()}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">{isRtl ? 'ماہانہ' : 'Monthly'}</p>
                        <p className="font-semibold text-primary">PKR {structure.monthly_tuition.toLocaleString()}</p>
                      </div>
                      {structure.hostel_fee > 0 && (
                        <div>
                          <p className="text-muted-foreground">{isRtl ? 'ہاسٹل' : 'Hostel'}</p>
                          <p className="font-semibold">PKR {structure.hostel_fee.toLocaleString()}</p>
                        </div>
                      )}
                      {structure.exam_fee > 0 && (
                        <div>
                          <p className="text-muted-foreground">{isRtl ? 'امتحان' : 'Exam'}</p>
                          <p className="font-semibold">PKR {structure.exam_fee.toLocaleString()}</p>
                        </div>
                      )}
                    </div>

                    {(structure.class || structure.level) && (
                      <div className="flex gap-2 mt-3">
                        {structure.class && (
                          <span className="px-2 py-1 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs">
                            📚 {structure.class.name_en}
                          </span>
                        )}
                        {structure.level && (
                          <span className="px-2 py-1 rounded bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs">
                            🎓 {structure.level.name_en}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(structure)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDelete(structure.id)} className="text-red-600">
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
