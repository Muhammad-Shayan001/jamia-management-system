'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/communication'
import { revalidatePath } from 'next/cache'

export async function postAnnouncement(formData: FormData) {
  const supabase = await createClient()
  
  const title_en = formData.get('title_en') as string
  const title_ur = formData.get('title_ur') as string
  const body_en = formData.get('body_en') as string
  const body_ur = formData.get('body_ur') as string
  const targetRole = (formData.get('target_role') as string) || 'all'
  const send_email = formData.get('send_email') === 'on' || formData.get('send_email') === 'true'
  const send_whatsapp = formData.get('send_whatsapp') === 'on' || formData.get('send_whatsapp') === 'true'

  const target_roles = targetRole === 'all' ? ['student', 'teacher', 'admin', 'parent'] : [targetRole]

  const { error } = await (supabase
    .from('announcements') as any)
    .insert({
      title_en,
      title_ur: title_ur || null,
      body_en,
      body_ur: body_ur || null,
      target_roles,
      send_email,
      send_whatsapp,
      published_at: new Date().toISOString()
    })

  if (error) {
    return { success: false, error: error.message }
  }

  // Trigger real email sending via Nodemailer
  if (send_email) {
    try {
      const adminClient = createAdminClient()
      const { data: { users } } = await adminClient.auth.admin.listUsers({ perPage: 1000 })
      
      let recipientEmails: string[] = []
      if (users && users.length > 0) {
        if (targetRole === 'all') {
          recipientEmails = users.filter(u => u.email).map(u => u.email!)
        } else {
          const { data: profiles } = await adminClient
            .from('profiles')
            .select('id, role')
            .eq('role', targetRole)
            .eq('is_active', true)
          const validIds = new Set(profiles?.map((p: any) => p.id) || [])
          recipientEmails = users.filter(u => validIds.has(u.id) && u.email).map(u => u.email!)
        }
      }

      if (recipientEmails.length > 0) {
        await sendEmail({
          to: recipientEmails,
          subject: `Announcement: ${title_en}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px; background-color: #ffffff;">
              <h2 style="color: #0f172a; margin-top: 0;">${title_en}</h2>
              ${title_ur ? `<h3 style="color: #1e3a8a; direction: rtl; text-align: right;">${title_ur}</h3>` : ''}
              <div style="color: #334155; font-size: 15px; line-height: 1.6; margin: 16px 0;">
                ${body_en.replace(/\n/g, '<br/>')}
              </div>
              ${body_ur ? `
                <div style="color: #334155; font-size: 16px; line-height: 1.8; direction: rtl; text-align: right; margin: 16px 0; border-top: 1px dashed #cbd5e1; padding-top: 12px;">
                  ${body_ur.replace(/\n/g, '<br/>')}
                </div>
              ` : ''}
              <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
              <p style="color: #94a3b8; font-size: 12px; margin-bottom: 0;">
                Jamia Management System — Official Institution Broadcast
              </p>
            </div>
          `
        })
      }
    } catch (e) {
      console.error('Failed to send announcement emails:', e)
    }
  }

  revalidatePath('/en/admin/dashboard')
  revalidatePath('/ur/admin/dashboard')
  revalidatePath('/en/admin/announcements')
  revalidatePath('/ur/admin/announcements')
  return { success: true }
}
