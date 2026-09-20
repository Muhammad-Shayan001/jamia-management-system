import { AdminTimetableManager } from './AdminTimetableManager'

export default async function AdminTimetablePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <AdminTimetableManager lang={lang} />
}
