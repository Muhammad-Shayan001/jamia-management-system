'use client'

import { useState } from 'react'
import { QRScanner } from '../QRScanner'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QrCode, ShieldCheck, Clock, CheckCircle2, UserCheck, AlertCircle } from 'lucide-react'
import { markAttendance } from '@/lib/actions/attendance'

export function TeacherSelfCheckIn({ lang }: { lang: string }) {
  const isRtl = lang === 'ur'
  const [lastCheckIn, setLastCheckIn] = useState<{
    id: string
    time: string
    status: string
  } | null>(null)
  const [cooldown, setCooldown] = useState(false)

  const handleScan = async (decodedText: string) => {
    if (cooldown) return
    setCooldown(true)

    // Call server action for teacher self-checkin
    const res = await markAttendance({
      userId: decodedText,
      role: 'teacher',
      gate: 'Staff Gate Kiosk',
    })

    const checkInTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })

    if (res?.error) {
      toast.error(res.error, { icon: '⚠️' })
    } else {
      setLastCheckIn({
        id: decodedText.slice(0, 8),
        time: checkInTime,
        status: 'Verified Check-In',
      })
      toast.success(
        isRtl ? `خوش آمدید! استاد حاضری تصدیق ہوگئی: ${checkInTime}` : `Check-In Confirmed! Verified at ${checkInTime}`,
        { icon: '🌟', duration: 4000 }
      )
    }

    // Cooldown 4 seconds to prevent duplicate continuous scans
    setTimeout(() => {
      setCooldown(false)
    }, 4000)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Kiosk Mode Notice Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-primary via-primary/95 to-primary text-primary-foreground shadow-md border border-accent/20 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent text-primary flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">
              {isRtl ? 'اساتذہ سیلف چیک اِن کیوسک' : 'Staff Gate Kiosk — Teacher Self Check-In'}
            </h2>
            <p className="text-xs text-primary-foreground/75 mt-0.5">
              {isRtl ? 'کیمرہ کے سامنے اپنا شناختی کارڈ دکھائیں' : 'Hold your Staff ID card QR code in front of the lens'}
            </p>
          </div>
        </div>

        <Badge className="bg-emerald-500 text-white border-none text-xs shrink-0 uppercase tracking-widest px-3 py-1">
          Camera Only
        </Badge>
      </div>

      {/* Camera Only Card — Strict integrity: no manual input allowed */}
      <Card className="border-primary/20 shadow-xl overflow-hidden">
        <CardHeader className="bg-primary/5 pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-primary flex items-center gap-2">
              <QrCode className="w-4 h-4 text-accent" />
              {isRtl ? 'کیوسک اسکینر' : 'Optical Scanner'}
            </CardTitle>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date().toLocaleDateString(isRtl ? 'ur-PK' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="rounded-xl overflow-hidden border-2 border-primary/20">
            <QRScanner onScan={handleScan} />
          </div>

          {/* Success Banner */}
          {lastCheckIn && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                <div>
                  <p className="font-bold text-sm">Teacher ID: {lastCheckIn.id}...</p>
                  <p className="text-xs opacity-80">{lastCheckIn.status}</p>
                </div>
              </div>
              <Badge className="bg-emerald-600 text-white text-xs font-mono">{lastCheckIn.time}</Badge>
            </div>
          )}

          <div className="p-3 rounded-xl bg-muted/40 text-xs text-muted-foreground flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-accent shrink-0" />
            <span>
              {isRtl
                ? 'حفاظتی ضابطہ: سیلف چیک اِن کے لیے دستی اندراج بند ہے۔ صرف کیمرہ اسکیننگ کی اجازت ہے۔'
                : 'Security Policy: Manual input is strictly disabled on this kiosk to prevent buddy-punching.'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
