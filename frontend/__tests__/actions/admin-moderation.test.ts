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
import {
  deleteTryoutModeration,
  restoreTryoutModeration,
  toggleTryoutActive,
  toggleUserSuspension,
} from '@/app/(admin)/admin/actions'

const ADMIN_USER = {
  id: '00000030-0000-4000-8000-000000000030',
  email: 'admin@example.com',
}
const PLAYER_USER = {
  id: '00000031-0000-4000-8000-000000000031',
  email: 'player@example.com',
}
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
          { data: { id: VALID_TRYOUT_ID, is_active: true, deleted_at: null }, error: null }, // tryout found
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
          { data: { id: VALID_TRYOUT_ID, is_active: false, deleted_at: null }, error: null },
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
          { data: { id: VALID_TRYOUT_ID, is_active: true, deleted_at: null }, error: null },
          { data: null, error: { message: 'DB failure' } },
        ],
      }) as any
    )
    const fd = toFormData({ tryout_id: VALID_TRYOUT_ID, is_active: 'false' })

    const result = await toggleTryoutActive(null, fd)

    expect(result).toEqual({ error: 'Failed to update tryout status.' })
  })

  it('8: blocks status toggles for deleted tryouts', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: ADMIN_USER,
        fromChains: [
          { data: { role: 'PLATFORM_ADMIN' }, error: null },
          { data: { id: VALID_TRYOUT_ID, is_active: false, deleted_at: '2026-01-01T00:00:00Z' }, error: null },
        ],
      }) as any
    )
    const fd = toFormData({ tryout_id: VALID_TRYOUT_ID, is_active: 'true' })

    const result = await toggleTryoutActive(null, fd)

    expect(result).toEqual({ error: 'Restore this tryout before changing active status.' })
  })
})

describe('deleteTryoutModeration()', () => {
  it('1: denies non-admin user', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: PLAYER_USER,
        fromChains: [{ data: null, error: null }],
      }) as any
    )

    const result = await deleteTryoutModeration(null, toFormData({ tryout_id: VALID_TRYOUT_ID }))

    expect(result.error).toMatch(/platform admin access required/i)
  })

  it('2: soft-deletes tryout for admin', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: ADMIN_USER,
        fromChains: [
          { data: { role: 'PLATFORM_ADMIN' }, error: null },
          { data: { id: VALID_TRYOUT_ID, deleted_at: null }, error: null },
          { data: null, error: null },
        ],
      }) as any
    )

    const result = await deleteTryoutModeration(null, toFormData({ tryout_id: VALID_TRYOUT_ID }))

    expect(result).toEqual({ success: 'Tryout deleted.' })
    expect(revalidatePath).toHaveBeenCalledWith('/admin')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/tryouts')
    expect(revalidatePath).toHaveBeenCalledWith('/org/tryouts')
  })
})

describe('restoreTryoutModeration()', () => {
  it('1: restores previously deleted tryout for admin', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: ADMIN_USER,
        fromChains: [
          { data: { role: 'PLATFORM_ADMIN' }, error: null },
          { data: { id: VALID_TRYOUT_ID, deleted_at: '2026-01-01T00:00:00Z' }, error: null },
          { data: null, error: null },
        ],
      }) as any
    )

    const result = await restoreTryoutModeration(null, toFormData({ tryout_id: VALID_TRYOUT_ID }))

    expect(result).toEqual({ success: 'Tryout restored.' })
  })
})

describe('toggleUserSuspension()', () => {
  const VALID_USER_ID = '00000020-0000-4000-8000-000000000020'

  it('1: denies non-admin user', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: PLAYER_USER,
        fromChains: [{ data: null, error: null }],
      }) as any
    )
    const fd = toFormData({ user_id: VALID_USER_ID, is_suspended: 'true' })

    const result = await toggleUserSuspension(null, fd)

    expect(result.error).toMatch(/platform admin access required/i)
  })

  it('2: blocks self-suspension for current admin', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: ADMIN_USER,
        fromChains: [{ data: { role: 'PLATFORM_ADMIN' }, error: null }],
      }) as any
    )

    const fd = toFormData({ user_id: ADMIN_USER.id, is_suspended: 'true' })

    const result = await toggleUserSuspension(null, fd)

    expect(result.error).toMatch(/cannot change your own account status/i)
  })

  it('3: suspends user when admin is authorized', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: ADMIN_USER,
        fromChains: [
          { data: { role: 'PLATFORM_ADMIN' }, error: null },
          { data: null, error: null },
        ],
      }) as any
    )

    const fd = toFormData({ user_id: VALID_USER_ID, is_suspended: 'true' })

    const result = await toggleUserSuspension(null, fd)

    expect(result).toEqual({ success: 'User account suspended.' })
    expect(revalidatePath).toHaveBeenCalledWith('/admin')
  })

  it('4: returns error when DB update fails', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: ADMIN_USER,
        fromChains: [
          { data: { role: 'PLATFORM_ADMIN' }, error: null },
          { data: null, error: { message: 'update failed' } },
        ],
      }) as any
    )

    const fd = toFormData({ user_id: VALID_USER_ID, is_suspended: 'false' })
    const result = await toggleUserSuspension(null, fd)

    expect(result).toEqual({ error: 'Failed to update user account status.' })
  })
})
