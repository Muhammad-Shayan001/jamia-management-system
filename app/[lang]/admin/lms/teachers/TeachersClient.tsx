'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, UserCog, Search } from 'lucide-react'

export default function TeachersClient({ initialData, institutionId, lang }: { initialData: any[], institutionId: string, lang: string }) {
  const [teachers, setTeachers] = useState(initialData)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()
  
  const [formData, setFormData] = useState({
    name_en: '',
    name_ur: '',
    employee_number: '',
    specialization: '',
  })

  const handleCreate = async () => {
    setLoading(true)
    const empNumber = formData.employee_number || `EMP-${Math.floor(Math.random() * 10000)}`
    
    const { data, error } = await supabase.from('teachers').insert([{
      institution_id: institutionId,
      name_en: formData.name_en,
      name_ur: formData.name_ur,
      employee_number: empNumber,
      specialization: formData.specialization,
      is_active: true
    }]).select()

    if (error) {
      toast.error('Failed to add teacher: ' + error.message)
    } else if (data) {
      toast.success('Teacher added successfully!')
      setTeachers([data[0], ...teachers])
      setOpen(false)
      setFormData({ name_en: '', name_ur: '', employee_number: '', specialization: '' })
    }
    setLoading(false)
  }

  const filtered = teachers.filter(t => 
    t.name_en?.toLowerCase().includes(search.toLowerCase()) || 
    t.employee_number?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search Teachers..." 
            className="pl-9 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto gap-2">
              <Plus className="h-4 w-4" />
              Add Teacher
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register New Teacher (Ustad)</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name (English)</Label>
                <Input value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} placeholder="e.g. Mufti Tariq" />
              </div>
              <div className="space-y-2">
                <Label>Full Name (Urdu)</Label>
                <Input value={formData.name_ur} onChange={e => setFormData({...formData, name_ur: e.target.value})} dir="rtl" />
              </div>
              <div className="space-y-2">
                <Label>Employee ID (Optional)</Label>
                <Input value={formData.employee_number} onChange={e => setFormData({...formData, employee_number: e.target.value})} placeholder="Auto-generated if blank" />
              </div>
              <div className="space-y-2">
                <Label>Specialization (Takhassus)</Label>
                <Input value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} placeholder="e.g. Fiqh, Hadith, Hifz" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={loading || !formData.name_en}>
                {loading ? 'Adding...' : 'Add Teacher'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Emp ID</TableHead>
              <TableHead>Name (English)</TableHead>
              <TableHead>Name (Urdu)</TableHead>
              <TableHead>Specialization</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(t => (
              <TableRow key={t.id}>
                <TableCell className="font-medium text-xs">{t.employee_number}</TableCell>
                <TableCell>{t.name_en}</TableCell>
                <TableCell className="font-arabic">{t.name_ur}</TableCell>
                <TableCell>{t.specialization}</TableCell>
                <TableCell>
                  <Badge variant={t.is_active ? 'default' : 'secondary'}>
                    {t.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  <UserCog className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No teachers found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
