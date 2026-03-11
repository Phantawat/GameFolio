import { describe, it, expect, vi, beforeEach } from 'vitest'
import { makeSupabaseMock, toFormData } from '../helpers/mock-supabase'

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
import { completeOnboarding } from '@/app/onboarding/actions'

const MOCK_USER = { id: 'user-1', email: 'user@example.com' }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('completeOnboarding()', () => {
  it('1: returns fieldErrors when gamertag is 1 character', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: MOCK_USER }) as any
    )
    const fd = toFormData({ gamertag: 'a', region: 'NA' })

    const result = await completeOnboarding(null, fd)

    expect(result.fieldErrors?.gamertag).toBeDefined()
    expect(result.fieldErrors?.gamertag?.[0]).toMatch(/at least 2 characters/i)
  })

  it('2: upserts player_profile and redirects to /dashboard/player on success', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [{ data: null, error: null }], // upsert succeeds
      }) as any
    )
    const fd = toFormData({ gamertag: 'ProGamer', region: 'NA' })

    await expect(completeOnboarding(null, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/dashboard/player')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard', 'layout')
  })

  it('3: returns error when DB upsert fails', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [{ data: null, error: { message: 'DB constraint violation' } }],
      }) as any
    )
    const fd = toFormData({ gamertag: 'ProGamer', region: 'NA' })

    const result = await completeOnboarding(null, fd)

    expect(result).toEqual({ error: 'DB constraint violation' })
  })

  it('4: returns auth error for unauthenticated call', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: null }) as any
    )
    const fd = toFormData({ gamertag: 'ProGamer' })

    const result = await completeOnboarding(null, fd)

    expect(result).toEqual({
      error: 'You must be logged in to perform this action.',
    })
  })
})
