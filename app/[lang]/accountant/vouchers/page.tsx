import { PortalShell } from '@/components/ui/PortalShell'
import { getFeeVouchers } from '@/lib/actions/finance'
import { VouchersManager } from './VouchersManager'

export default async function AccountantVouchers({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const isUr = lang === 'ur'
  const vouchers = await getFeeVouchers()

  return (
    <PortalShell portalType="accountant" lang={lang}>
      <VouchersManager initialVouchers={vouchers} isUr={isUr} />
    </PortalShell>
  )
}
