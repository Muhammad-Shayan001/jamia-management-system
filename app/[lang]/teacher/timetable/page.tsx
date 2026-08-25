import { AdminTimetableManager } from '../../admin/timetable/AdminTimetableManager'

export default async function TeacherTimetablePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <AdminTimetableManager lang={lang} />
}
