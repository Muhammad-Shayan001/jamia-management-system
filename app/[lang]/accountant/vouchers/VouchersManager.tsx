'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Search, Download, CheckCircle2, AlertTriangle, FileText, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { markVoucherPaid, voidVoucher } from '@/lib/actions/finance'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function VouchersManager({ initialVouchers, isUr }: { initialVouchers: any[], isUr: boolean }) {
  const [vouchers, setVouchers] = useState(initialVouchers)
  const [search, setSearch] = useState('')
  const router = useRouter()

  const handleMarkPaid = async (id: string) => {
    if (!confirm('Are you sure you want to mark this voucher as paid?')) return
    const res = await markVoucherPaid(id, 'cash')
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success('Voucher marked as paid')
    router.refresh()
  }

  const handleVoid = async (id: string) => {
    const reason = prompt('Please enter reason for voiding this voucher:')
    if (!reason) return
    const res = await voidVoucher(id, reason)
    if (res.error) {
      toast.error(res.error)
      return
    }
    toast.success('Voucher voided')
    router.refresh()
  }

  const generateVoucherPDF = (v: any) => {
    const doc = new jsPDF()
    doc.setFontSize(22)
    doc.text('Jamia Darul Uloom', 105, 20, { align: 'center' })
    doc.setFontSize(16)
    doc.text('FEE VOUCHER', 105, 30, { align: 'center' })
    
    doc.setFontSize(12)
    doc.text(`Voucher #: ${v.voucher_number}`, 20, 50)
    doc.text(`Student: ${v.student?.name_en || 'Unknown'} (${v.student?.admission_number || 'N/A'})`, 20, 60)
    doc.text(`Class: ${v.student?.class?.name_en || 'N/A'}`, 20, 70)
    doc.text(`Fee Head: ${v.fee_structure?.fee_head || 'N/A'}`, 20, 80)
    doc.text(`Month/Year: ${v.month_year || 'N/A'}`, 20, 90)
    doc.text(`Due Date: ${v.due_date}`, 20, 100)
    
    doc.setFontSize(14)
    doc.text(`Total Amount Due: Rs ${v.amount.toLocaleString()}`, 20, 120)
    
    doc.setFontSize(12)
    doc.text(`Status: ${v.status.toUpperCase()}`, 20, 130)
    
    doc.text('Please pay before due date to avoid late fees.', 105, 150, { align: 'center' })
    doc.save(`Voucher_${v.voucher_number}.pdf`)
  }

  const filtered = vouchers.filter(v => 
    v.voucher_number.toLowerCase().includes(search.toLowerCase()) ||
    v.student?.name_en.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return <Badge className="bg-emerald-500">Paid</Badge>
      case 'unpaid': return <Badge variant="outline" className="text-orange-600 border-orange-600">Unpaid</Badge>
      case 'overdue': return <Badge variant="destructive">Overdue</Badge>
      case 'waived': return <Badge variant="secondary">Voided</Badge>
      default: return <Badge>{status}</Badge>
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{isUr ? 'واؤچرز مینجمنٹ' : 'Fee Vouchers Management'}</h1>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isUr ? 'واؤچر یا طالب علم تلاش کریں...' : 'Search voucher or student...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-4">{isUr ? 'واؤچر نمبر' : 'Voucher #'}</th>
                  <th className="p-4">{isUr ? 'طالب علم' : 'Student'}</th>
                  <th className="p-4">{isUr ? 'کلاس' : 'Class'}</th>
                  <th className="p-4">{isUr ? 'مہینہ/سال' : 'Month'}</th>
                  <th className="p-4">{isUr ? 'رقم' : 'Amount'}</th>
                  <th className="p-4">{isUr ? 'سٹیٹس' : 'Status'}</th>
                  <th className="p-4 text-right">{isUr ? 'ایکشن' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No vouchers found.</td></tr>
                ) : (
                  filtered.map(v => (
                    <tr key={v.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-medium">{v.voucher_number}</td>
                      <td className="p-4">{v.student?.name_en} <br/><span className="text-xs text-muted-foreground">{v.student?.admission_number}</span></td>
                      <td className="p-4">{v.student?.class?.name_en}</td>
                      <td className="p-4">{v.month_year}</td>
                      <td className="p-4 font-bold">Rs {v.amount.toLocaleString()}</td>
                      <td className="p-4">{getStatusBadge(v.status)}</td>
                      <td className="p-4 text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => generateVoucherPDF(v)}>
                          <Download className="w-4 h-4" />
                        </Button>
                        {v.status === 'unpaid' || v.status === 'overdue' ? (
                          <>
                            <Button variant="outline" size="sm" className="text-emerald-600 border-emerald-600 hover:bg-emerald-50" onClick={() => handleMarkPaid(v.id)}>
                              <CheckCircle2 className="w-4 h-4 mr-1" /> Pay
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-600 hover:bg-red-50" onClick={() => handleVoid(v.id)}>
                              <XCircle className="w-4 h-4 mr-1" /> Void
                            </Button>
                          </>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
