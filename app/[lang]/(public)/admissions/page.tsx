import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

export default async function AdmissionsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const isUrdu = lang === 'ur'

  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">{isUrdu ? 'داخلہ معلومات' : 'Admissions'}</h1>

      <div className="space-y-8 text-lg text-muted-foreground">
        <p>
          {isUrdu
            ? 'جامعہ میں داخلہ کا طریقہ کار سادہ اور آسان ہے۔ آن لائن رجسٹریشن فارم پر کریں اور انتظامیہ کی منظوری کا انتظار کریں۔'
            : 'Applying to the Jamia is simple and straightforward. Fill out the online registration form and await administration approval.'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { step: '1', en: 'Register Online', ur: 'آن لائن رجسٹریشن' },
            { step: '2', en: 'Admin Review', ur: 'انتظامیہ کا جائزہ' },
            { step: '3', en: 'Account Activated', ur: 'اکاؤنٹ فعال' },
          ].map((s) => (
            <div key={s.step} className="bg-primary/5 border border-primary/10 p-6 rounded-xl text-center">
              <div className="text-3xl font-black text-primary mb-2">{s.step}</div>
              <p className="font-semibold text-foreground">{isUrdu ? s.ur : s.en}</p>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 border border-primary/20 p-8 rounded-2xl flex flex-col items-center text-center mt-8">
          <h2 className="text-2xl font-bold text-foreground mb-4">
            {isUrdu ? 'ابھی اپلائی کریں' : 'Apply Now'}
          </h2>
          <p className="mb-6">
            {isUrdu
              ? 'طلباء اور اساتذہ اپنے اکاؤنٹس آن لائن بنا سکتے ہیں۔'
              : 'Students and Teachers can self-register using our online portal.'}
          </p>
          <Link href={`/${lang}/signup`}>
            <Button size="lg" className="text-lg px-8">
              {isUrdu ? 'رجسٹریشن فارم' : 'Go to Registration Form'}
              <ArrowRight className={`w-5 h-5 ${isUrdu ? 'mr-2 rotate-180' : 'ml-2'}`} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
