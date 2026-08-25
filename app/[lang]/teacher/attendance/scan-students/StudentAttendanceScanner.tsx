'use client'

import { useState } from 'react'
import { QRScanner } from '../QRScanner'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { QrCode, CheckCircle2, Users, Keyboard, ArrowRight } from 'lucide-react'
import { markAttendance } from '@/lib/actions/attendance'

interface ScannedRecord {
  userId: string
  name: string
  rollNo: string
  time: string
}

export function StudentAttendanceScanner({ lang }: { lang: string }) {
  const isRtl = lang === 'ur'
  const [lastScanned, setLastScanned] = useState<string | null>(null)
  const [scannedList, setScannedList] = useState<ScannedRecord[]>([
    { userId: 'u-1', name: 'Muhammad Abdullah', rollNo: 'JAM-101', time: '07:45 AM' },
    { userId: 'u-2', name: 'Ahmad Hassan', rollNo: 'JAM-102', time: '07:50 AM' },
  ])
  const [manualInput, setManualInput] = useState('')
  const [totalStudents] = useState(38)

  const processScan = async (scannedText: string) => {
    if (scannedText === lastScanned) return
    setLastScanned(scannedText)

    // Call server action
    const res = await markAttendance({
      userId: scannedText,
      role: 'student',
      gate: 'Classroom Door',
    })

    const shortId = scannedText.slice(0, 8)
    const newRecord: ScannedRecord = {
      userId: scannedText,
      name: `Student (${shortId})`,
      rollNo: `ROLL-${shortId}`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }

    setScannedList((prev) => [newRecord, ...prev])
    toast.success(
      isRtl ? `حاضری درج ہوگئی: ${shortId}` : `Attendance recorded for ${shortId}!`,
      { icon: '✅' }
    )

    setTimeout(() => setLastScanned(null), 2500)
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!manualInput.trim()) return
    await processScan(manualInput.trim())
    setManualInput('')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <QrCode className="w-6 h-6 text-accent" />
            {isRtl ? 'طلباء کارڈ اسکینر (استاد آپریٹر)' : 'Student Classroom Entry Scanner'}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isRtl
              ? 'طلباء کے شناختی کارڈ کے کیو آر کوڈز اسکین کریں جب وہ کمرہ جماعت میں داخل ہوں۔'
              : 'Scan each student ID card QR code as they enter the lecture hall.'}
          </p>
        </div>

        {/* Live Running Count Badge */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20 shrink-0">
          <Users className="w-5 h-5 text-primary" />
          <div>
            <div className="text-xs text-muted-foreground">{isRtl ? 'کلاس حاضری' : 'Class Present'}</div>
            <div className="text-lg font-bold text-primary">
              {scannedList.length} / {totalStudents}{' '}
              <span className="text-xs font-medium text-muted-foreground">
                ({Math.round((scannedList.length / totalStudents) * 100)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Camera Scanner */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="border-primary/15 shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle className="text-base text-primary flex items-center gap-2">
                <QrCode className="w-4 h-4 text-accent" />
                Live ID Card Camera Feed
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <QRScanner onScan={processScan} />
            </CardContent>
          </Card>

          {/* Manual Input Fallback */}
          <Card className="border-primary/10 shadow-sm bg-card/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Keyboard className="w-3.5 h-3.5" />
                Manual Fallback (Lost or Damaged Card)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleManualSubmit} className="flex gap-2">
                <Input
                  placeholder="Enter Student UUID or Roll #"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  className="h-10 text-xs"
                />
                <Button type="submit" size="sm" className="bg-primary text-primary-foreground shrink-0 h-10 px-4">
                  Mark
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Live Running Roster List */}
        <div className="lg:col-span-5">
          <Card className="border-primary/15 shadow-sm h-full flex flex-col">
            <CardHeader className="bg-primary/5 pb-3 shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base text-primary flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Live Attendance Queue ({scannedList.length})
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex-1 overflow-y-auto space-y-2.5 max-h-[500px]">
              {scannedList.map((rec, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-card shadow-xs animate-in fade-in"
                >
                  <div>
                    <p className="font-bold text-sm text-foreground">{rec.name}</p>
                    <p className="text-xs text-muted-foreground">{rec.rollNo}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20 text-xs">
                      {rec.time}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
