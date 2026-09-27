import { createAdminClient } from '@/lib/supabase/admin'
import { AdminsClient } from './AdminsClient'

export default async function SuperAdminAdminsPage() {
  const supabaseAdmin = createAdminClient()

  // Fetch real admin accounts from database using the service role to bypass RLS
  // (RLS might not allow reading other profiles depending on policies)
  const { data: rawProfiles } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name_en, full_name_ur, role, is_active, created_at, institution_id')
    .in('role', ['admin', 'nazim'])
    .order('created_at', { ascending: false })
  
  const profiles = rawProfiles as any[] | null

  // Need to get emails from auth.users (requires service role)
  const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()

  const { data: institutions } = await supabaseAdmin
    .from('institutions')
    .select('id, name')
    .order('name')

  const admins = (profiles || []).map((profile) => {
    const authUser = users.find(u => u.id === profile.id)
    return {
      id: profile.id,
      full_name_en: profile.full_name_en,
      full_name_ur: profile.full_name_ur,
      email: authUser?.email || 'No email',
      role: profile.role,
      is_active: profile.is_active || false,
      created_at: profile.created_at || new Date().toISOString(),
      institution_id: profile.institution_id || null,
    }
  })

  return <AdminsClient initialAdmins={admins} institutions={institutions || []} />
}
