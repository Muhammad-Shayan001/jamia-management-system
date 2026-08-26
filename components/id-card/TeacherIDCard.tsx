'use client'

import React, { useRef, useState } from 'react'
import QRCode from 'react-qr-code'
import { toPng } from 'html-to-image'
import jsPDF from 'jspdf'
import { Download, FileDown, RefreshCw, UserCheck, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export interface TeacherCardData {
  id: string
  name: string
  employeeId: string
  designation: string
  department: string
  phone: string
  image?: string
  institutionName?: string
  institutionLogo?: string
  academicYear?: string
}

export function TeacherIDCard({
  data,
  showControls = true,
}: {
  data: TeacherCardData
  showControls?: boolean
}) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const frontRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLDivElement>(null)

  const instName = data.institutionName || 'JAMIA DARUL ULOOM'
  const year = data.academicYear || '2025-2026'

  const downloadAsImage = async () => {
    try {
      setIsExporting(true)
      const targetRef = isFlipped ? backRef.current : frontRef.current
      if (!targetRef) return

      const dataUrl = await toPng(targetRef, { cacheBust: true, pixelRatio: 3 })
      const link = document.createElement('a')
      link.download = `teacher-id-${data.employeeId}-${isFlipped ? 'back' : 'front'}.png`
      link.href = dataUrl
      link.click()
      toast.success('Staff Card PNG exported at 300 DPI!')
    } catch (err: any) {
      toast.error('Failed to export card image: ' + err.message)
    } finally {
      setIsExporting(false)
    }
  }

  const downloadAsPDF = async () => {
    try {
      setIsExporting(true)
      if (!frontRef.current || !backRef.current) return

      const frontUrl = await toPng(frontRef.current, { cacheBust: true, pixelRatio: 3 })
      const backUrl = await toPng(backRef.current, { cacheBust: true, pixelRatio: 3 })

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [54, 85.6],
      })

      pdf.addImage(frontUrl, 'PNG', 0, 0, 54, 85.6)
      pdf.addPage([54, 85.6])
      pdf.addImage(backUrl, 'PNG', 0, 0, 54, 85.6)

      pdf.save(`teacher-id-${data.employeeId}.pdf`)
      toast.success('Print-ready Staff CR-80 PDF generated!')
    } catch (err: any) {
      toast.error('Failed to export PDF: ' + err.message)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* 3D Flip Container (320px x 508px) */}
      <div className="relative w-[320px] h-[508px] perspective-1000">
        <div
          className={`w-full h-full relative transition-transform duration-700 transform-style-3d cursor-pointer select-none rounded-2xl shadow-2xl ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          onClick={() => setIsFlipped(!isFlipped)}
        >
          {/* ================= FRONT SIDE (Silver/Chrome Accent) ================= */}
          <div
            ref={frontRef}
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden bg-white border-2 border-slate-300 backface-hidden flex flex-col justify-between shadow-lg"
            style={{ width: '320px', height: '508px' }}
          >
            {/* Top 210px Header */}
            <div
              className="relative h-[210px] p-4 flex flex-col items-center justify-start text-white text-center"
              style={{
                background: 'linear-gradient(145deg, #09182C 0%, #152A4A 60%, #09182C 100%)',
              }}
            >
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-slate-200 text-[#09182C] font-serif font-bold text-lg flex items-center justify-center shadow-md">
                  ج
                </div>
                <span className="text-xs font-black tracking-wider uppercase text-white">
                  {instName}
                </span>
              </div>

              {/* Staff Pill (Silver Chrome Accent) */}
              <div className="mt-1 px-3 py-0.5 rounded-full bg-slate-200/20 border border-slate-300 text-[10px] font-bold tracking-widest text-slate-200 uppercase">
                Faculty & Staff Identity Card
              </div>
            </div>

            {/* Circular Profile Photo with Chrome / Silver Ring */}
            <div className="absolute top-[155px] left-1/2 -translate-x-1/2 z-10">
              <div className="w-[116px] h-[116px] rounded-full border-4 border-white bg-[#09182C] shadow-xl flex items-center justify-center overflow-hidden ring-4 ring-slate-300/40">
                {data.image ? (
                  <img src={data.image} alt={data.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-16 h-16 text-slate-300" />
                )}
              </div>
            </div>

            {/* Teacher Info Body */}
            <div className="pt-14 pb-2 px-5 text-center flex-1 flex flex-col justify-center space-y-2">
              <div>
                <h3 className="text-xl font-black text-[#09182C] leading-tight tracking-tight">
                  {data.name}
                </h3>
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-widest mt-0.5">
                  {data.designation}
                </p>
                <div className="w-10 h-0.5 bg-slate-400 mx-auto mt-1 rounded-full" />
              </div>

              <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-left text-xs pt-1 px-2">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Emp ID</span>
                  <span className="font-bold text-[#09182C] font-mono">{data.employeeId}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Department</span>
                  <span className="font-semibold text-gray-800 truncate block">{data.department}</span>
                </div>
                <div className="col-span-2 pt-0.5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Contact</span>
                  <span className="font-mono text-gray-700 text-[11px]">{data.phone}</span>
                </div>
              </div>
            </div>

            {/* Bottom Strip */}
            <div
              className="py-2 px-4 text-center text-white text-[10px] font-semibold"
              style={{ background: 'linear-gradient(90deg, #09182C 0%, #152A4A 100%)' }}
            >
              <div className="flex items-center justify-between text-[9px] text-slate-300">
                <span>Faculty • {year}</span>
                <span>Authorized Teacher Card</span>
              </div>
            </div>
          </div>

          {/* ================= BACK SIDE ================= */}
          <div
            ref={backRef}
            className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden text-white rotate-y-180 backface-hidden flex flex-col justify-between p-5 border-2 border-slate-300 shadow-lg"
            style={{
              width: '320px',
              height: '508px',
              background: 'linear-gradient(155deg, #050E1B 0%, #09182C 50%, #152A4A 100%)',
            }}
          >
            {/* Top Logo */}
            <div className="text-center space-y-1">
              <div className="w-8 h-8 rounded-lg bg-slate-200 text-[#09182C] font-serif font-bold text-lg flex items-center justify-center mx-auto shadow-md">
                ج
              </div>
              <h4 className="text-xs font-black tracking-widest uppercase text-white">
                {instName}
              </h4>
              <p className="text-[9px] text-slate-300 uppercase tracking-widest">
                Staff Gate Kiosk Scanner
              </p>
            </div>

            {/* QR Card in White Box */}
            <div className="bg-white p-4 rounded-xl shadow-2xl mx-auto flex flex-col items-center">
              <QRCode
                value={data.id}
                size={148}
                level="H"
                fgColor="#09182C"
                bgColor="#FFFFFF"
              />
              <p className="text-[#09182C] font-mono text-[10px] font-bold mt-2">
                UID: {data.id.slice(0, 16)}...
              </p>
            </div>

            {/* Instruction Footer */}
            <div className="text-center space-y-1 text-[10px] text-gray-300">
              <p className="text-slate-200 font-semibold text-[11px]">{data.name}</p>
              <p className="text-[9px] opacity-75">
                Scan at staff gate kiosk camera for automated teacher check-in.
              </p>
              <div className="pt-2 border-t border-white/10 text-[9px] text-gray-400">
                Official Staff Credential • {instName}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsFlipped(!isFlipped)}
            className="text-xs gap-1.5 border-primary/20 h-9"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Flip Card
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={isExporting}
            onClick={downloadAsImage}
            className="text-xs gap-1.5 border-primary/20 h-9"
          >
            <Download className="w-3.5 h-3.5" />
            Export PNG
          </Button>

          <Button
            size="sm"
            disabled={isExporting}
            onClick={downloadAsPDF}
            className="text-xs gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-9"
          >
            <FileDown className="w-3.5 h-3.5 text-accent" />
            CR-80 PDF
          </Button>
        </div>
      )}
    </div>
  )
}
