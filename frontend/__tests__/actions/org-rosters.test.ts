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
import { createRoster } from '@/app/(recruiter)/org/(mgmt)/rosters/actions'

const MOCK_USER = { id: 'user-1', email: 'user@example.com' }
// Proper UUID v4: 3rd group starts with '4', 4th group starts with 8/9/a/b
const VALID_ORG_ID = '00000001-0000-4000-8000-000000000001'
const VALID_GAME_ID = '00000002-0000-4000-8000-000000000002'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createRoster()', () => {
  it('1: returns permission error when user is not OWNER or MANAGER', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [{ data: null, error: null }], // membership query returns null
      }) as any
    )
    const fd = toFormData({
      organization_id: VALID_ORG_ID,
      game_id: VALID_GAME_ID,
      name: 'Pro Roster',
    })

    const result = await createRoster(null, fd)

    expect(result).toEqual({
      error: 'You do not have permission to manage this organization.',
    })
  })

  it('2: returns fieldErrors when game_id is not a UUID', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: MOCK_USER }) as any
    )
    const fd = toFormData({
      organization_id: VALID_ORG_ID,
      game_id: 'not-a-uuid',
      name: 'Roster',
    })

    const result = await createRoster(null, fd)

    expect(result.fieldErrors?.game_id).toBeDefined()
  })

  it('3: returns fieldErrors when roster name is < 2 chars', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: MOCK_USER }) as any
    )
    const fd = toFormData({
      organization_id: VALID_ORG_ID,
      game_id: VALID_GAME_ID,
      name: 'A',
    })

    const result = await createRoster(null, fd)

    expect(result.fieldErrors?.name).toBeDefined()
  })

  it('4: returns duplicate error when roster name exists for same game (23505)', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { role: 'OWNER' }, error: null }, // membership
          { data: null, error: { code: '23505' } },  // roster insert
        ],
      }) as any
    )
    const fd = toFormData({
      organization_id: VALID_ORG_ID,
      game_id: VALID_GAME_ID,
      name: 'Duplicate Roster',
    })

    const result = await createRoster(null, fd)

    expect(result).toEqual({
      error: 'A roster with this name already exists for this game.',
    })
  })

  it('5: returns success and revalidates path for OWNER with valid data', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { role: 'OWNER' }, error: null }, // membership
          { data: null, error: null },               // roster insert success
        ],
      }) as any
    )
    const fd = toFormData({
      organization_id: VALID_ORG_ID,
      game_id: VALID_GAME_ID,
      name: 'Main Roster',
    })

    const result = await createRoster(null, fd)

    expect(result).toEqual({ success: 'Roster created successfully!' })
    expect(revalidatePath).toHaveBeenCalledWith('/org/rosters')
  })
})
