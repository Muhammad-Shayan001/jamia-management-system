'use server'

import { createClient } from '../supabase/server'
import { createAdminClient } from '../supabase/admin'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'

const SUPER_ADMIN_EMAIL = (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'nizamiq001@gmail.com').toLowerCase()

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

  const { data: profile } = await (supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', data.user.id)
    .single()) as any

  let role: UserRole = profile?.role || 'student'

  if (email === SUPER_ADMIN_EMAIL) {
    role = 'super_admin'
  }

  if (profile && profile.is_active === false) {
    await supabase.auth.signOut()
    return { error: 'Your account is pending approval by the administration.' }
  }

  const headersList = await headers()
  const referer = headersList.get('referer') || ''
  const locale = referer.includes('/ur/') ? 'ur' : 'en'

  if (redirectTo && redirectTo.startsWith('/')) {
    redirect(redirectTo)
  }

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
  const fullNameEn = (formData.get('fullNameEn') as string || '').trim()
  const fullNameUr = (formData.get('fullNameUr') as string || '').trim()
  const phone = (formData.get('phone') as string || '').trim()
  const fatherNameEn = (formData.get('fatherNameEn') as string || '').trim()

  // Only students and teachers can self-register
  if (!['student', 'teacher'].includes(role)) {
    return { error: 'Only students and teachers can self-register. Admin accounts are created by the Super Admin.' }
  }

  if (!email || !password || !fullNameEn) {
    return { error: 'Email, password, and full name (English) are required.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  const supabase = await createClient()

  // Create auth user (email confirmation disabled — admin approves instead)
  const adminClient = createAdminClient()
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // skip email click — admin approval is the gate
    user_metadata: { role, full_name_en: fullNameEn },
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Failed to create account. Please try again.' }
  }

  const userId = authData.user.id
  const timestamp = Date.now()

  // Create the profile row — is_active: false until admin approves
  const { error: profileError } = await (adminClient.from('profiles') as any).insert({
    id: userId,
    role,
    full_name_en: fullNameEn,
    full_name_ur: fullNameUr || null,
    phone: phone || null,
    is_active: false,
    totp_enabled: false,
  })

  if (profileError) {
    // Rollback auth user
    await adminClient.auth.admin.deleteUser(userId)
    return { error: profileError.message }
  }

  // Create role-specific extension row
  if (role === 'student') {
    const admissionNumber = `PEND-${timestamp}`
    const { error: studentError } = await (adminClient.from('students') as any).insert({
      profile_id: userId,
      admission_number: admissionNumber,
      name_en: fullNameEn,
      name_ur: fullNameUr || fullNameEn,
      father_name_en: fatherNameEn || 'Not Provided',
      guardian_phone: phone || null,
      guardian_email: email,
      is_active: false,
    })
    if (studentError) {
      // Rollback
      await adminClient.auth.admin.deleteUser(userId)
      return { error: studentError.message }
    }
  }

  if (role === 'teacher') {
    const employeeNumber = `PEND-T-${timestamp}`
    const { error: teacherError } = await (adminClient.from('teachers') as any).insert({
      profile_id: userId,
      employee_number: employeeNumber,
      name_en: fullNameEn,
      name_ur: fullNameUr || null,
      is_active: false,
    })
    if (teacherError) {
      // Rollback
      await adminClient.auth.admin.deleteUser(userId)
      return { error: teacherError.message }
    }
  }

  // Log the pending signup for admin visibility
  await (adminClient.from('audit_logs') as any).insert({
    actor_id: userId,
    actor_email: email,
    actor_role: role,
    action: 'SIGNUP_PENDING',
    entity_type: 'profile',
    entity_id: userId,
    details: { full_name_en: fullNameEn, role },
  }).catch(() => {}) // non-critical

  return {
    success: true,
    message: 'Registration submitted! Your account is pending approval by the administrator. You will be notified once approved.',
  }
}

export async function createAdminBySuperAdmin(formData: FormData) {
  const email = (formData.get('email') as string || '').toLowerCase().trim()
  const password = formData.get('password') as string
  const fullNameEn = formData.get('fullNameEn') as string
  const fullNameUr = formData.get('fullNameUr') as string
  const role = (formData.get('role') as string) || 'nazim'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const callerEmail = user.email?.toLowerCase() ?? ''
  if (callerEmail !== SUPER_ADMIN_EMAIL) {
    return { error: 'Only the Super Admin can create administrator / Nazim accounts.' }
  }

  const adminClient = createAdminClient()

  const { data: newAuth, error: createError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role,
      full_name_en: fullNameEn,
      full_name_ur: fullNameUr,
    },
  })

  if (createError) return { error: createError.message }

  if (newAuth.user) {
    await (adminClient.from('profiles') as any).upsert({
      id: newAuth.user.id,
      role: role === 'nazim' ? 'nazim' : 'admin',
      full_name_en: fullNameEn,
      full_name_ur: fullNameUr,
      is_active: true,
      totp_enabled: false,
    })

    await (adminClient.from('audit_logs') as any).insert({
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

export async function resetPassword(prevState: any, formData: FormData) {
  const email = (formData.get('email') as string || '').toLowerCase().trim()
  
  if (!email) {
    return { error: 'Email is required' }
  }

  const supabase = await createClient()

  const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/en/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Password reset email sent! Check your inbox.' }
}

export async function updatePassword(prevState: any, formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Password updated successfully! You can now log in.' }
}
