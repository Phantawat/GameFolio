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
import { revalidatePath } from 'next/cache'
import { applyToTryout } from '@/app/(dashboard)/dashboard/tryouts/actions'

const MOCK_USER = { id: 'user-1', email: 'user@example.com' }
const VALID_TRYOUT_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('applyToTryout()', () => {
  it('1: returns fieldErrors when tryout_id is not a UUID', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: MOCK_USER }) as any
    )
    const fd = toFormData({ tryout_id: 'not-a-uuid' })

    const result = await applyToTryout(null, fd)

    expect(result.fieldErrors?.tryout_id).toBeDefined()
  })

  it('2: returns error when authenticated but no player_profile', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [{ data: null, error: { message: 'not found' } }],
      }) as any
    )
    const fd = toFormData({ tryout_id: VALID_TRYOUT_ID })

    const result = await applyToTryout(null, fd)

    expect(result.error).toMatch(/player profile not found/i)
  })

  it('3: returns duplicate-application error when DB returns code 23505', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: 'profile-1' }, error: null },
          { data: null, error: { code: '23505', message: 'duplicate key' } },
        ],
      }) as any
    )
    const fd = toFormData({ tryout_id: VALID_TRYOUT_ID })

    const result = await applyToTryout(null, fd)

    expect(result).toEqual({ error: 'You have already applied to this tryout.' })
  })

  it('4: returns success and revalidates paths on DB success', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: 'profile-1' }, error: null },
          { data: null, error: null },
        ],
      }) as any
    )
    const fd = toFormData({ tryout_id: VALID_TRYOUT_ID })

    const result = await applyToTryout(null, fd)

    expect(result).toEqual({ success: 'Application submitted successfully!' })
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/applications')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/tryouts')
  })

  it('5: returns generic error on any other DB failure', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: 'profile-1' }, error: null },
          { data: null, error: { code: '500', message: 'internal error' } },
        ],
      }) as any
    )
    const fd = toFormData({ tryout_id: VALID_TRYOUT_ID })

    const result = await applyToTryout(null, fd)

    expect(result).toEqual({ error: 'Failed to submit application. Please try again.' })
  })
})
