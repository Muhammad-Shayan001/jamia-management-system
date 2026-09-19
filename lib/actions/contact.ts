'use server'

import { sendEmail } from '../communication'

export async function sendContactEmail(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const message = formData.get('message') as string

  if (!name || !email || !message) {
    return { success: false, error: 'All fields are required.' }
  }

  const result = await sendEmail({
    to: process.env.SMTP_EMAIL || 'nizamiq001@gmail.com',
    subject: `Contact Form: Message from ${name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br/>')}</p>
    `,
  })

  if (!result.success) {
    return { success: false, error: 'Failed to send message. Please try again.' }
  }

  return { success: true }
}
