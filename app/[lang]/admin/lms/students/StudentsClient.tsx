'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Search, GraduationCap } from 'lucide-react'

export default function StudentsClient({ initialData, classes, institutionId, lang }: { initialData: any[], classes: any[], institutionId: string, lang: string }) {
  const [students, setStudents] = useState(initialData)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<any>(null)
  const [selectedClass, setSelectedClass] = useState('')
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleAssignClass = async () => {
    setLoading(true)
    const { error } = await supabase
      .from('students')
      .update({ class_id: selectedClass })
      .eq('id', selectedStudent.id)

    if (error) {
      toast.error('Failed to assign class')
    } else {
      toast.success('Student assigned successfully!')
      const assignedClass = classes.find(c => c.id === selectedClass)
      setStudents(students.map(s => s.id === selectedStudent.id ? { ...s, class_id: selectedClass, classes: assignedClass } : s))
      setOpen(false)
    }
    setLoading(false)
  }

  const filtered = students.filter(s => 
    s.name_en?.toLowerCase().includes(search.toLowerCase()) || 
    s.admission_number?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-4">
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search Students..." 
          className="pl-9 bg-card"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead>Admission No</TableHead>
              <TableHead>Name (English)</TableHead>
              <TableHead>Name (Urdu)</TableHead>
              <TableHead>Current Class/Daraja</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(s => (
              <TableRow key={s.id}>
                <TableCell className="font-medium text-xs">{s.admission_number}</TableCell>
                <TableCell>{s.name_en}</TableCell>
                <TableCell className="font-arabic">{s.name_ur}</TableCell>
                <TableCell>
                  {s.classes ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                      {lang === 'ur' && s.classes.name_ur ? s.classes.name_ur : s.classes.name_en}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Unassigned</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button size="sm" variant="outline" onClick={() => { setSelectedStudent(s); setSelectedClass(s.class_id || ''); setOpen(true) }}>
                    Assign Class
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  No students found. Enroll them via Admissions first.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Daraja / Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-600">
              Assign <strong>{selectedStudent?.name_en}</strong> to a specific class/Daraja.
            </p>
            <div className="space-y-2">
              <Label>Select Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name_en} {c.name_ur ? `(${c.name_ur})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignClass} disabled={loading || !selectedClass}>
              {loading ? 'Assigning...' : 'Save Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
