import { getDictionary } from '@/lib/dictionaries'
import { PortalShell } from '@/components/ui/PortalShell'
import { getExpenses } from '@/lib/actions/donations' // using the same file for finance basic actions
import { ExpensesManager } from './ExpensesManager'

export default async function AccountantExpenses({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  const isUr = lang === 'ur'
  
  const expenses = await getExpenses()

  return (
    <PortalShell role="accountant" lang={lang} dict={dict}>
      <ExpensesManager initialExpenses={expenses} isUr={isUr} />
    </PortalShell>
  )
}
