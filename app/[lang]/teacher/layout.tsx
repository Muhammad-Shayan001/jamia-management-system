import { getDictionary } from '@/lib/dictionaries'
import { PortalShell } from '@/components/ui/PortalShell'

export default async function TeacherLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  await getDictionary(lang)

  return (
    <PortalShell lang={lang} portalType="teacher">
      {children}
    </PortalShell>
  )
}
