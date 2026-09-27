import { createClient } from '@/lib/supabase/server'
import { AdmissionsForm } from './AdmissionsForm'

export default async function AdmissionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const supabase = await createClient()

  // Fetch active institutions for the public dropdown
  const { data: institutions } = await supabase
    .from('institutions')
    .select('id, name, urdu_name')
    .eq('status', 'active')

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {lang === 'ur' ? 'داخلہ فارم' : 'Admission Application'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {lang === 'ur' ? 'جامعہ میں داخلے کے لیے درخواست دیں' : 'Apply for admission to a Jamia'}
          </p>
        </div>
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-100">
          <AdmissionsForm institutions={institutions || []} lang={lang} />
        </div>
      </div>
    </div>
  )
}
