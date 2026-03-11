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
import { upsertGameStats } from '@/app/(dashboard)/dashboard/player/actions'

const MOCK_USER = { id: 'user-1', email: 'user@example.com' }
const VALID_GAME_ID = '550e8400-e29b-41d4-a716-446655440000'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('upsertGameStats()', () => {
  it('1: returns fieldErrors when game_id is not a UUID', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: MOCK_USER }) as any
    )
    const fd = toFormData({ game_id: 'not-a-uuid', rank: 'Gold' })

    const result = await upsertGameStats(null, fd)

    expect(result.fieldErrors?.game_id).toBeDefined()
  })

  it('2: returns fieldErrors when rank is empty', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: MOCK_USER }) as any
    )
    const fd = toFormData({ game_id: VALID_GAME_ID, rank: '' })

    const result = await upsertGameStats(null, fd)

    expect(result.fieldErrors?.rank).toBeDefined()
  })

  it('3: returns fieldErrors when win_rate > 100', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: MOCK_USER }) as any
    )
    const fd = toFormData({ game_id: VALID_GAME_ID, rank: 'Gold', win_rate: '150' })

    const result = await upsertGameStats(null, fd)

    expect(result.fieldErrors?.win_rate).toBeDefined()
  })

  it('4: returns error when authenticated but player_profile not found', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [{ data: null, error: null }], // profile query returns null
      }) as any
    )
    const fd = toFormData({ game_id: VALID_GAME_ID, rank: 'Gold' })

    const result = await upsertGameStats(null, fd)

    expect(result.error).toMatch(/player profile not found/i)
  })

  it('5: revalidates path and redirects on DB success', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: 'profile-1' }, error: null }, // player_profiles
          { data: null, error: null },                  // player_game_stats upsert
        ],
      }) as any
    )
    const fd = toFormData({ game_id: VALID_GAME_ID, rank: 'Diamond', win_rate: '55' })

    await expect(upsertGameStats(null, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/player')
    expect(redirect).toHaveBeenCalledWith('/dashboard/player')
  })

  it('6: returns error when DB upsert fails', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: 'profile-1' }, error: null },
          { data: null, error: { message: 'DB error occurred' } },
        ],
      }) as any
    )
    const fd = toFormData({ game_id: VALID_GAME_ID, rank: 'Silver' })

    const result = await upsertGameStats(null, fd)

    expect(result).toEqual({ error: 'DB error occurred' })
  })
})
