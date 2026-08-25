import { StudentIDCard, StudentCardData } from '@/components/id-card/StudentIDCard'
import { createClient } from '@/lib/supabase/server'
import { CreditCard } from 'lucide-react'

export default async function StudentPersonalIDCardPage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const isRtl = lang === 'ur'
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: student } = await (supabase
    .from('students')
    .select('*, classes ( name_en, name_ur )')
    .eq('profile_id', user?.id || '')
    .maybeSingle()) as any

  const cardData: StudentCardData = {
    id: user?.id || 'e0123456-789a-bcde-f012-3456789abcde',
    name: (isRtl && student?.name_ur) ? student.name_ur : (student?.name_en || 'Muhammad Abdullah'),
    rollNo: student?.admission_number || 'JAM-101',
    jamaat: (isRtl && student?.classes?.name_ur) ? student.classes.name_ur : (student?.classes?.name_en || 'Ibtidai Awwal'),
    fatherName: student?.father_name_en || 'Tariq Mehmood',
    phone: student?.guardian_phone || '+92 300 1122334',
    academicYear: '2025-2026',
    institutionName: isRtl ? 'جامعہ دار العلوم' : 'JAMIA DARUL ULOOM',
  }

  return (
    <div className="space-y-6 max-w-xl mx-auto text-center">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-primary flex items-center justify-center gap-2">
          <CreditCard className="w-6 h-6 text-accent" />
          {isRtl ? 'میرا ڈیجیٹل طالب علم کارڈ' : 'Digital Student Identity Card'}
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          {isRtl
            ? 'حاضری درج کروانے کے لیے کارڈ الٹ کر کیو آر کوڈ استاد کو دکھائیں۔'
            : 'Click card to flip and reveal your scannable attendance QR code.'}
        </p>
      </div>

      <div className="flex justify-center pt-2">
        <StudentIDCard data={cardData} showControls={true} />
      </div>
    </div>
  )
}
