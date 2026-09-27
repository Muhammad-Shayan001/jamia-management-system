import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import InstitutionsClient from './InstitutionsClient'

export default async function InstitutionsPage({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const supabase = await createClient()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) {
    redirect(`/${lang}/login`)
  }

  // Fetch institutions
  const { data: institutions, error } = await supabase
    .from('institutions')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Institutions (Jamias)</h2>
        <p className="text-muted-foreground text-sm">
          Manage all independent Jamias and their multi-tenant spaces.
        </p>
      </div>

      <InstitutionsClient 
        initialData={institutions || []} 
        lang={lang} 
      />
    </div>
  )
}
