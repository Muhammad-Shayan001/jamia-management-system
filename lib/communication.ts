import nodemailer from 'nodemailer'

// Initialize Nodemailer Transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL || 'nizamiq001@gmail.com',
    pass: process.env.SMTP_APP_PASSWORD || 'fomz mqcy ktqb kvcd'
  }
})

export async function sendEmail({
  to,
  subject,
  html
}: {
  to: string | string[]
  subject: string
  html: string
}) {
  try {
    const info = await transporter.sendMail({
      from: `"Jamia LMS" <${process.env.SMTP_EMAIL || 'nizamiq001@gmail.com'}>`,
      to,
      subject,
      html
    })
    return { success: true, data: info }
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
    console.log(`?? [Mock WhatsApp] Would send template '${templateName}' to ${to}`)
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
