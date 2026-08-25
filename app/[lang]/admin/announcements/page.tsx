import { AnnouncementForm } from './AnnouncementForm'
import { getDictionary } from '@/lib/dictionaries'

export default async function ({ params }: { params: any }) {
  const { lang } = await params;
  const dict = await getDictionary(lang)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Broadcast Announcements</h2>
      </div>
      
      <div className="max-w-3xl">
        <AnnouncementForm />
      </div>
    </div>
  )
}
