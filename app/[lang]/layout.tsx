import type { Metadata } from 'next'
import { Inter, Noto_Nastaliq_Urdu } from 'next/font/google'
import '../globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })
const urdu = Noto_Nastaliq_Urdu({ subsets: ['arabic'], variable: '--font-urdu', weight: ['400', '700'] })

export const metadata: Metadata = {
  title: 'Jamia LMS — جامعہ لرننگ مینجمنٹ سسٹم',
  description: 'Enterprise Learning Management System for Darse Nizami and Islamic Seminaries',
}

export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'ur' }]
}

export default async function RootLayout(props: LayoutProps<'/[lang]'>) {
  const { lang } = await props.params
  const isRtl = lang === 'ur'
  const dir = isRtl ? 'rtl' : 'ltr'

  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={`${inter.variable} ${urdu.variable} min-h-screen bg-background font-sans antialiased text-foreground selection:bg-accent/30 selection:text-primary`}
      >
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {props.children}
          <Toaster richColors position={isRtl ? 'top-left' : 'top-right'} dir={dir} />
        </ThemeProvider>
      </body>
    </html>
  )
}
