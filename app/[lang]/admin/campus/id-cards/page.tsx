import { BulkIDCardPrinter } from './BulkIDCardPrinter'

export default async function AdminIDCardsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <BulkIDCardPrinter lang={lang} />
}
