'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CheckCircle } from 'lucide-react'
import { sendContactEmail } from '@/lib/actions/contact'

export function ContactForm({ lang }: { lang: string }) {
  const isUrdu = lang === 'ur'
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    const result = await sendContactEmail(formData)
    setLoading(false)
    if (result.success) {
      setSubmitted(true)
    } else {
      setError(result.error || 'Something went wrong')
    }
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center text-center py-12 space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h3 className="text-xl font-bold">{isUrdu ? 'پیغام بھیج دیا گیا!' : 'Message Sent!'}</h3>
        <p className="text-muted-foreground">{isUrdu ? 'ہم جلد رابطہ کریں گے۔' : 'We will get back to you shortly.'}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">{isUrdu ? 'نام' : 'Name'}</label>
        <Input name="name" required placeholder={isUrdu ? 'آپ کا نام' : 'Your name'} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{isUrdu ? 'ای میل' : 'Email'}</label>
        <Input name="email" type="email" required placeholder={isUrdu ? 'آپ کی ای میل' : 'your@email.com'} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">{isUrdu ? 'پیغام' : 'Message'}</label>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          placeholder={isUrdu ? 'آپ کا پیغام' : 'Your message...'}
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? (isUrdu ? 'بھیجا جا رہا ہے...' : 'Sending...') : (isUrdu ? 'پیغام بھیجیں' : 'Send Message')}
      </Button>
    </form>
  )
}
