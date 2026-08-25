import { TeacherSelfCheckIn } from './TeacherSelfCheckIn'

export default async function SelfCheckInPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return <TeacherSelfCheckIn lang={lang} />
}
