import { PortalShell } from '@/components/ui/PortalShell'
import { getAccountantDashboardStats } from '@/lib/actions/finance'
import { AnimatedDashboard } from './AnimatedDashboard'

export default async function AccountantDashboard({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const isUr = lang === 'ur'
  const stats = await getAccountantDashboardStats()

  return (
    <PortalShell portalType="accountant" lang={lang}>
      <AnimatedDashboard stats={stats} isUr={isUr} />
    </PortalShell>
  )
}
