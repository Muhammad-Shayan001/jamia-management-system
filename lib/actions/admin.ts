'use server'

import { createClient } from '../supabase/server'
import { createAdminClient } from '../supabase/admin'
import { revalidatePath } from 'next/cache'

const SUPER_ADMIN_EMAIL = (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'nizamiq001@gmail.com').toLowerCase()

async function requireSuperAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email?.toLowerCase() !== SUPER_ADMIN_EMAIL) {
    throw new Error('Unauthorized')
  }
  return { supabase, user }
}

export async function approveUser(profileId: string) {
  const { supabase, user } = await requireSuperAdmin()

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ is_active: true })
    .eq('id', profileId)

  if (error) return { error: error.message }

  // Log action
  await (supabase.from('audit_logs') as any).insert({
    actor_id: user.id,
    actor_email: user.email,
    actor_role: 'super_admin',
    action: 'APPROVE_USER',
    entity_type: 'profile',
    entity_id: profileId,
    details: { approved: true },
  })

  revalidatePath('/en/super-admin/approvals')
  revalidatePath('/ur/super-admin/approvals')
  return { success: true }
}

export async function rejectUser(profileId: string) {
  const { supabase, user } = await requireSuperAdmin()

  // Log before deleting
  await (supabase.from('audit_logs') as any).insert({
    actor_id: user.id,
    actor_email: user.email,
    actor_role: 'super_admin',
    action: 'REJECT_USER',
    entity_type: 'profile',
    entity_id: profileId,
    details: { rejected: true },
  })

  // Delete auth user (cascades to profile via FK)
  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.deleteUser(profileId)
  if (error) {
    // Fallback: just deactivate if delete fails
    await (supabase.from('profiles') as any).update({ is_active: false }).eq('id', profileId)
  }

  revalidatePath('/en/super-admin/approvals')
  revalidatePath('/ur/super-admin/approvals')
  return { success: true }
}

export async function deactivateAdmin(profileId: string) {
  const { supabase, user } = await requireSuperAdmin()

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ is_active: false })
    .eq('id', profileId)

  if (error) return { error: error.message }

  await (supabase.from('audit_logs') as any).insert({
    actor_id: user.id,
    actor_email: user.email,
    actor_role: 'super_admin',
    action: 'DEACTIVATE_ADMIN',
    entity_type: 'profile',
    entity_id: profileId,
    details: {},
  })

  revalidatePath('/en/super-admin/admins')
  revalidatePath('/ur/super-admin/admins')
  return { success: true }
}
