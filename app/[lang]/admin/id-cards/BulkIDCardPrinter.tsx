'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StudentIDCard, StudentCardData } from '@/components/id-card/StudentIDCard'
import { TeacherIDCard, TeacherCardData } from '@/components/id-card/TeacherIDCard'
import { CreditCard, Printer, Download, Users, GraduationCap, FileDown } from 'lucide-react'
import { toast } from 'sonner'
import jsPDF from 'jspdf'
import { toPng } from 'html-to-image'

const SAMPLE_STUDENTS: StudentCardData[] = [
  {
    id: 'e0123456-789a-bcde-f012-3456789abcde',
    name: 'Muhammad Abdullah',
    rollNo: 'JAM-101',
    jamaat: 'Ibtidai Awwal',
    fatherName: 'Tariq Mehmood',
    phone: '+92 300 1122334',
    academicYear: '2025-2026',
  },
  {
    id: 'f1234567-89ab-cdef-0123-456789abcdef',
    name: 'Ahmad Hassan',
    rollNo: 'JAM-102',
    jamaat: 'Ibtidai Awwal',
    fatherName: 'Hassan Raza',
    phone: '+92 301 2233445',
    academicYear: '2025-2026',
  },
  {
    id: 'a2345678-9abc-def0-1234-56789abcdef0',
    name: 'Usman Ali',
    rollNo: 'JAM-103',
    jamaat: 'Ibtidai Awwal',
    fatherName: 'Ali Asghar',
    phone: '+92 302 3344556',
    academicYear: '2025-2026',
  },
  {
    id: 'b3456789-abcd-ef01-2345-6789abcdef01',
    name: 'Zubair Tariq',
    rollNo: 'JAM-104',
    jamaat: 'Ibtidai Awwal',
    fatherName: 'Muhammad Tariq',
    phone: '+92 303 4455667',
    academicYear: '2025-2026',
  },
]

const SAMPLE_TEACHERS: TeacherCardData[] = [
  {
    id: 't1111111-2222-3333-4444-555555555555',
    name: 'Mawlana Tariq Jameel',
    employeeId: 'EMP-01',
    designation: 'Ustad-e-Hadith & Sarf',
    department: 'Darse Nizami Section',
    phone: '+92 300 7788990',
    academicYear: '2025-2026',
  },
  {
    id: 't2222222-3333-4444-5555-666666666666',
    name: 'Mufti Muhammad Salman',
    employeeId: 'EMP-02',
    designation: 'Ustad-e-Fiqh (Qudoori)',
    department: 'Dar-ul-Ifta & Fiqh',
    phone: '+92 301 8899001',
    academicYear: '2025-2026',
  },
]

export function BulkIDCardPrinter({ lang }: { lang: string }) {
  const isRtl = lang === 'ur'
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students')
  const [selectedClass, setSelectedClass] = useState('Ibtidai Awwal')
  const [isBulkExporting, setIsBulkExporting] = useState(false)

  const handleBulkPdfExport = async () => {
    setIsBulkExporting(true)
    toast.info('Rendering and compiling bulk multi-page CR-80 PDF...', { icon: '⚙️' })

    try {
      // Create multi-page PDF loop
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [54, 85.6],
      })

      // Query all cards in the DOM
      const cardElements = document.querySelectorAll('.perspective-1000')
      let pageIndex = 0

      for (let i = 0; i < cardElements.length; i++) {
        const cardElem = cardElements[i] as HTMLElement
        const front = cardElem.querySelector('.backface-hidden:first-child') as HTMLElement
        const back = cardElem.querySelector('.backface-hidden:last-child') as HTMLElement

        if (front && back) {
          const frontImg = await toPng(front, { cacheBust: true, pixelRatio: 2.5 })
          const backImg = await toPng(back, { cacheBust: true, pixelRatio: 2.5 })

          if (pageIndex > 0) pdf.addPage([54, 85.6])
          pdf.addImage(frontImg, 'PNG', 0, 0, 54, 85.6)
          pageIndex++

          pdf.addPage([54, 85.6])
          pdf.addImage(backImg, 'PNG', 0, 0, 54, 85.6)
          pageIndex++
        }
      }

      pdf.save(`bulk-id-cards-${selectedClass.replace(/\s+/g, '-').toLowerCase()}.pdf`)
      toast.success('Multi-page CR-80 PDF compiled and ready for print shop!', { icon: '🎉' })
    } catch (err: any) {
      toast.error('Bulk generation error: ' + err.message)
    } finally {
      setIsBulkExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-accent" />
            {isRtl ? 'شناختی کارڈز پرنٹنگ و اجراء' : 'ID Cards & Print Shop Engine'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isRtl
              ? 'طلباء اور اساتذہ کے سرکاری ڈیجیٹل شناختی کارڈز تیار اور یکمشت پرنٹ کریں۔'
              : 'CR-80 Standard (54mm × 85.6mm) ID cards with Level-H scannable QR codes.'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={handleBulkPdfExport}
            disabled={isBulkExporting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 shadow-sm h-10 px-4"
          >
            <FileDown className="w-4 h-4 text-accent" />
            {isBulkExporting ? 'Generating Multi-Page...' : 'Bulk Class PDF (All Cards)'}
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Class Selector */}
      <Card className="border-primary/15 shadow-sm">
        <CardContent className="pt-4 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('students')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'students'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-accent" />
              Student Cards (Gold Accent)
            </button>
            <button
              onClick={() => setActiveTab('teachers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'teachers'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-slate-300" />
              Faculty Cards (Silver/Chrome)
            </button>
          </div>

          {activeTab === 'students' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-muted-foreground">Select Jamaat:</span>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="h-9 px-3 rounded-lg border border-input bg-background text-xs font-medium"
              >
                <option value="Ibtidai Awwal">Ibtidai Awwal (First Year)</option>
                <option value="Ibtidai Doum">Ibtidai Doum (Second Year)</option>
                <option value="Hifz Class">Hifz Section</option>
              </select>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Grid of Interactive 3D Flip ID Cards */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 justify-items-center pt-2">
        {activeTab === 'students'
          ? SAMPLE_STUDENTS.map((student) => (
              <StudentIDCard key={student.id} data={student} showControls={true} />
            ))
          : SAMPLE_TEACHERS.map((teacher) => (
              <TeacherIDCard key={teacher.id} data={teacher} showControls={true} />
            ))}
      </div>
    </div>
  )
}
