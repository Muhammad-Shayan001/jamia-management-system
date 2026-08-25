import { getDictionary } from '@/lib/dictionaries'
import { PortalShell } from '@/components/ui/PortalShell'

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  await getDictionary(lang) // validates locale exists, 404s if not

  return (
    <PortalShell lang={lang} portalType="admin">
      {children}
    </PortalShell>
  )
}
