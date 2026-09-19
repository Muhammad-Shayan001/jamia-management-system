import { createClient } from '../supabase/server'
import { redirect } from 'next/navigation'

export type UserRole = 'super_admin' | 'admin' | 'nazim' | 'teacher' | 'student' | 'parent'

interface Profile {
  role: UserRole
  is_active: boolean
}

export async function requireAuth() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/en/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', user!.id)
    .single() as { data: Profile | null; error: any }

  if (!process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
    throw new Error("CRITICAL STARTUP ERROR: NEXT_PUBLIC_SUPER_ADMIN_EMAIL is not set.")
  }
  const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL.toLowerCase()
  const isSuperAdmin = user!.email?.toLowerCase() === SUPER_ADMIN_EMAIL

  if (profile && !profile.is_active && !isSuperAdmin) {
    redirect('/en/login?error=pending_approval')
  }

  let role: UserRole = (profile?.role as UserRole) || 'student'
  if (isSuperAdmin) role = 'super_admin'

  return { user, profile, role, supabase }
}

export async function requireRole(allowedRoles: UserRole[]) {
  const authContext = await requireAuth()
  if (!allowedRoles.includes(authContext.role)) {
    redirect('/en/login?error=unauthorized')
  }
  return authContext
}
