'use server'

import { headers } from 'next/headers'
import { createClient } from '../supabase/server'
import { createAdminClient } from '../supabase/admin'
import { redirect } from 'next/navigation'
import { validatePassword } from '../validation/password'
import { sendEmail } from '../communication'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

if (!process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL) {
  throw new Error("CRITICAL STARTUP ERROR: NEXT_PUBLIC_SUPER_ADMIN_EMAIL is not set in environment variables.")
}
const SUPER_ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL.toLowerCase()

export type UserRole = 'super_admin' | 'admin' | 'nazim' | 'teacher' | 'student' | 'parent' | 'accountant' | 'receptionist'

// Upstash Redis setup
let redis: Redis | null = null;
let defaultLimiter: Ratelimit | null = null;
let strictLimiter: Ratelimit | null = null;

try {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = Redis.fromEnv()
    // Create ratelimiters
    // For standard actions: 10 requests per 15 minutes
    defaultLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(10, '15 m'),
      analytics: true,
    })

    // For strict actions (reset password, signup): 3 requests per 15 minutes
    strictLimiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '15 m'),
      analytics: true,
    })
  }
} catch (e) {
  console.warn("Redis initialization failed, falling back to no rate limiting.", e)
}

const LOCKOUT_THRESHOLD = 5
const LOCKOUT_DURATION_S = 15 * 60 // 15 minutes in seconds

export async function getAppOrigin(): Promise<string> {
  // Always prefer the explicit env variable pointing to the production URL
  const envUrl = process.env.NEXT_PUBLIC_APP_URL
  if (envUrl && !envUrl.includes('localhost')) {
    return envUrl.replace(/\/$/, '') // strip trailing slash
  }

  // On Vercel, x-forwarded-host is reliably set
  try {
    const headersList = await headers()
    const host = headersList.get('x-forwarded-host') || headersList.get('host')
    const proto = headersList.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https')
    if (host && !host.includes('localhost')) {
      return `${proto}://${host}`
    }
  } catch (_) {}

  // Hard-coded deployed URL as last-resort fallback (NEVER localhost)
  return 'https://jamia-management-system-utb9.vercel.app'
}

async function checkRateLimit(actionName: string, strict: boolean = false) {
  try {
    const headersList = await headers()
    const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'anonymous'
    const key = `ratelimit:${actionName}:${ip}`
    
    const limiter = strict ? strictLimiter : defaultLimiter
    if (!limiter) return true; // fail open if no redis

    const { success } = await limiter.limit(key)
    return success
  } catch (error) {
    console.error('Rate limit error (falling back to allow):', error)
    return true // fail open if Redis is down
  }
}

export async function login(prevState: any, formData: FormData) {
  // Rate limit: 10 attempts per 15 minutes per IP
  if (!(await checkRateLimit('login', false))) {
    return { error: 'Too many login attempts from this network. Please try again in 15 minutes.' }
  }

  const email = (formData.get('email') as string || '').toLowerCase().trim()
  const password = formData.get('password') as string
  const redirectTo = (formData.get('redirectTo') as string) || ''

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  // Check account lockout via Upstash Redis
  const lockoutKey = `lockout:${email}`
  let failedAttempts = 0
  
  if (redis) {
    try {
      const isLocked = await redis.get(lockoutKey)
      if (isLocked === 'locked') {
        return { error: 'Account is temporarily locked due to repeated failed attempts. Try again in 15 minutes.' }
      }
      failedAttempts = (await redis.get(`fails:${email}`)) as number || 0
    } catch (_) {}
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    failedAttempts++
    if (redis) {
      try {
        if (failedAttempts >= LOCKOUT_THRESHOLD) {
          await redis.set(lockoutKey, 'locked', { ex: LOCKOUT_DURATION_S })
          await redis.del(`fails:${email}`) // reset fails once locked
          
          // Log to audit logs using admin client
          try {
            const adminClient = createAdminClient()
            await (adminClient.from('audit_logs') as any).insert({
              actor_email: email,
              action: 'ACCOUNT_LOCKOUT',
              details: { reason: 'Exceeded maximum failed login attempts', ip: 'hidden' }
            })
          } catch (_) {}
          
          return { error: 'Account locked due to too many failed attempts. Try again in 15 minutes.' }
        } else {
          await redis.set(`fails:${email}`, failedAttempts, { ex: LOCKOUT_DURATION_S })
        }
      } catch (_) {}
    }
    return { error: error.message }
  }

  // Success: clear lockout
  if (redis) {
    try {
      await redis.del(`fails:${email}`)
      await redis.del(lockoutKey)
    } catch (_) {}
  }

  const { data: profile } = await (supabase
    .from('profiles')
    .select('role, is_active')
    .eq('id', data.user.id)
    .single()) as any

  console.log('--- DEBUG login() ---')
  console.log('Raw profile object:', profile)

  let role: UserRole = profile?.role || 'student'
  console.log('Resolved role:', role)

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
  if (!(await checkRateLimit('signup', true))) {
    return { error: 'Too many signup attempts. Please try again later.' }
  }

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

  const passCheck = validatePassword(password, role)
  if (!passCheck.valid) {
    return { error: passCheck.error }
  }

  const adminClient = createAdminClient()
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
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

  // Create profile row — is_active: false until admin approves
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
    await adminClient.auth.admin.deleteUser(userId)
    return { error: profileError.message }
  }

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
      await adminClient.auth.admin.deleteUser(userId)
      return { error: teacherError.message }
    }
  }

  try {
    await (adminClient.from('audit_logs') as any).insert({
      actor_id: userId,
      actor_email: email,
      actor_role: role,
      action: 'SIGNUP_PENDING',
      entity_type: 'profile',
      entity_id: userId,
      details: { full_name_en: fullNameEn, role },
    })
  } catch (_) {}

  // Send acknowledgement email to applicant via Google App Password / Nodemailer
  try {
    await sendEmail({
      to: email,
      subject: 'Registration Received — Jamia LMS',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">Registration Received</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            As-salamu alaykum <strong>${fullNameEn}</strong>,
          </p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Your registration request for <strong>Jamia LMS</strong> as a <strong>${role}</strong> has been received successfully.
          </p>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            Your account is currently pending verification and approval by the administration. You will receive an email confirmation as soon as your account is activated.
          </p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
          <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
            Jamia Management System — Learning Management Portal
          </p>
        </div>
      `
    })
  } catch (e) {
    console.error('Failed to send signup acknowledgement email:', e)
  }

  // Notify Super Admin of pending registration
  try {
    const origin = await getAppOrigin()
    await sendEmail({
      to: SUPER_ADMIN_EMAIL,
      subject: `New ${role.toUpperCase()} Registration Pending Approval — ${fullNameEn}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
          <h2 style="color: #0f172a; margin-top: 0;">New Account Awaiting Approval</h2>
          <p style="color: #334155; font-size: 15px; line-height: 1.6;">
            A new user has registered on Jamia LMS and requires your review:
          </p>
          <ul style="color: #334155; font-size: 15px; line-height: 1.8;">
            <li><strong>Full Name:</strong> ${fullNameEn}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Role:</strong> ${role}</li>
          </ul>
          <div style="margin: 24px 0;">
            <a href="${origin}/en/super-admin/approvals" style="background-color: #1e3a8a; color: #ffffff; padding: 10px 22px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Open Approvals Portal</a>
          </div>
        </div>
      `
    })
  } catch (e) {
    console.error('Failed to notify admin of new signup:', e)
  }

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

  const passCheck = validatePassword(password, role)
  if (!passCheck.valid) {
    return { error: passCheck.error }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  // Check creator's role
  let creatorRole = 'user'
  if (user.email?.toLowerCase() === SUPER_ADMIN_EMAIL) {
    creatorRole = 'super_admin'
  } else {
    const { data: creatorProfile } = await (supabase.from('profiles').select('role').eq('id', user.id).single() as any)
    if (creatorProfile) creatorRole = creatorProfile.role
  }

  if (!['super_admin', 'admin', 'nazim'].includes(creatorRole)) {
    return { error: 'Unauthorized: Only administrators can create staff accounts' }
  }

  // Restrict what roles can be created
  if (role === 'admin' && creatorRole !== 'super_admin') {
    return { error: 'Unauthorized: Only Super Admin can create Admin accounts' }
  }
  if (!['admin', 'nazim', 'accountant', 'receptionist'].includes(role)) {
    return { error: 'Invalid role for this action' }
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
      role: role as UserRole,
      full_name_en: fullNameEn,
      full_name_ur: fullNameUr,
      is_active: true,
      totp_enabled: false,
    })

    try {
      await (adminClient.from('audit_logs') as any).insert({
        actor_id: user.id,
        actor_email: user.email,
        actor_role: 'super_admin',
        action: 'CREATE_ADMIN',
        entity_type: 'profile',
        entity_id: newAuth.user.id,
        details: { created_email: email, role },
      })
    } catch (_) {}

    // Send welcome email with login details
    try {
      const origin = await getAppOrigin()
      await sendEmail({
        to: email,
        subject: `Your Jamia LMS Administrative Account (${role.toUpperCase()})`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
            <h2 style="color: #0f172a; margin-top: 0;">Welcome to Jamia LMS Administration</h2>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
              As-salamu alaykum <strong>${fullNameEn}</strong>,
            </p>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
              An administrative account with role <strong>${role}</strong> has been created for you by the Super Admin.
            </p>
            <div style="background: #f8fafc; padding: 16px; border-radius: 6px; border: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="margin: 4px 0;"><strong>Login Email:</strong> ${email}</p>
              <p style="margin: 4px 0;"><strong>Password:</strong> (the password assigned to you)</p>
            </div>
            <div style="margin: 24px 0;">
              <a href="${origin}/en/login" style="background-color: #1e3a8a; color: #ffffff; padding: 10px 22px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Log in to Portal</a>
            </div>
          </div>
        `
      })
    } catch (e) {
      console.error('Failed to send welcome email to new admin:', e)
    }
  }

  return { success: true }
}

export async function logout(locale: string) {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(`/${locale}/login`)
}

export async function resetPassword(prevState: any, formData: FormData) {
  // Stricter limit on password resets (e.g. 3 per 15 min)
  if (!(await checkRateLimit('resetPassword', true))) {
    return { error: 'Too many reset attempts. Please try again later.' }
  }

  const email = (formData.get('email') as string || '').toLowerCase().trim()
  
  if (!email) {
    return { error: 'Email is required' }
  }

  const headersList = await headers()
  const referer = headersList.get('referer') || ''
  const locale = referer.includes('/ur/') ? 'ur' : 'en'

  const origin = await getAppOrigin()
  const adminClient = createAdminClient()

  // Generate recovery link via Supabase Admin API with direct redirectTo
  // We point directly to the update-password page so the #access_token hash fragment isn't lost in a server redirect
  const callbackUrl = `${origin}/${locale}/update-password`
  const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: callbackUrl,
    },
  })

  if (linkError) {
    return { error: linkError.message }
  }

  const actionLink = linkData?.properties?.action_link
  if (!actionLink) {
    return { error: 'Unable to generate password reset link for this email.' }
  }

  // Send password reset email directly via Google App Password / Nodemailer
  const emailRes = await sendEmail({
    to: email,
    subject: 'Password Reset Request — Jamia LMS',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
        <h2 style="color: #0f172a; margin-top: 0;">Password Reset Request</h2>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          You requested to reset your password for your <strong>Jamia LMS</strong> account.
        </p>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">
          Click the button below to choose a new password:
        </p>
        <div style="margin: 28px 0; text-align: center;">
          <a href="${actionLink}" style="background-color: #1e3a8a; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 15px;">Reset Password</a>
        </div>
        <p style="color: #64748b; font-size: 13px; line-height: 1.5;">
          If the button doesn't work, copy and paste this link into your browser:
        </p>
        <p style="color: #64748b; font-size: 12px; word-break: break-all; background: #f8fafc; padding: 10px; border-radius: 4px; border: 1px solid #e2e8f0;">
          ${actionLink}
        </p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
        <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
          If you did not request this password reset, you can safely ignore this email.
        </p>
      </div>
    `
  })

  if (!emailRes.success) {
    console.error('Password reset email error:', emailRes.error)
    return { error: 'Failed to send password reset email via SMTP. Please try again.' }
  }

  return { success: true, message: 'Password reset link has been sent to your email!' }
}

export async function updatePassword(prevState: any, formData: FormData) {
  if (!(await checkRateLimit('updatePassword', true))) {
    return { error: 'Too many attempts. Please try again later.' }
  }

  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Authentication session not found. Please click the reset link in your email again.' }
  }

  let role = 'student'
  if (user.email?.toLowerCase() === SUPER_ADMIN_EMAIL) {
    role = 'super_admin'
  } else {
    const { data: profile } = await (supabase.from('profiles').select('role').eq('id', user.id).single() as any)
    if (profile) role = profile.role
  }

  const passCheck = validatePassword(password, role)
  if (!passCheck.valid) {
    return { error: passCheck.error }
  }

  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Password updated successfully! You can now log in.' }
}
