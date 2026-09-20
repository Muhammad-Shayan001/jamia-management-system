import { createClient } from '@/lib/supabase/server'
import { getDictionary } from '@/lib/dictionaries'
import { FeesManager } from './FeesManager'

export default async function AdminFeesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const supabase = await createClient()

  // Pull vouchers from Supabase (if tables are empty or unseeded, FeesManager provides rich interactive demo data)
  const { data: vouchers } = await (supabase
    .from('fee_vouchers')
    .select(`
      *,
      students ( name_en, name_ur, admission_number )
    `)
    .order('created_at', { ascending: false })) as any

  return <FeesManager initialVouchers={vouchers || []} lang={lang} />
}
