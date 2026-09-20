import { getDictionary } from '@/lib/dictionaries'
import { PortalShell } from '@/components/ui/PortalShell'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getAccountantDashboardStats } from '@/lib/actions/finance'
import { Wallet, AlertTriangle, Clock, Heart } from 'lucide-react'

// Dummy client component for animation wrapper
import { AnimatedDashboard } from './AnimatedDashboard'

export default async function AccountantDashboard({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const isUr = lang === 'ur'
  
  const stats = await getAccountantDashboardStats()

  return (
    <PortalShell role="accountant" lang={lang} dict={dict}>
      <AnimatedDashboard stats={stats} isUr={isUr} />
    </PortalShell>
  )
}
