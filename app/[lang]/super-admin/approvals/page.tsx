import { createAdminClient } from '@/lib/supabase/admin'
import { ApprovalsClient } from './ApprovalsClient'

export default async function SuperAdminApprovalsPage() {
  const supabaseAdmin = createAdminClient()

  // Fetch pending users (is_active = false)
  const { data: rawProfiles } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('is_active', false)
    .order('created_at', { ascending: false })
  
  const profiles = rawProfiles as any[] | null

  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()

  const pendingUsers = (profiles || []).map((profile) => {
    const authUser = users.find(u => u.id === profile.id)
    return {
      id: profile.id,
      full_name_en: profile.full_name_en,
      full_name_ur: profile.full_name_ur,
      email: authUser?.email || 'No email',
      role: profile.role,
      created_at: profile.created_at || new Date().toISOString(),
    }
  })

  return <ApprovalsClient initialUsers={pendingUsers} />
}
