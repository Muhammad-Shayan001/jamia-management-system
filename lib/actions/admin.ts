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

import { sendEmail } from '../communication'

export async function approveUser(profileId: string) {
  const { supabase, user } = await requireSuperAdmin()
  const adminClient = createAdminClient()

  // Get user details for notification
  const { data: profile } = await (supabase.from('profiles').select('full_name_en, role').eq('id', profileId).single() as any)
  const { data: authUserData } = await adminClient.auth.admin.getUserById(profileId)
  const targetEmail = authUserData?.user?.email

  const { error } = await (supabase as any)
    .from('profiles')
    .update({ is_active: true })
    .eq('id', profileId)

  if (error) return { error: error.message }

  // Log action
  try {
    await (supabase.from('audit_logs') as any).insert({
      actor_id: user.id,
      actor_email: user.email,
      actor_role: 'super_admin',
      action: 'APPROVE_USER',
      entity_type: 'profile',
      entity_id: profileId,
      details: { approved: true },
    })
  } catch (_) {}

  // Send approval email via Nodemailer
  if (targetEmail) {
    try {
      const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const name = profile?.full_name_en || 'User'
      await sendEmail({
        to: targetEmail,
        subject: 'Account Approved — Jamia LMS',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
            <h2 style="color: #0f172a; margin-top: 0;">Account Approved!</h2>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
              As-salamu alaykum <strong>${name}</strong>,
            </p>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
              We are pleased to inform you that your <strong>Jamia LMS</strong> account has been approved and activated by the administration.
            </p>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
              You may now log in to the portal using your registered email and password:
            </p>
            <div style="margin: 24px 0; text-align: center;">
              <a href="${origin}/en/login" style="background-color: #1e3a8a; color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 15px;">Log in to Portal</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
              Jamia Management System — Learning Management Portal
            </p>
          </div>
        `
      })
    } catch (e) {
      console.error('Failed to send approval email:', e)
    }
  }

  revalidatePath('/en/super-admin/approvals')
  revalidatePath('/ur/super-admin/approvals')
  return { success: true }
}

export async function rejectUser(profileId: string) {
  const { supabase, user } = await requireSuperAdmin()
  const adminClient = createAdminClient()

  // Get user details for notification before deletion
  const { data: profile } = await (supabase.from('profiles').select('full_name_en').eq('id', profileId).single() as any)
  const { data: authUserData } = await adminClient.auth.admin.getUserById(profileId)
  const targetEmail = authUserData?.user?.email
  const name = profile?.full_name_en || 'Applicant'

  // Log before deleting
  try {
    await (supabase.from('audit_logs') as any).insert({
      actor_id: user.id,
      actor_email: user.email,
      actor_role: 'super_admin',
      action: 'REJECT_USER',
      entity_type: 'profile',
      entity_id: profileId,
      details: { rejected: true },
    })
  } catch (_) {}

  // Delete auth user (cascades to profile via FK)
  const { error } = await adminClient.auth.admin.deleteUser(profileId)
  if (error) {
    // Fallback: just deactivate if delete fails
    await (supabase.from('profiles') as any).update({ is_active: false }).eq('id', profileId)
  }

  // Send polite rejection email via Nodemailer
  if (targetEmail) {
    try {
      await sendEmail({
        to: targetEmail,
        subject: 'Registration Status Update — Jamia LMS',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
            <h2 style="color: #0f172a; margin-top: 0;">Registration Update</h2>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
              As-salamu alaykum <strong>${name}</strong>,
            </p>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
              Thank you for your interest in <strong>Jamia LMS</strong>. We regret to inform you that your registration could not be approved at this time.
            </p>
            <p style="color: #334155; font-size: 15px; line-height: 1.6;">
              If you believe this is a mistake or need further assistance, please reach out to the Jamia administration office directly.
            </p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
            <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
              Jamia Management System — Learning Management Portal
            </p>
          </div>
        `
      })
    } catch (e) {
      console.error('Failed to send rejection email:', e)
    }
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
