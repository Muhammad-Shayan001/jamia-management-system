import { getDictionary } from '@/lib/dictionaries'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, BookOpen, Users, Award, Bell, Calendar } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Jamia LMS — جامعہ لرننگ مینجمنٹ سسٹم',
  description: 'A perfect blend of traditional Darse Nizami and modern education. Learning Management System for Islamic Seminaries.',
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const isUrdu = lang === 'ur'

  const supabase = await createClient()
  let announcements: any[] = []
  try {
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6)
    
    announcements = (data || []).filter((a: any) => {
      if (!a.target_roles || a.target_roles.length === 0) return true
      return a.target_roles.includes('public') || a.target_roles.includes('all') || a.target_roles.includes('student')
    }).slice(0, 3)
  } catch (_) {}

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

      {/* Public Announcements Feed */}
      {announcements.length > 0 && (
        <section className="py-20 border-t border-b border-primary/10">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-foreground flex items-center gap-2">
                  <Bell className="w-6 h-6 text-primary" />
                  {isUrdu ? 'تازہ ترین اعلانات و خبریں' : 'Latest Announcements & News'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {isUrdu ? 'جامعہ کی اہم سرگرمیاں اور نوٹس بورڈ' : 'Stay updated with institutional notices and news'}
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {announcements.map((item) => (
                <div key={item.id} className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(item.created_at).toLocaleDateString(lang === 'ur' ? 'ur-PK' : 'en-US')}</span>
                    </div>
                    <h3 className="font-bold text-lg text-card-foreground">
                      {isUrdu && item.title_ur ? item.title_ur : item.title_en}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {isUrdu && item.body_ur ? item.body_ur : item.body_en}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
