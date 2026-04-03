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
import { revalidatePath } from 'next/cache'
import { toggleTryoutActive } from '@/app/(admin)/admin/actions'

const ADMIN_USER = { id: 'admin-1', email: 'admin@example.com' }
const PLAYER_USER = { id: 'player-1', email: 'player@example.com' }
const VALID_TRYOUT_ID = '00000010-0000-4000-8000-000000000010'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('toggleTryoutActive()', () => {
  it('1: returns error when unauthenticated', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: null }) as any
    )
    const fd = toFormData({ tryout_id: VALID_TRYOUT_ID, is_active: 'false' })

    const result = await toggleTryoutActive(null, fd)

    expect(result.error).toMatch(/logged in/i)
  })

  it('2: returns permission denied when user is not PLATFORM_ADMIN', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: PLAYER_USER,
        fromChains: [{ data: null, error: null }], // no PLATFORM_ADMIN role
      }) as any
    )
    const fd = toFormData({ tryout_id: VALID_TRYOUT_ID, is_active: 'false' })

    const result = await toggleTryoutActive(null, fd)

    expect(result).toEqual({ error: 'Permission denied. Platform admin access required.' })
  })

  it('3: returns fieldErrors when tryout_id is not a UUID', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: ADMIN_USER }) as any
    )
    const fd = toFormData({ tryout_id: 'bad-id', is_active: 'true' })

    const result = await toggleTryoutActive(null, fd)

    expect(result.fieldErrors?.tryout_id).toBeDefined()
  })

  it('4: returns not-found error when tryout does not exist', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: ADMIN_USER,
        fromChains: [
          { data: { role: 'PLATFORM_ADMIN' }, error: null }, // role check
          { data: null, error: null },                        // tryout not found
        ],
      }) as any
    )
    const fd = toFormData({ tryout_id: VALID_TRYOUT_ID, is_active: 'false' })

    const result = await toggleTryoutActive(null, fd)

    expect(result).toEqual({ error: 'Tryout not found.' })
  })

  it('5: deactivates an active tryout when PLATFORM_ADMIN', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: ADMIN_USER,
        fromChains: [
          { data: { role: 'PLATFORM_ADMIN' }, error: null },           // role check
          { data: { id: VALID_TRYOUT_ID, is_active: true }, error: null }, // tryout found
          { data: null, error: null },                                  // update success
        ],
      }) as any
    )
    const fd = toFormData({ tryout_id: VALID_TRYOUT_ID, is_active: 'false' })

    const result = await toggleTryoutActive(null, fd)

    expect(result).toEqual({ success: 'Tryout deactivated.' })
    expect(revalidatePath).toHaveBeenCalledWith('/admin')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/tryouts')
  })

  it('6: re-activates a deactivated tryout when PLATFORM_ADMIN', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: ADMIN_USER,
        fromChains: [
          { data: { role: 'PLATFORM_ADMIN' }, error: null },
          { data: { id: VALID_TRYOUT_ID, is_active: false }, error: null },
          { data: null, error: null },
        ],
      }) as any
    )
    const fd = toFormData({ tryout_id: VALID_TRYOUT_ID, is_active: 'true' })

    const result = await toggleTryoutActive(null, fd)

    expect(result).toEqual({ success: 'Tryout activated.' })
  })

  it('7: returns error when DB update fails', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: ADMIN_USER,
        fromChains: [
          { data: { role: 'PLATFORM_ADMIN' }, error: null },
          { data: { id: VALID_TRYOUT_ID, is_active: true }, error: null },
          { data: null, error: { message: 'DB failure' } },
        ],
      }) as any
    )
    const fd = toFormData({ tryout_id: VALID_TRYOUT_ID, is_active: 'false' })

    const result = await toggleTryoutActive(null, fd)

    expect(result).toEqual({ error: 'Failed to update tryout status.' })
  })
})
