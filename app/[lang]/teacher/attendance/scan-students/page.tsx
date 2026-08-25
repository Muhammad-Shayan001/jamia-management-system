import { StudentAttendanceScanner } from './StudentAttendanceScanner'

export default async function ScanStudentsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <StudentAttendanceScanner lang={lang} />
}
