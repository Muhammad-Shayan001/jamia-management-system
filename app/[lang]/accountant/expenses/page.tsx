import { PortalShell } from '@/components/ui/PortalShell'
import { getExpenses } from '@/lib/actions/donations'
import { ExpensesManager } from './ExpensesManager'

export default async function AccountantExpenses({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const isUr = lang === 'ur'
  const expenses = await getExpenses()

  return (
    <PortalShell portalType="accountant" lang={lang}>
      <ExpensesManager initialExpenses={expenses} isUr={isUr} />
    </PortalShell>
  )
}
