import { ContactForm } from '@/components/public-layout/ContactForm'
import { Mail, MapPin } from 'lucide-react'

export default async function ContactPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const isUrdu = lang === 'ur'

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <h1 className="text-4xl font-bold mb-4">{isUrdu ? 'رابطہ کریں' : 'Contact Us'}</h1>
      <p className="text-muted-foreground text-lg mb-12">
        {isUrdu ? 'ہم سے رابطے کے لیے نیچے فارم پر کریں۔' : 'Fill out the form below to get in touch with us.'}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{isUrdu ? 'ای میل' : 'Email'}</h3>
              <p className="text-muted-foreground">nizamiq001@gmail.com</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-full text-primary shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{isUrdu ? 'پتہ' : 'Address'}</h3>
              <p className="text-muted-foreground">{isUrdu ? 'پاکستان' : 'Pakistan'}</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card border border-primary/10 rounded-2xl p-6 shadow-sm">
          <ContactForm lang={lang} />
        </div>
      </div>
    </div>
  )
}
