import { NextResponse, type NextRequest } from 'next/server'

const DEFAULT_NEXT_BY_MODE = {
  player: '/dashboard/player',
  org: '/org/rosters',
} as const

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const mode = url.searchParams.get('mode')

  if (mode !== 'player' && mode !== 'org') {
    return NextResponse.redirect(new URL('/dashboard', request.url), { status: 302 })
  }

  const requestedNext = url.searchParams.get('next')
  const nextPath =
    requestedNext && requestedNext.startsWith('/') && !requestedNext.startsWith('//')
      ? requestedNext
      : DEFAULT_NEXT_BY_MODE[mode]

  const response = NextResponse.redirect(new URL(nextPath, request.url), { status: 302 })

  response.cookies.set('gf_nav_mode', mode, {
    path: '/',
    sameSite: 'lax',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365,
  })

  return response
}
