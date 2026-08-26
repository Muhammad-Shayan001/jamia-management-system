'use server'

import { createClient } from '../supabase/server'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

const SUPER_ADMIN_EMAIL = (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'admin@jamia.edu').toLowerCase()

export type UserRole = 'super_admin' | 'admin' | 'nazim' | 'teacher' | 'student' | 'parent'

export async function login(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string || '').toLowerCase().trim()
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirectTo') as string) || ''

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  // Fetch the user's role from profiles table
  const { data: profile } = await (supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', data.user.id)
    .single()) as any

  let role: UserRole = profile?.role || 'student'

  // If this is the hardcoded super admin email, enforce role
  if (email === SUPER_ADMIN_EMAIL) {
    role = 'super_admin'
  }

  // Check account activation
  if (profile && profile.is_active === false) {
    await supabase.auth.signOut()
    return { error: 'Your account is pending approval by the administration.' }
  }

  // Determine locale from current URL path (default to 'en')
  const headersList = await headers()
  const referer = headersList.get('referer') || ''
  const locale = referer.includes('/ur/') ? 'ur' : 'en'

  if (redirectTo && redirectTo.startsWith('/')) {
    redirect(redirectTo)
  }

  // Role portal mapping
  if (role === 'super_admin') {
    redirect(`/${locale}/super-admin`)
  } else if (role === 'nazim' || role === 'admin') {
    redirect(`/${locale}/admin/dashboard`)
  } else {
    redirect(`/${locale}/${role}/dashboard`)
  }
}

export async function signup(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string || '').toLowerCase().trim()
  const password = formData.get('password') as string
  const role = formData.get('role') as UserRole
  const fullNameEn = formData.get('fullNameEn') as string
  const fullNameUr = formData.get('fullNameUr') as string

  // Hard block: nobody can register as super_admin unless their email
  // is the exact one baked into env config.
  if (role === 'super_admin' && email !== SUPER_ADMIN_EMAIL) {
    return { error: 'You are not authorized to register as Super Admin.' }
  }

  // Hard block: nazim/admin accounts cannot self-register — must be
  // created by the super admin from inside the app.
  if (role === 'nazim' || role === 'admin') {
    return { error: 'Administrator accounts are created by the Super Admin only.' }
  }

  const isSuperAdmin = email === SUPER_ADMIN_EMAIL && role === 'super_admin'
  const isActive = isSuperAdmin // Super admin skips approval queue entirely

  const supabase = await createClient()

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: isSuperAdmin ? 'super_admin' : role,
        full_name_en: fullNameEn,
        full_name_ur: fullNameUr,
      },
    },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (authData.user) {
    await (supabase.from('profiles') as any).upsert({
      id: authData.user.id,
      role: isSuperAdmin ? 'super_admin' : role,
      full_name_en: fullNameEn || 'User',
      full_name_ur: fullNameUr || 'صارف',
      is_active: isActive,
      totp_enabled: false,
    })
  }

  return {
    success: true,
    message: isSuperAdmin
      ? 'Super Admin initialized successfully. Please log in.'
      : 'Account created! Pending approval by the administrator.',
  }
}

// Super Admin creates Nazim / Admin accounts
export async function createAdminBySuperAdmin(formData: FormData) {
  const email = (formData.get('email') as string || '').toLowerCase().trim()
  const password = formData.get('password') as string
  const fullNameEn = formData.get('fullNameEn') as string
  const fullNameUr = formData.get('fullNameUr') as string
  const role = (formData.get('role') as string) || 'nazim'

  const supabase = await createClient()

  // Verify caller is super admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data: callerProfile } = await (supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()) as any

  const isCallerSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL || callerProfile?.role === 'super_admin'
  if (!isCallerSuperAdmin) {
    return { error: 'Only the Super Admin can create administrator / Nazim accounts.' }
  }

  // Create auth account via Supabase admin client
  const { data: newAuth, error: createError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { role, full_name_en: fullNameEn, full_name_ur: fullNameUr },
    },
  })

  if (createError) return { error: createError.message }

  if (newAuth.user) {
    await (supabase.from('profiles') as any).upsert({
      id: newAuth.user.id,
      role: role === 'nazim' ? 'nazim' : 'admin',
      full_name_en: fullNameEn,
      full_name_ur: fullNameUr,
      is_active: true,
      totp_enabled: false,
    })

    // Log to audit log
    await (supabase.from('audit_logs') as any).insert({
      actor_id: user.id,
      actor_email: user.email,
      actor_role: 'super_admin',
      action: 'CREATE_ADMIN',
      entity_type: 'profile',
      entity_id: newAuth.user.id,
      details: { created_email: email, role },
    })
  }

  return { success: true }
}

export async function logout(locale: string) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(`/${locale}/login`)
}
