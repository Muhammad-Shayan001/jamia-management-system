import { createClient } from '@/lib/supabase/server'
import { getDictionary } from '@/lib/dictionaries'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { QRScannerWrapper } from './QRScannerWrapper'
import { ManualAttendanceList } from './ManualAttendanceList'
import { QrCode, UserCheck } from 'lucide-react'

export default async function TeacherAttendancePage({ params }: { params: Promise<{ lang: string }> }) {
  const supabase = await createClient()
  const { lang } = await params
  const dict = await getDictionary(lang)
  const isRtl = lang === 'ur'

  // Fetch actual students from Supabase (graceful fallback)
  const { data: students } = (await supabase
    .from('students')
    .select('id, name_en, name_ur, admission_number')
    .limit(20)) as any

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
          <UserCheck className="w-6 h-6 text-accent" />
          {dict.nav.attendance}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {isRtl
            ? 'طالب علم کا کارڈ کیو آر کوڈ سے اسکین کریں یا فہرست سے دستی حاضری درج کریں۔'
            : 'Scan student ID cards via QR code or mark attendance manually.'}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* QR Scanner Section */}
        <div className="lg:col-span-5">
          <Card className="border-primary/15 shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-primary">
                <QrCode className="w-4 h-4 text-accent" />
                {isRtl ? 'کیو آر کوڈ اسکینر' : 'QR Code Scanner'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <QRScannerWrapper />
            </CardContent>
          </Card>
        </div>

        {/* Manual Override Section */}
        <div className="lg:col-span-7">
          <Card className="border-primary/15 shadow-sm h-full">
            <CardHeader className="bg-primary/5 pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-primary">
                <UserCheck className="w-4 h-4 text-accent" />
                {isRtl ? 'دستی حاضری رجسٹر' : 'Manual Attendance Roster'}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground mb-3">
                {isRtl
                  ? 'طلباء کی حاضری کی حیثیت منتخب کریں:'
                  : 'Select status for students in the class today:'}
              </p>
              <ManualAttendanceList students={students || []} lang={lang} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
