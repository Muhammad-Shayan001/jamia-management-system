'use server'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function postAnnouncement(formData: FormData) {
  const supabase = await createClient()
  
  const title_en = formData.get('title_en') as string
  const title_ur = formData.get('title_ur') as string
  const body_en = formData.get('body_en') as string
  const body_ur = formData.get('body_ur') as string
  
  // Note: in a real implementation we would also grab target_roles, etc.
  
  const { error } = await (supabase
    .from('announcements') as any)
    .insert({
      title_en,
      title_ur,
      body_en,
      body_ur,
      target_roles: ['student', 'teacher'], // broadcast
      send_email: formData.get('send_email') === 'on',
      send_whatsapp: formData.get('send_whatsapp') === 'on'
    })

  if (error) {
    return { success: false, error: error.message }
  }

  // If email/whatsapp checked, trigger those utilities here
  // sendEmail(...)
  // sendWhatsApp(...)

  revalidatePath('/[lang]/admin/dashboard', 'page')
  return { success: true }
}
