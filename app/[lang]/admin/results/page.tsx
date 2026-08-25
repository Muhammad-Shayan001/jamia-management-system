import { createClient } from '@/lib/supabase/server'
import { getDictionary } from '@/lib/dictionaries'
import { ResultsManager } from './ResultsManager'

export default async function AdminResultsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const supabase = await createClient()

  const { data: exams } = await (supabase
    .from('exams')
    .select(`
      *,
      classes ( name_en, name_ur )
    `)
    .order('created_at', { ascending: false })) as any

  return <ResultsManager initialExams={exams || []} lang={lang} />
}
