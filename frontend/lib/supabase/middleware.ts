import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import {
  APP_SESSION_COOKIE,
  APP_SESSION_MAX_AGE_MS,
  APP_SESSION_MAX_AGE_SECONDS,
} from '@/lib/auth/session'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Create a server client that can modify cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT:
  // *  1. This call refreshes the auth token/cookies if needed.
  // *  2. It also allows you to protect routes based on the user's session.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const { data: account } = await supabase
      .from('users')
      .select('is_suspended')
      .eq('id', user.id)
      .maybeSingle()

    if (account?.is_suspended) {
      await supabase.auth.signOut()

      const suspendedUrl = request.nextUrl.clone()
      suspendedUrl.pathname = '/login'
      suspendedUrl.searchParams.set(
        'message',
        'Your account is suspended. Contact support if you think this is a mistake.'
      )

      const suspendedResponse = NextResponse.redirect(suspendedUrl)
      suspendedResponse.cookies.delete(APP_SESSION_COOKIE)
      return suspendedResponse
    }
  }

  if (user) {
    const sessionStartedAtRaw = request.cookies.get(APP_SESSION_COOKIE)?.value
    const parsedSessionStartedAt = Number(sessionStartedAtRaw)

    const sessionStartedAt = Number.isFinite(parsedSessionStartedAt)
      ? parsedSessionStartedAt
      : Date.now()

    if (Date.now() - sessionStartedAt > APP_SESSION_MAX_AGE_MS) {
      await supabase.auth.signOut()

      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('message', 'Session expired after 24 hours. Please sign in again.')

      const expiredResponse = NextResponse.redirect(url)
      expiredResponse.cookies.delete(APP_SESSION_COOKIE)
      return expiredResponse
    }

    response.cookies.set(APP_SESSION_COOKIE, String(sessionStartedAt), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: APP_SESSION_MAX_AGE_SECONDS,
    })
  }

  // Define protected routes
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isOnboardingRoute = request.nextUrl.pathname.startsWith('/onboarding')
  const isOrgRoute = request.nextUrl.pathname.startsWith('/org')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const isAuthRoute =
    request.nextUrl.pathname.startsWith('/login') ||
    request.nextUrl.pathname.startsWith('/register') ||
    request.nextUrl.pathname.startsWith('/signup')

  // Redirect unauthenticated users to login
  if (!user && (isDashboardRoute || isOnboardingRoute || isOrgRoute || isAdminRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If logged in, skip auth pages
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}
