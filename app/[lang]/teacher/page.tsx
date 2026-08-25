import { redirect } from 'next/navigation'

export default async function TeacherIndexRedirect({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  redirect(`/${lang}/teacher/dashboard`)
}
