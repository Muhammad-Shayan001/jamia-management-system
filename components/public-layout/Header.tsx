'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export function PublicHeader() {
  const params = useParams()
  const lang = params.lang as string || 'en'
  const isUrdu = lang === 'ur'

  return (
    <header className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href={`/${lang}`} className="text-xl font-bold text-primary">
            {isUrdu ? 'جامعہ مینجمنٹ' : 'Jamia LMS'}
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link href={`/${lang}/about`} className="hover:text-primary transition-colors">
              {isUrdu ? 'ہمارے بارے میں' : 'About'}
            </Link>
            <Link href={`/${lang}/admissions`} className="hover:text-primary transition-colors">
              {isUrdu ? 'داخلہ' : 'Admissions'}
            </Link>
            <Link href={`/${lang}/contact`} className="hover:text-primary transition-colors">
              {isUrdu ? 'رابطہ کریں' : 'Contact'}
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <Link href="/en" className={`px-2 ${!isUrdu ? 'font-bold' : ''}`}>EN</Link>
            |
            <Link href="/ur" className={`px-2 ${isUrdu ? 'font-bold' : ''}`}>UR</Link>
          </div>
          <Link href={`/${lang}/login`}>
            <Button variant="outline">{isUrdu ? 'لاگ ان' : 'Log In'}</Button>
          </Link>
          <Link href={`/${lang}/admissions`}>
            <Button>{isUrdu ? 'اپلائی کریں' : 'Apply Now'}</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
