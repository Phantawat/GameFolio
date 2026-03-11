import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeSupabaseMock, makeChain, toFormData } from '../helpers/mock-supabase'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw Object.assign(new Error('NEXT_REDIRECT'), { url })
  }),
}))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { login, signup } from '@/app/auth/actions'

const VALID_EMAIL = 'user@example.com'
const VALID_PASSWORD = 'password123'
const BASE_USER = { id: 'user-1', email: VALID_EMAIL }

beforeEach(() => {
  vi.clearAllMocks()
})

// ─── login() ─────────────────────────────────────────────────────────────────

describe('login()', () => {
  it('1: returns fieldErrors for empty email', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as any)
    const fd = toFormData({ email: '', password: VALID_PASSWORD })

    const result = await login(null, fd)

    expect(result.error).toBeTruthy()
    expect(result.fieldErrors?.email).toBeDefined()
  })

  it('2: returns fieldErrors for invalid email format', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as any)
    const fd = toFormData({ email: 'not-an-email', password: VALID_PASSWORD })

    const result = await login(null, fd)

    expect(result.error).toMatch(/valid email/i)
    expect(result.fieldErrors?.email).toBeDefined()
  })

  it('3: returns fieldErrors when password is < 6 chars', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as any)
    const fd = toFormData({ email: VALID_EMAIL, password: '12345' })

    const result = await login(null, fd)

    expect(result.error).toBeTruthy()
    expect(result.fieldErrors?.password).toBeDefined()
  })

  it('4: returns error when Supabase returns AuthApiError', async () => {
    const mockSupabase = makeSupabaseMock()
    mockSupabase.auth.signInWithPassword = vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Invalid login credentials' },
    })
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    const fd = toFormData({ email: VALID_EMAIL, password: VALID_PASSWORD })

    const result = await login(null, fd)

    expect(result).toEqual({ error: 'Invalid login credentials' })
  })

  it('5: redirects to /onboarding when user has no player_profile', async () => {
    const mockSupabase = makeSupabaseMock({
      fromChains: [{ data: null, error: null }], // no profile
    })
    mockSupabase.auth.signInWithPassword = vi.fn().mockResolvedValue({
      data: { user: BASE_USER, session: {} },
      error: null,
    })
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    const fd = toFormData({ email: VALID_EMAIL, password: VALID_PASSWORD })

    await expect(login(null, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/onboarding')
  })

  it('6: redirects to /dashboard/player when player_profile exists', async () => {
    const mockSupabase = makeSupabaseMock({
      fromChains: [{ data: { id: 'profile-1' }, error: null }], // profile exists
    })
    mockSupabase.auth.signInWithPassword = vi.fn().mockResolvedValue({
      data: { user: BASE_USER, session: {} },
      error: null,
    })
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    const fd = toFormData({ email: VALID_EMAIL, password: VALID_PASSWORD })

    await expect(login(null, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/dashboard/player')
  })
})

// ─── signup() ────────────────────────────────────────────────────────────────

describe('signup()', () => {
  it('1: returns fieldErrors for invalid email', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as any)
    const fd = toFormData({ email: 'bad', password: VALID_PASSWORD })

    const result = await signup(null, fd)

    expect(result.error).toBeTruthy()
    expect(result.fieldErrors?.email).toBeDefined()
  })

  it('2: returns fieldErrors when password is < 6 chars', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock() as any)
    const fd = toFormData({ email: VALID_EMAIL, password: '123' })

    const result = await signup(null, fd)

    expect(result.error).toBeTruthy()
    expect(result.fieldErrors?.password).toBeDefined()
  })

  it('3: returns error when Supabase signUp fails', async () => {
    const mockSupabase = makeSupabaseMock()
    mockSupabase.auth.signUp = vi.fn().mockResolvedValue({
      data: { user: null, session: null },
      error: { message: 'Email already registered' },
    })
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    const fd = toFormData({ email: VALID_EMAIL, password: VALID_PASSWORD })

    const result = await signup(null, fd)

    expect(result).toEqual({ error: 'Email already registered' })
  })

  it('4: redirects to login with confirmation message on successful signup', async () => {
    const mockSupabase = makeSupabaseMock()
    mockSupabase.auth.signUp = vi.fn().mockResolvedValue({
      data: { user: BASE_USER, session: null },
      error: null,
    })
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    const fd = toFormData({ email: VALID_EMAIL, password: VALID_PASSWORD })

    await expect(signup(null, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith(
      expect.stringContaining('/login?message=')
    )
  })
})
