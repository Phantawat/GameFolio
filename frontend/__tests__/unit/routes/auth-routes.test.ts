import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { POST as signOutRoute } from '@/app/auth/signout/route'
import { GET as confirmRoute } from '@/app/auth/confirm/route'

describe('auth routes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('POST /auth/signout signs out logged-in users, clears cookie, and redirects', async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u-1' } }, error: null }),
        signOut,
      },
    } as any)

    const req = new NextRequest('http://localhost:3000/auth/signout', { method: 'POST' })
    const res = await signOutRoute(req)

    expect(signOut).toHaveBeenCalledTimes(1)
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toContain('/login')
    expect(res.headers.get('set-cookie')).toContain('gf_session_started_at=')
  })

  it('POST /auth/signout does not call signOut when no active user', async () => {
    const signOut = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
        signOut,
      },
    } as any)

    const req = new NextRequest('http://localhost:3000/auth/signout', { method: 'POST' })
    const res = await signOutRoute(req)

    expect(signOut).not.toHaveBeenCalled()
    expect(res.status).toBe(302)
    expect(res.headers.get('location')).toContain('/login')
  })

  it('GET /auth/confirm redirects to next path when OTP verification succeeds', async () => {
    const verifyOtp = vi.fn().mockResolvedValue({ error: null })
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        verifyOtp,
      },
    } as any)

    const req = new NextRequest(
      'http://localhost:3000/auth/confirm?token_hash=abc123&type=signup&next=/dashboard/player'
    )
    const res = await confirmRoute(req)

    expect(verifyOtp).toHaveBeenCalledWith({ type: 'signup', token_hash: 'abc123' })
    expect(res.headers.get('location')).toContain('/dashboard/player')
  })

  it('GET /auth/confirm redirects to /error when token validation fails', async () => {
    const verifyOtp = vi.fn().mockResolvedValue({ error: { message: 'bad token' } })
    vi.mocked(createClient).mockResolvedValue({
      auth: {
        verifyOtp,
      },
    } as any)

    const req = new NextRequest('http://localhost:3000/auth/confirm?token_hash=bad&type=signup')
    const res = await confirmRoute(req)

    expect(res.headers.get('location')).toContain('/error')
  })
})
