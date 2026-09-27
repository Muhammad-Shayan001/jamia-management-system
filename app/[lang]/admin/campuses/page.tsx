import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import CampusesClient from './CampusesClient'
import { Building2 } from 'lucide-react'

export default async function CampusesPage({
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

  // Get institution_id for this admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('institution_id, role')
    .eq('id', user.user.id)
    .single()

  if (!profile?.institution_id) {
    return (
      <div className="p-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
        <Building2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-foreground">No Institution Assigned</h2>
        <p className="mt-2">You are not assigned to any Jamia. Please contact the Super Admin.</p>
      </div>
    )
  }

  // Fetch campuses for their institution
  const { data: campuses } = await supabase
    .from('campuses')
    .select('*')
    .eq('institution_id', profile.institution_id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manage Campuses</h2>
        <p className="text-muted-foreground text-sm">
          Create and manage branches/campuses for your Jamia.
        </p>
      </div>

      <CampusesClient 
        initialData={campuses || []} 
        institutionId={profile.institution_id}
        lang={lang} 
      />
    </div>
  )
}
