import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

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
          cookiesToSet.forEach(({ name, value, options }) =>
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

  // Define protected routes
  const isDashboardRoute = request.nextUrl.pathname.startsWith('/dashboard')
  const isOnboardingRoute = request.nextUrl.pathname.startsWith('/onboarding')
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')

  // Redirect unauthenticated users to login if they try to access dashboard or onboarding
  if (!user && (isDashboardRoute || isOnboardingRoute)) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Check Onboarding Status (Conceptual - implementation details might vary depending on where 'onboarding_complete' is stored)
  // For now, let's assume if they are logged in and hit /onboarding, we let them proceed.
  // If they are logged in and try to access login/register, redirect to dashboard
  if (user && isAuthRoute) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
  }

  return response
}
