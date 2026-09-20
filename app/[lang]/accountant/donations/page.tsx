import { PortalShell } from '@/components/ui/PortalShell'
import { getDonations } from '@/lib/actions/donations'
import { DonationsManager } from './DonationsManager'

export default async function AccountantDonations({
  params
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const isUr = lang === 'ur'
  const donations = await getDonations()

  return (
    <PortalShell portalType="accountant" lang={lang}>
      <DonationsManager initialDonations={donations} isUr={isUr} />
    </PortalShell>
  )
}
