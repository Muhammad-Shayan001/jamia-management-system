import { PortalShell } from '@/components/ui/PortalShell'

export default async function SuperAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  return (
    <PortalShell lang={lang} portalType="super_admin">
      {children}
    </PortalShell>
  )
}
