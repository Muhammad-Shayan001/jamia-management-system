import { SignupForm } from './SignupForm'

export default async function SignupPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params

  return (
    <div className="min-h-screen bg-background flex">
      {/* LEFT - FORM */}
      <div className="w-full lg:w-[50%] flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24 py-12 overflow-y-auto">
        <SignupForm lang={lang} />
      </div>

      {/* RIGHT - BRANDING */}
      <div className="hidden lg:flex w-[50%] relative overflow-hidden bg-primary items-center justify-center sticky top-0 h-screen">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,.03) 20px, rgba(255,255,255,.03) 40px)" }}></div>
        <div className="relative z-10 text-center text-white p-12 max-w-lg">
          <div className="w-24 h-24 rounded-2xl bg-accent text-primary flex items-center justify-center text-4xl font-black mb-8 mx-auto shadow-2xl">
            ج
          </div>
          <h2 className="text-4xl font-bold mb-4 text-accent">Jamia Darul Uloom</h2>
          <p className="text-lg text-white/70 font-medium leading-relaxed mb-8">
            {lang === 'ur'
              ? 'ہمارے تعلیمی پورٹل میں خوش آمدید۔ رجسٹریشن کے بعد ایڈمن آپ کی درخواست کا جائزہ لے گا۔'
              : 'Welcome to our academic portal. After registration, an administrator will review and approve your account.'}
          </p>
          <div className="space-y-3 text-left">
            {[
              { icon: '🎓', en: 'Track attendance & results', ur: 'حاضری اور نتائج دیکھیں' },
              { icon: '📋', en: 'View timetable & syllabus', ur: 'وقت جدول اور نصاب' },
              { icon: '💳', en: 'Access your digital ID card', ur: 'ڈیجیٹل شناختی کارڈ' },
              { icon: '📢', en: 'Receive announcements', ur: 'اعلانات موصول کریں' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                <span className="text-xl">{item.icon}</span>
                <span className="text-sm font-medium text-white/80">
                  {lang === 'ur' ? item.ur : item.en}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
