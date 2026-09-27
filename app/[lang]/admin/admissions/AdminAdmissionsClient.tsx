'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { FileText, UserCheck, XCircle } from 'lucide-react'

export default function AdminAdmissionsClient({ initialData, lang }: { initialData: any[], lang: string }) {
  const [admissions, setAdmissions] = useState(initialData)
  const [selected, setSelected] = useState<any>(null)
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  const handleUpdateStatus = async (status: string) => {
    const { error } = await supabase
      .from('admissions')
      .update({ status })
      .eq('id', selected.id)

    if (error) {
      toast.error('Failed to update status')
    } else {
      toast.success(`Application marked as ${status}`)
      setAdmissions(admissions.map(a => a.id === selected.id ? { ...a, status } : a))
      setOpen(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <Table>
        <TableHeader className="bg-gray-50/50">
          <TableRow>
            <TableHead>App Number</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Father's Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {admissions.map(app => (
            <TableRow key={app.id}>
              <TableCell className="font-medium text-xs">{app.application_number}</TableCell>
              <TableCell>{app.student_name_en}</TableCell>
              <TableCell>{app.father_name_en}</TableCell>
              <TableCell>
                <Badge variant={app.status === 'approved' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                  {app.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Button size="sm" variant="outline" onClick={() => { setSelected(app); setOpen(true) }}>
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {admissions.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-gray-500">No applications found.</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong className="text-gray-500">App No:</strong> <br/>{selected.application_number}</div>
                <div><strong className="text-gray-500">Name:</strong> <br/>{selected.student_name_en}</div>
                <div><strong className="text-gray-500">Father's Name:</strong> <br/>{selected.father_name_en}</div>
                <div><strong className="text-gray-500">Phone:</strong> <br/>{selected.guardian_phone}</div>
                <div><strong className="text-gray-500">CNIC:</strong> <br/>{selected.cnic_or_bform || 'N/A'}</div>
                <div><strong className="text-gray-500">Current Status:</strong> <br/>{selected.status}</div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="destructive" onClick={() => handleUpdateStatus('rejected')}>Reject</Button>
            <Button variant="secondary" onClick={() => handleUpdateStatus('interview')}>Call for Interview</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleUpdateStatus('approved')}>Approve Admission</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
