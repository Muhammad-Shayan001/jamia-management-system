import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminAdmissionsClient from './AdminAdmissionsClient'

export default async function AdminAdmissionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const supabase = await createClient()

  const { data: user } = await supabase.auth.getUser()
  if (!user.user) redirect(`/${lang}/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('institution_id')
    .eq('id', user.user.id)
    .single()

  if (!profile?.institution_id) {
    return <div className="p-8 text-center text-red-500">No institution assigned.</div>
  }

  const { data: admissions } = await supabase
    .from('admissions')
    .select('*')
    .eq('institution_id', profile.institution_id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admission Applications</h2>
        <p className="text-muted-foreground text-sm">Review and process student admission requests.</p>
      </div>

      <AdminAdmissionsClient initialData={admissions || []} lang={lang} />
    </div>
  )
}
