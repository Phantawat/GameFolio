import { beforeEach, describe, expect, it, vi } from 'vitest'
import { makeSupabaseMock, toFormData } from '../helpers/mock-supabase'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  addRosterMember,
  removeRosterMember,
} from '@/app/(recruiter)/org/(mgmt)/rosters/actions'

const MOCK_USER = { id: 'user-1', email: 'user@example.com' }
const ROSTER_ID = '00000020-0000-4000-8000-000000000020'
const MEMBER_ID = '00000021-0000-4000-8000-000000000021'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('addRosterMember()', () => {
  it('returns roster-not-found error when roster does not exist', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [{ data: null, error: null }],
      }) as any
    )

    const result = await addRosterMember(
      null,
      toFormData({ roster_id: ROSTER_ID, gamertag: 'PlayerOne' })
    )

    expect(result).toEqual({ error: 'Roster not found.' })
  })

  it('normalizes @prefix and returns suggestions when player not found', async () => {
    const mockSupabase = makeSupabaseMock({ user: MOCK_USER, fromChains: [] })
    const ilikeSpy = vi.fn()

    const rosterChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { id: ROSTER_ID, organization_id: 'org-1' }, error: null }),
    }

    const membershipChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'OWNER' }, error: null }),
    }

    const missingProfileChain = {
      select: vi.fn().mockReturnThis(),
      ilike: ilikeSpy.mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    }

    const suggestionChain = {
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [{ gamertag: 'PlayerOne' }, { gamertag: 'PlayerOnyx' }],
        error: null,
      }),
    }

    mockSupabase.from
      .mockReturnValueOnce(rosterChain as any)
      .mockReturnValueOnce(membershipChain as any)
      .mockReturnValueOnce(missingProfileChain as any)
      .mockReturnValueOnce(suggestionChain as any)

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const result = await addRosterMember(
      null,
      toFormData({ roster_id: ROSTER_ID, gamertag: '@Player' })
    )

    expect(ilikeSpy).toHaveBeenCalledWith('gamertag', 'Player')
    expect(result.error).toContain('Did you mean: PlayerOne, PlayerOnyx?')
  })

  it('adds member successfully and revalidates roster paths', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: ROSTER_ID, organization_id: 'org-1' }, error: null },
          { data: { role: 'MANAGER' }, error: null },
          { data: { id: 'profile-1', user_id: 'player-u1', gamertag: 'Ace' }, error: null },
          { data: null, error: null },
        ],
      }) as any
    )

    const result = await addRosterMember(
      null,
      toFormData({ roster_id: ROSTER_ID, gamertag: 'Ace' })
    )

    expect(result).toEqual({ success: 'Ace added to roster!' })
    expect(revalidatePath).toHaveBeenCalledWith(`/org/rosters/${ROSTER_ID}`)
    expect(revalidatePath).toHaveBeenCalledWith('/org/rosters')
  })
})

describe('removeRosterMember()', () => {
  it('returns permission denied when user is not owner/manager', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: ROSTER_ID, organization_id: 'org-1' }, error: null },
          { data: null, error: null },
        ],
      }) as any
    )

    const result = await removeRosterMember(
      null,
      toFormData({ roster_id: ROSTER_ID, roster_member_id: MEMBER_ID })
    )

    expect(result).toEqual({ error: 'Permission denied.' })
  })

  it('removes member successfully', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { id: ROSTER_ID, organization_id: 'org-1' }, error: null },
          { data: { role: 'OWNER' }, error: null },
          { data: null, error: null },
        ],
      }) as any
    )

    const result = await removeRosterMember(
      null,
      toFormData({ roster_id: ROSTER_ID, roster_member_id: MEMBER_ID })
    )

    expect(result).toEqual({ success: 'Member removed from roster.' })
    expect(revalidatePath).toHaveBeenCalledWith(`/org/rosters/${ROSTER_ID}`)
    expect(revalidatePath).toHaveBeenCalledWith('/org/rosters')
  })
})
