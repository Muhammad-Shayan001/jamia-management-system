'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Building, Save, Mail, Phone, Palette, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function SuperAdminInstitutionSettingsPage() {
  const [instNameEn, setInstNameEn] = useState('Jamia Darul Uloom')
  const [instNameUr, setInstNameUr] = useState('جامعہ دار العلوم الاسلامیہ')
  const [academicYear, setAcademicYear] = useState('2025-2026')
  const [addressEn, setAddressEn] = useState('Block 5, Seminary Campus, Main Boulevard')
  const [addressUr, setAddressUr] = useState('مرکزی کیمپس، مین بلیوارڈ')
  const [phone, setPhone] = useState('+92 42 35123456')
  const [email, setEmail] = useState('info@jamia.edu.pk')
  const [cutoffTime, setCutoffTime] = useState('09:00')
  const [primaryColor, setPrimaryColor] = useState('#0B1D36')
  const [accentColor, setAccentColor] = useState('#C7A23C')
  const [whatsappSender, setWhatsappSender] = useState('+92 300 1234567')

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    toast.success('Institution configuration & branding saved successfully!', { icon: '💾' })
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
          <Settings className="w-6 h-6 text-accent" />
          Institution & Seminary Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Configure single-institution branding, academic year parameters, and communication channels.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Info */}
        <Card className="border-primary/15 shadow-sm">
          <CardHeader className="bg-primary/5 pb-3">
            <CardTitle className="text-base text-primary flex items-center gap-2">
              <Building className="w-4 h-4 text-accent" />
              General Institution Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Seminary Name (English)</Label>
              <Input
                value={instNameEn}
                onChange={(e) => setInstNameEn(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Seminary Name (Urdu)</Label>
              <Input
                value={instNameUr}
                onChange={(e) => setInstNameUr(e.target.value)}
                required
                className="h-10 text-right"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Active Academic Session</Label>
              <Input
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                required
                className="h-10"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Official Contact Phone</Label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-10"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold">Campus Physical Address</Label>
              <Input
                value={addressEn}
                onChange={(e) => setAddressEn(e.target.value)}
                className="h-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Attendance Cutoff & Gate Controls */}
        <Card className="border-primary/15 shadow-sm">
          <CardHeader className="bg-primary/5 pb-3">
            <CardTitle className="text-base text-primary flex items-center gap-2">
              <Clock className="w-4 h-4 text-accent" />
              Attendance Gate & Auto-Absent Cutoff
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Daily Attendance Cutoff Time (24h)</Label>
              <Input
                type="time"
                value={cutoffTime}
                onChange={(e) => setCutoffTime(e.target.value)}
                required
                className="h-10"
              />
              <p className="text-[11px] text-muted-foreground">
                Any student or teacher with no scan by this time will be auto-marked absent (excluding holidays).
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Official WhatsApp Sender Number</Label>
              <Input
                value={whatsappSender}
                onChange={(e) => setWhatsappSender(e.target.value)}
                placeholder="+92 300 0000000"
                className="h-10"
              />
              <p className="text-[11px] text-muted-foreground">
                Automated absence alerts and fee receipts will be broadcast from this verified number.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Branding Palette */}
        <Card className="border-primary/15 shadow-sm">
          <CardHeader className="bg-primary/5 pb-3">
            <CardTitle className="text-base text-primary flex items-center gap-2">
              <Palette className="w-4 h-4 text-accent" />
              Institutional ID Card & Portal Colors
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Primary Theme Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-input"
                />
                <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Accent & Insignia Gold Color</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setAccentColor(e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-input"
                />
                <Input value={accentColor} onChange={(e) => setAccentColor(e.target.value)} className="h-10" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 px-6 h-11">
            <Save className="w-4 h-4 text-accent" />
            Save Institution Settings
          </Button>
        </div>
      </form>
    </div>
  )
}
