import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import FeesManagementClient from './FeesManagementClient'

export default async function FeesManagementPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const isRtl = lang === 'ur'
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${lang}/login`)
  }

  const { data: profile } = (await supabase.from('profiles').select('role').eq('id', user.id).single()) as any

  if (!profile || !['super_admin', 'admin', 'nazim', 'accountant'].includes(profile.role)) {
    redirect(`/${lang}/unauthorized`)
  }

  // Fetch fee structures
  const { data: feeStructures } = (await supabase
    .from('fee_structures')
    .select('*, class:classes(name_en), level:levels(name_en)')
    .order('created_at', { ascending: false })) as any

  // Fetch classes for dropdown
  const { data: classes } = (await supabase.from('classes').select('id, name_en, name_ur').order('name_en')) as any

  // Fetch levels for dropdown
  const { data: levels } = (await supabase
    .from('levels')
    .select('id, name_en, name_ur')
    .order('order_index')) as any

  return (
    <FeesManagementClient
      initialFeeStructures={feeStructures || []}
      classes={classes || []}
      levels={levels || []}
      isRtl={isRtl}
    />
  )
}
