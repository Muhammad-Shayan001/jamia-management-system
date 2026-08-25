import { getDictionary } from '@/lib/dictionaries'
import { LoginForm } from './LoginForm'
import { Suspense } from 'react'
import Link from 'next/link'
import { Globe, GraduationCap } from 'lucide-react'

export default async function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const isRtl = lang === 'ur'
  const otherLang = lang === 'en' ? 'ur' : 'en'

  return (
    <div className="min-h-screen flex flex-col justify-between bg-surface relative overflow-hidden">
      {/* Subtle Islamic Arch / Radial Accent Background */}
      <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="w-full px-6 py-4 flex items-center justify-between z-10 border-b border-border/40 backdrop-blur-sm bg-surface/80">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-accent font-bold text-lg shadow-sm">
            ج
          </div>
          <div>
            <span className="font-bold text-base text-primary tracking-tight">جامعہ LMS</span>
            <span className="hidden sm:inline text-xs text-muted-foreground ml-2">Jamia Islamic Seminary</span>
          </div>
        </div>

        {/* Language Switcher */}
        <Link
          href={`/${otherLang}/login`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-primary/20 hover:bg-primary/5 text-xs font-semibold text-primary transition-colors shadow-sm"
        >
          <Globe className="w-3.5 h-3.5" />
          {lang === 'en' ? 'اردو زبان' : 'English'}
        </Link>
      </header>

      {/* Main Form Center */}
      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-md">
          <Suspense
            fallback={
              <div className="w-full h-96 bg-card/50 rounded-2xl border border-primary/10 animate-pulse" />
            }
          >
            <LoginForm dict={dict} lang={lang} />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-muted-foreground z-10 border-t border-border/40">
        <p>© {new Date().getFullYear()} Jamia LMS — Enterprise Islamic Seminary Management</p>
      </footer>
    </div>
  )
}
