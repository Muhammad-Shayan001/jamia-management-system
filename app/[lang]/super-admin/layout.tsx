import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PortalShell } from '@/components/ui/PortalShell'

const SUPER_ADMIN_EMAIL = (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'nizamiq001@gmail.com').toLowerCase()

export default async function SuperAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Not logged in → go to login
  if (!user) {
    redirect(`/${lang}/login`)
  }

  // Only the super admin email can access this portal
  const userEmail = user.email?.toLowerCase() ?? ''
  if (userEmail !== SUPER_ADMIN_EMAIL) {
    // Redirect other roles to their correct portal instead of login
    // to prevent cross-redirect loops
    redirect(`/${lang}/login?error=unauthorized`)
  }

  // Ensure the profile row exists with the correct role (upsert silently)
  await (supabase as any).from('profiles').upsert({
    id: user.id,
    role: 'super_admin',
    is_active: true,
  }, { onConflict: 'id', ignoreDuplicates: false })

  return (
    <PortalShell lang={lang} portalType="super_admin">
      {children}
    </PortalShell>
  )
}

