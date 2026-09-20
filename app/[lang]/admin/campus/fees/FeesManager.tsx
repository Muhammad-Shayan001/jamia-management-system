'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Wallet,
  Plus,
  Search,
  Download,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Filter,
  DollarSign,
} from 'lucide-react'
import { toast } from 'sonner'

export interface VoucherItem {
  id: string
  voucher_number: string
  student_name_en: string
  student_name_ur: string
  admission_number: string
  class_name: string
  month_year: string
  amount: number
  due_date: string
  status: 'paid' | 'unpaid' | 'overdue'
  paid_at?: string
  fee_head: string
}

const INITIAL_VOUCHERS: VoucherItem[] = [
  {
    id: 'v-1',
    voucher_number: 'JAM-2025-001',
    student_name_en: 'Muhammad Abdullah',
    student_name_ur: 'محمد عبداللہ',
    admission_number: 'JAM-101',
    class_name: 'Ibtidai Awwal',
    month_year: 'September 2025',
    amount: 4500,
    due_date: '2025-09-10',
    status: 'paid',
    paid_at: '2025-09-05',
    fee_head: 'Monthly Tuition & Boarding',
  },
  {
    id: 'v-2',
    voucher_number: 'JAM-2025-002',
    student_name_en: 'Ahmad Hassan',
    student_name_ur: 'احمد حسن',
    admission_number: 'JAM-102',
    class_name: 'Ibtidai Awwal',
    month_year: 'September 2025',
    amount: 4500,
    due_date: '2025-09-10',
    status: 'unpaid',
    fee_head: 'Monthly Tuition',
  },
  {
    id: 'v-3',
    voucher_number: 'JAM-2025-003',
    student_name_en: 'Usman Ali',
    student_name_ur: 'عثمان علی',
    admission_number: 'JAM-103',
    class_name: 'Ibtidai Doum',
    month_year: 'September 2025',
    amount: 6000,
    due_date: '2025-09-01',
    status: 'overdue',
    fee_head: 'Tuition & Hostel',
  },
  {
    id: 'v-4',
    voucher_number: 'JAM-2025-004',
    student_name_en: 'Zubair Tariq',
    student_name_ur: 'زبیر طارق',
    admission_number: 'JAM-104',
    class_name: 'Mutawassit Awwal',
    month_year: 'September 2025',
    amount: 5000,
    due_date: '2025-09-10',
    status: 'paid',
    paid_at: '2025-09-08',
    fee_head: 'Monthly Tuition',
  },
  {
    id: 'v-5',
    voucher_number: 'JAM-2025-005',
    student_name_en: 'Bilal Khan',
    student_name_ur: 'بلال خان',
    admission_number: 'JAM-105',
    class_name: 'Ibtidai Doum',
    month_year: 'September 2025',
    amount: 3500,
    due_date: '2025-09-10',
    status: 'unpaid',
    fee_head: 'Monthly Tuition',
  },
]

export function FeesManager({
  initialVouchers,
  lang,
}: {
  initialVouchers?: any[]
  lang: string
}) {
  const isRtl = lang === 'ur'
  const [vouchers, setVouchers] = useState<VoucherItem[]>(
    initialVouchers && initialVouchers.length > 0
      ? initialVouchers.map((v, i) => ({
          id: v.id || `v-${i}`,
          voucher_number: v.voucher_number || `JAM-2025-00${i + 1}`,
          student_name_en: v.students?.name_en || 'Student ' + (i + 1),
          student_name_ur: v.students?.name_ur || 'طالب علم ' + (i + 1),
          admission_number: v.students?.admission_number || `JAM-${100 + i}`,
          class_name: 'Class ' + ((i % 3) + 1),
          month_year: v.month_year || 'September 2025',
          amount: Number(v.amount) || 4500,
          due_date: v.due_date || '2025-09-10',
          status: v.status || 'unpaid',
          paid_at: v.paid_at,
          fee_head: 'Tuition Fee',
        }))
      : INITIAL_VOUCHERS
  )

  const [filter, setFilter] = useState<'all' | 'paid' | 'unpaid' | 'overdue'>('all')
  const [search, setSearch] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // New Voucher Form State
  const [studentName, setStudentName] = useState('')
  const [admissionNo, setAdmissionNo] = useState('')
  const [feeHead, setFeeHead] = useState('Monthly Tuition')
  const [amount, setAmount] = useState('4500')
  const [dueDate, setDueDate] = useState('2025-09-15')

  const totalCollected = vouchers
    .filter((v) => v.status === 'paid')
    .reduce((acc, v) => acc + v.amount, 0)

  const totalOutstanding = vouchers
    .filter((v) => v.status === 'unpaid' || v.status === 'overdue')
    .reduce((acc, v) => acc + v.amount, 0)

  const filteredVouchers = vouchers.filter((v) => {
    const matchesFilter = filter === 'all' || v.status === filter
    const matchesSearch =
      v.student_name_en.toLowerCase().includes(search.toLowerCase()) ||
      v.student_name_ur.includes(search) ||
      v.voucher_number.toLowerCase().includes(search.toLowerCase()) ||
      v.admission_number.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const markAsPaid = (id: string) => {
    setVouchers((prev) =>
      prev.map((v) =>
        v.id === id
          ? {
              ...v,
              status: 'paid',
              paid_at: new Date().toISOString().split('T')[0],
            }
          : v
      )
    )
    toast.success(isRtl ? 'واؤچر کی ادائیگی درج کر لی گئی ہے' : 'Voucher marked as PAID successfully!', {
      icon: '✅',
    })
  }

  const sendReminder = (v: VoucherItem) => {
    toast.info(
      isRtl
        ? `یاد دہانی واٹس ایپ / ایس ایم ایس کے ذریعے ${v.student_name_ur} کو ارسال کر دی گئی`
        : `Fee reminder sent via WhatsApp to ${v.student_name_en}`,
      { icon: '📱' }
    )
  }

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentName || !amount) {
      toast.error('Please enter student name and amount')
      return
    }

    const newV: VoucherItem = {
      id: `v-${Date.now()}`,
      voucher_number: `JAM-2025-${Math.floor(100 + Math.random() * 900)}`,
      student_name_en: studentName,
      student_name_ur: studentName,
      admission_number: admissionNo || `JAM-${Math.floor(100 + Math.random() * 900)}`,
      class_name: 'Ibtidai Awwal',
      month_year: 'September 2025',
      amount: Number(amount),
      due_date: dueDate,
      status: 'unpaid',
      fee_head: feeHead,
    }

    setVouchers([newV, ...vouchers])
    setIsDialogOpen(false)
    setStudentName('')
    setAdmissionNo('')
    toast.success(isRtl ? 'نیا فیس واؤچر کامیابی سے تیار ہو گیا' : 'New fee voucher generated successfully!')
  }

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <Wallet className="w-6 h-6 text-accent" />
            {isRtl ? 'فیس و مالیاتی نظام' : 'Fee & Voucher Management'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isRtl
              ? 'طلباء کے فیس واؤچرز، وصولیوں اور واجبات کی تفصیلات۔'
              : 'Generate, track, and reconcile student fee vouchers and collections.'}
          </p>
        </div>

        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4 text-accent" />
          {isRtl ? 'نیا واؤچر بنائیں' : 'Generate Voucher'}
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-primary/15 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isRtl ? 'کل وصول شدہ رقم' : 'Total Collected'}
            </CardTitle>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">PKR {totalCollected.toLocaleString()}</div>
            <p className="text-xs text-emerald-600 mt-1 font-medium">
              {vouchers.filter((v) => v.status === 'paid').length} {isRtl ? 'واؤچرز ادا شدہ' : 'vouchers cleared'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/15 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isRtl ? 'واجب الادا بقایا جات' : 'Total Outstanding'}
            </CardTitle>
            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700 dark:text-amber-400">
              PKR {totalOutstanding.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {vouchers.filter((v) => v.status === 'unpaid').length} {isRtl ? 'واؤچرز غیر ادا شدہ' : 'pending collection'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/15 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isRtl ? 'میعاد ختم (اوور ڈیو)' : 'Overdue Vouchers'}
            </CardTitle>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">
              {vouchers.filter((v) => v.status === 'overdue').length}
            </div>
            <p className="text-xs text-rose-600 mt-1 font-medium">
              {isRtl ? 'فوری یاد دہانی درکار ہے' : 'Reminders required'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/15 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {isRtl ? 'وصولی کا تناسب' : 'Recovery Rate'}
            </CardTitle>
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <DollarSign className="w-4 h-4 text-accent" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {vouchers.length > 0
                ? Math.round((vouchers.filter((v) => v.status === 'paid').length / vouchers.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">{isRtl ? 'موجودہ تعلیمی سال' : 'Academic Session'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card className="border-primary/15 shadow-sm">
        <CardContent className="pt-5 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground rtl:left-auto rtl:right-3" />
              <Input
                placeholder={isRtl ? 'طالب علم یا واؤچر نمبر تلاش کریں...' : 'Search student or voucher #...'}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rtl:pl-3 rtl:pr-9 bg-background/50 h-10 border-input"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'all'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {isRtl ? 'تمام واؤچرز' : 'All'} ({vouchers.length})
              </button>
              <button
                onClick={() => setFilter('paid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'paid'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {isRtl ? 'ادا شدہ' : 'Paid'} ({vouchers.filter((v) => v.status === 'paid').length})
              </button>
              <button
                onClick={() => setFilter('unpaid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'unpaid'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {isRtl ? 'غیر ادا شدہ' : 'Unpaid'} ({vouchers.filter((v) => v.status === 'unpaid').length})
              </button>
              <button
                onClick={() => setFilter('overdue')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filter === 'overdue'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {isRtl ? 'میعاد ختم' : 'Overdue'} ({vouchers.filter((v) => v.status === 'overdue').length})
              </button>
            </div>
          </div>

          {/* Vouchers List */}
          <div className="space-y-3 pt-2">
            {filteredVouchers.length > 0 ? (
              filteredVouchers.map((v) => {
                const displayName = isRtl && v.student_name_ur ? v.student_name_ur : v.student_name_en

                return (
                  <div
                    key={v.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-border bg-card/60 hover:bg-card transition-all gap-4 shadow-sm"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-base text-foreground">{displayName}</span>
                        <span className="text-xs text-muted-foreground">({v.admission_number})</span>
                        <Badge variant="outline" className="text-xs border-primary/20">
                          {v.class_name}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span className="font-mono font-medium text-primary">{v.voucher_number}</span>
                        <span>•</span>
                        <span>{v.fee_head}</span>
                        <span>•</span>
                        <span>
                          {isRtl ? 'آخری تاریخ:' : 'Due:'} {v.due_date}
                        </span>
                        {v.paid_at && (
                          <span className="text-emerald-600 font-medium">
                            • {isRtl ? 'ادائیگی تاریخ:' : 'Paid:'} {v.paid_at}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                      <div className="text-left sm:text-right">
                        <div className="text-lg font-bold text-foreground">PKR {v.amount.toLocaleString()}</div>
                        <Badge
                          className={`text-[10px] font-bold uppercase ${
                            v.status === 'paid'
                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
                              : v.status === 'unpaid'
                              ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20'
                              : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {v.status === 'paid'
                            ? isRtl
                              ? 'ادا شدہ'
                              : 'Paid'
                            : v.status === 'unpaid'
                            ? isRtl
                              ? 'غیر ادا شدہ'
                              : 'Unpaid'
                            : isRtl
                            ? 'میعاد ختم'
                            : 'Overdue'}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {v.status !== 'paid' && (
                          <Button
                            size="sm"
                            onClick={() => markAsPaid(v.id)}
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1 rtl:ml-1 rtl:mr-0" />
                            {isRtl ? 'ادا شدہ کریں' : 'Mark Paid'}
                          </Button>
                        )}
                        {v.status !== 'paid' && (
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => sendReminder(v)}
                            title="Send WhatsApp Reminder"
                            className="h-8 w-8 text-primary border-primary/20 hover:bg-primary/5"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        <Button
                          size="icon"
                          variant="ghost"
                          title="Print / Download Voucher"
                          onClick={() => toast.success('Voucher PDF ready for download', { icon: '📄' })}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Wallet className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p className="font-semibold text-sm">{isRtl ? 'کوئی واؤچر نہیں ملا' : 'No vouchers found'}</p>
                <p className="text-xs mt-1">
                  {isRtl ? 'نیا واؤچر بنانے کے لیے اوپر والے بٹن پر کلک کریں۔' : 'Click "Generate Voucher" to create one.'}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Generate Voucher Modal Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-card w-full max-w-md rounded-2xl shadow-2xl border border-primary/20 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <Wallet className="w-5 h-5 text-accent" />
                {isRtl ? 'نیا فیس واؤچر جاری کریں' : 'Generate New Fee Voucher'}
              </h3>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="sname" className="text-xs font-semibold">
                  {isRtl ? 'طالب علم کا نام' : 'Student Full Name'}
                </Label>
                <Input
                  id="sname"
                  placeholder="e.g. Muhammad Abdullah"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required
                  className="h-10"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="adm" className="text-xs font-semibold">
                  {isRtl ? 'داخلہ نمبر' : 'Admission #'}
                </Label>
                <Input
                  id="adm"
                  placeholder="e.g. JAM-106"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="fhead" className="text-xs font-semibold">
                    {isRtl ? 'فیس کی قسم' : 'Fee Head'}
                  </Label>
                  <select
                    id="fhead"
                    value={feeHead}
                    onChange={(e) => setFeeHead(e.target.value)}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                  >
                    <option value="Monthly Tuition">Monthly Tuition</option>
                    <option value="Admission Fee">Admission Fee</option>
                    <option value="Hostel & Food">Hostel & Boarding</option>
                    <option value="Exam Fee">Exam Fee</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="amt" className="text-xs font-semibold">
                    {isRtl ? 'رقم (روپے)' : 'Amount (PKR)'}
                  </Label>
                  <Input
                    id="amt"
                    type="number"
                    placeholder="4500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="due" className="text-xs font-semibold">
                  {isRtl ? 'آخری تاریخ ادائیگی' : 'Due Date'}
                </Label>
                <Input
                  id="due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-10"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  {isRtl ? 'منسوخ کریں' : 'Cancel'}
                </Button>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  {isRtl ? 'واؤچر تیار کریں' : 'Create Voucher'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
