import ForgotPasswordForm from './ForgotPasswordForm'
import { getDictionary } from '@/lib/dictionaries'

export default async function ForgotPasswordPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  
  return (
    <div className="min-h-screen bg-background flex">
      {/* LEFT SIDE - FORM */}
      <div className="w-full lg:w-[45%] flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 relative z-10">
        <ForgotPasswordForm lang={lang} />
      </div>

      {/* RIGHT SIDE - BRANDING */}
      <div className="hidden lg:flex w-[55%] relative overflow-hidden bg-primary items-center justify-center">
        <div className="absolute inset-0 opacity-10 bg-[url('/islamic-pattern.png')] bg-repeat opacity-20 mix-blend-overlay"></div>
        <div className="relative z-10 text-center text-white p-12 max-w-2xl">
          <div className="w-24 h-24 rounded-2xl bg-accent text-primary flex items-center justify-center text-4xl font-black mb-8 mx-auto shadow-2xl">
            ج
          </div>
          <h2 className="text-4xl font-bold mb-6 text-accent">Jamia Darul Uloom</h2>
          <p className="text-lg text-primary-100 font-medium leading-relaxed">
            {lang === 'ur' 
              ? 'اپنے اکاؤنٹ تک دوبارہ رسائی حاصل کرنے کے لیے اپنا پاس ورڈ ری سیٹ کریں۔' 
              : 'Securely reset your password to regain access to the seminary management system.'}
          </p>
        </div>
      </div>
    </div>
  )
}
