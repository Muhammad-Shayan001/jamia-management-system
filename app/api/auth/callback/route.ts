import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/en/update-password'
  const type = searchParams.get('type') // 'recovery' for password reset

  // Build the base URL from x-forwarded-host (set by Vercel/proxy) so the
  // redirect always points to the deployed app, never localhost.
  const forwardedHost = request.headers.get('x-forwarded-host')
  const proto = request.headers.get('x-forwarded-proto') || 'https'
  const base = forwardedHost ? `${proto}://${forwardedHost}` : origin

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const redirectPath = type === 'recovery' ? '/en/update-password' : next
      return NextResponse.redirect(`${base}${redirectPath}`)
    }
    console.error('Auth code exchange error:', error)
    return NextResponse.redirect(`${base}/en/forgot-password?error=link_expired`)
  }

  // No code — could be a hash-based token (handled entirely client-side by Supabase JS)
  // Just redirect to the update-password page and let the client parse the hash.
  return NextResponse.redirect(`${base}${next}`)
}
