import { redirect } from 'next/navigation'

export default async function StudentIndexRedirect({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  redirect(`/${lang}/student/dashboard`)
}
