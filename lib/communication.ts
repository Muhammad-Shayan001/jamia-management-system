import { Resend } from 'resend'

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendEmail({
  to,
  subject,
  html
}: {
  to: string | string[]
  subject: string
  html: string
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('your_')) {
    console.log('✉️ [Mock Email] Would send to:', to, 'Subject:', subject)
    return { success: true, mock: true }
  }

  try {
    const data = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'Jamia LMS <noreply@jamialms.edu.pk>',
      to,
      subject,
      html
    })
    return { success: true, data }
  } catch (error) {
    console.error('Email send failed:', error)
    return { success: false, error }
  }
}

export async function sendWhatsApp({
  to,
  templateName,
  parameters = []
}: {
  to: string
  templateName: string
  parameters?: any[]
}) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || token.includes('your_')) {
    console.log(`💬 [Mock WhatsApp] Would send template '${templateName}' to ${to}`)
    return { success: true, mock: true }
  }

  try {
    const res = await fetch(`https://graph.facebook.com/v17.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'ur' },
          components: parameters.length ? [
            {
              type: 'body',
              parameters: parameters.map(p => ({ type: 'text', text: String(p) }))
            }
          ] : []
        }
      })
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'WhatsApp API Error')
    
    return { success: true, data }
  } catch (error) {
    console.error('WhatsApp send failed:', error)
    return { success: false, error }
  }
}
