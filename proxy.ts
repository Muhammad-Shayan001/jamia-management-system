import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const LOCALES = ['en', 'ur'] as const
type Locale = typeof LOCALES[number]

const DEFAULT_LOCALE: Locale = 'en'
const SUPER_ADMIN_EMAIL = (process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'admin@jamia.edu').toLowerCase()

function getLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && LOCALES.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale
  }

  const acceptLang = request.headers.get('accept-language') ?? ''
  if (acceptLang.toLowerCase().includes('ur')) return 'ur'

  return DEFAULT_LOCALE
}

function pathnameHasLocale(pathname: string): boolean {
  return LOCALES.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
}

// Role → portal prefix map
const ROLE_PORTALS: Record<string, string> = {
  super_admin: '/super-admin',
  admin: '/admin',
  nazim: '/admin',
  teacher: '/teacher',
  student: '/student',
  parent: '/student',
}

// Public paths that don't require auth (after locale prefix)
const PUBLIC_PATHS = ['/login', '/reset-password', '/update-password']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- 1. Skip Next.js internals and static files ---
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // --- 2. Locale redirect ---
  if (!pathnameHasLocale(pathname)) {
    const locale = getLocale(request)
    const redirectUrl = new URL(
      `/${locale}${pathname === '/' ? '' : pathname}`,
      request.url
    )
    return NextResponse.redirect(redirectUrl)
  }

  // Extract locale and the path after the locale prefix
  const locale = pathname.split('/')[1] as Locale
  const pathAfterLocale = '/' + pathname.split('/').slice(2).join('/')

  // --- 3. Check if it's a public path ---
  const isPublic = PUBLIC_PATHS.some(
    (p) => pathAfterLocale === p || pathAfterLocale.startsWith(p + '/')
  )

  // --- 4. Get session via Supabase SSR ---
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set({ name, value, ...options })
            response.cookies.set({ name, value, ...options })
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // --- 5. Not authenticated ---
  if (!user) {
    if (isPublic) return response
    const loginUrl = new URL(`/${locale}/login`, request.url)
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Determine effective role
  let userRole = 'student'
  if (user.email?.toLowerCase() === SUPER_ADMIN_EMAIL) {
    userRole = 'super_admin'
  } else {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    if (profile?.role) {
      userRole = profile.role
    }
  }

  // If authenticated and hitting login or root, redirect to role portal
  if (pathAfterLocale === '/login' || pathAfterLocale === '/' || pathAfterLocale === '') {
    const portal = ROLE_PORTALS[userRole] ?? '/student'
    const targetUrl = portal === '/super-admin'
      ? `/${locale}/super-admin`
      : `/${locale}${portal}/dashboard`
    return NextResponse.redirect(new URL(targetUrl, request.url))
  }

  // --- 6. Role-based portal guard ---
  const portalMap: Record<string, string[]> = {
    '/super-admin': ['super_admin'],
    '/admin': ['admin', 'nazim', 'super_admin'],
    '/teacher': ['teacher', 'super_admin'],
    '/student': ['student', 'parent', 'super_admin'],
  }

  let requiredRoles: string[] | null = null
  for (const [prefix, roles] of Object.entries(portalMap)) {
    if (
      pathAfterLocale.startsWith(prefix + '/') ||
      pathAfterLocale === prefix
    ) {
      requiredRoles = roles
      break
    }
  }

  if (requiredRoles && !requiredRoles.includes(userRole)) {
    const correctPortal = ROLE_PORTALS[userRole] ?? '/student'
    const targetUrl = correctPortal === '/super-admin'
      ? `/${locale}/super-admin`
      : `/${locale}${correctPortal}/dashboard`
    return NextResponse.redirect(new URL(targetUrl, request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
