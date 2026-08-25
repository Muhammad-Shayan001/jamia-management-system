import { redirect } from 'next/navigation'

export default async function AdminIndexRedirect({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  redirect(`/${lang}/admin/dashboard`)
}
