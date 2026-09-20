import { createClient } from '@/lib/supabase/server'
import { getDictionary } from '@/lib/dictionaries'
import { AttendanceAnalytics } from './AttendanceAnalytics'

export default async function AdminAttendancePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const supabase = await createClient()

  const { data: attendance } = (await supabase
    .from('attendance')
    .select(`
      *,
      students ( name_en, name_ur, admission_number ),
      classes ( name_en, name_ur )
    `)
    .order('date', { ascending: false })
    .limit(30)) as any

  return <AttendanceAnalytics initialRecords={attendance || []} lang={lang} />
}
