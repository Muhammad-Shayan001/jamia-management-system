import { getDictionary } from '@/lib/dictionaries'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Users, Award } from 'lucide-react'

export const metadata = {
  title: 'Jamia LMS — جامعہ لرننگ مینجمنٹ سسٹم',
  description: 'A perfect blend of traditional Darse Nizami and modern education.',
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const isUrdu = lang === 'ur'

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full py-24 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4 flex flex-col items-center text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight max-w-4xl leading-tight">
            {isUrdu ? 'جامعہ مینجمنٹ میں خوش آمدید' : 'Welcome to the Modern Jamia Experience'}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {isUrdu
              ? 'درس نظامی اور عصری تعلیم کا حسین امتزاج۔ آج ہی ہمارے ساتھ شامل ہوں اور علم کے سفر کا آغاز کریں۔'
              : 'A perfect blend of traditional Darse Nizami and modern education. Join us today to begin your journey of knowledge.'}
          </p>
          <div className="flex gap-4 flex-wrap justify-center">
            <Link href={`/${lang}/admissions`}>
              <Button size="lg" className="h-12 px-8 text-lg">
                {isUrdu ? 'داخلہ معلومات' : 'Admissions Info'}
                <ArrowRight className={`w-5 h-5 ${isUrdu ? 'mr-2 rotate-180' : 'ml-2'}`} />
              </Button>
            </Link>
            <Link href={`/${lang}/login`}>
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
                {isUrdu ? 'پورٹل میں داخل ہوں' : 'Enter Portal'}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            {isUrdu ? 'ہماری خصوصیات' : 'Why Choose Us?'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-background rounded-2xl shadow-sm border border-primary/10">
              <div className="p-4 bg-primary/10 rounded-full text-primary">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">{isUrdu ? 'جامع نصاب' : 'Comprehensive Syllabus'}</h3>
              <p className="text-muted-foreground">{isUrdu ? 'مستند اور جامع نصاب تعلیم' : 'Authentic and complete Darse Nizami curriculum.'}</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-background rounded-2xl shadow-sm border border-primary/10">
              <div className="p-4 bg-primary/10 rounded-full text-primary">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">{isUrdu ? 'بہترین اساتذہ' : 'Expert Teachers'}</h3>
              <p className="text-muted-foreground">{isUrdu ? 'تجربہ کار اور مستند اساتذہ کرام' : 'Experienced and certified Islamic scholars.'}</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4 p-6 bg-background rounded-2xl shadow-sm border border-primary/10">
              <div className="p-4 bg-primary/10 rounded-full text-primary">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold">{isUrdu ? 'بہترین ماحول' : 'Excellent Environment'}</h3>
              <p className="text-muted-foreground">{isUrdu ? 'تعلیم و تربیت کے لیے بہترین ماحول' : 'Perfect environment for education and tarbiyah.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">
            {isUrdu ? 'آج ہی داخلہ لیں' : 'Ready to Join?'}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {isUrdu ? 'داخلہ کے لیے ابھی آن لائن رجسٹریشن کریں۔' : 'Apply online today and begin your journey.'}
          </p>
          <Link href={`/${lang}/signup`}>
            <Button size="lg" className="h-12 px-10 text-lg">
              {isUrdu ? 'ابھی رجسٹر کریں' : 'Register Now'}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
