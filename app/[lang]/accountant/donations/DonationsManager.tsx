'use client'

import { useState, useActionState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addDonation } from '@/lib/actions/donations'
import { Heart, Plus, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export function DonationsManager({ initialDonations, isUr }: { initialDonations: any[], isUr: boolean }) {
  const [donations, setDonations] = useState(initialDonations)
  const [isAdding, setIsAdding] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)

  const [state, formAction, pending] = useActionState(async (prevState: any, formData: FormData) => {
    const res = await addDonation(prevState, formData)
    if (res.error) {
      toast.error(res.error)
      return res
    }
    toast.success(isUr ? 'عطیہ درج کر لیا گیا' : 'Donation logged successfully')
    setDonations([res.donation, ...donations])
    setIsAdding(false)
    
    // Auto-generate PDF
    generateReceipt(res.donation)
    return res
  }, null)

  const generateReceipt = (donation: any) => {
    const doc = new jsPDF()
    doc.setFontSize(22)
    doc.text('Jamia Darul Uloom', 105, 20, { align: 'center' })
    doc.setFontSize(16)
    doc.text('Donation Receipt', 105, 30, { align: 'center' })
    
    doc.setFontSize(12)
    doc.text(`Receipt #: ${donation.receipt_num}`, 20, 50)
    doc.text(`Date: ${donation.date}`, 20, 60)
    doc.text(`Donor Name: ${donation.donor_name || 'Anonymous'}`, 20, 70)
    doc.text(`Amount: Rs ${donation.amount.toLocaleString()}`, 20, 80)
    doc.text(`Purpose: ${donation.purpose.toUpperCase()}`, 20, 90)
    if (donation.notes) {
      doc.text(`Notes: ${donation.notes}`, 20, 100)
    }
    
    doc.text('Thank you for your generous contribution!', 105, 130, { align: 'center' })
    doc.save(`Receipt_${donation.receipt_num}.pdf`)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{isUr ? 'عطیات (زکوٰۃ و صدقات)' : 'Donations Tracker'}</h1>
        <Button onClick={() => setIsAdding(!isAdding)}>
          <Plus className="w-4 h-4 mr-2" />
          {isUr ? 'نیا عطیہ' : 'Log Donation'}
        </Button>
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{isUr ? 'عطیہ درج کریں' : 'Log New Donation'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form ref={formRef} action={formAction} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isUr ? 'عطیہ دہندہ کا نام (اختیاری)' : 'Donor Name (Optional)'}</Label>
                  <Input name="donor_name" placeholder={isUr ? 'نامعلوم' : 'Anonymous'} />
                </div>
                <div className="space-y-2">
                  <Label>{isUr ? 'رقم (Rs)' : 'Amount (Rs)'}</Label>
                  <Input name="amount" type="number" required min="1" />
                </div>
                <div className="space-y-2">
                  <Label>{isUr ? 'مقصد' : 'Purpose'}</Label>
                  <Select name="purpose" defaultValue="general" required>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zakat">Zakat</SelectItem>
                      <SelectItem value="sadqa">Sadqa</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{isUr ? 'تاریخ' : 'Date'}</Label>
                  <Input name="date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>{isUr ? 'تفصیل / نوٹ' : 'Notes'}</Label>
                  <Input name="notes" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAdding(false)}>Cancel</Button>
                <Button type="submit" disabled={pending}>
                  {pending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  {isUr ? 'محفوظ کریں' : 'Save Donation'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-4">{isUr ? 'رسید نمبر' : 'Receipt #'}</th>
                  <th className="p-4">{isUr ? 'تاریخ' : 'Date'}</th>
                  <th className="p-4">{isUr ? 'عطیہ دہندہ' : 'Donor'}</th>
                  <th className="p-4">{isUr ? 'رقم' : 'Amount'}</th>
                  <th className="p-4">{isUr ? 'مقصد' : 'Purpose'}</th>
                  <th className="p-4 text-right">{isUr ? 'ایکشن' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {donations.length === 0 ? (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No donations found.</td></tr>
                ) : (
                  donations.map(d => (
                    <tr key={d.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4 font-medium">{d.receipt_num}</td>
                      <td className="p-4">{d.date}</td>
                      <td className="p-4">{d.donor_name || 'Anonymous'}</td>
                      <td className="p-4 font-bold text-emerald-600">Rs {d.amount.toLocaleString()}</td>
                      <td className="p-4 capitalize">{d.purpose}</td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => generateReceipt(d)}>
                          <Download className="w-4 h-4" />
                        </Button>
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
