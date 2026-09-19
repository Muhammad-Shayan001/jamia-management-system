import { PublicHeader } from '@/components/public-layout/Header'
import { getDictionary } from '@/lib/dictionaries'

export default async function PublicLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="w-full border-t py-8 mt-12 bg-muted/20">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Jamia Management System. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
