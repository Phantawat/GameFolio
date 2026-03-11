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
import { createTryout } from '@/app/(recruiter)/org/(mgmt)/tryouts/new/actions'

const MOCK_USER = { id: 'user-1', email: 'user@example.com' }
// Proper UUID v4: 3rd group starts with '4', 4th group starts with 8/9/a/b
const VALID_ORG_ID = '00000001-0000-4000-8000-000000000001'
const VALID_GAME_ID = '00000002-0000-4000-8000-000000000002'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createTryout()', () => {
  it('1: returns permission error when user is not OWNER or MANAGER', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [{ data: null, error: null }], // no membership
      }) as any
    )
    const fd = toFormData({
      organization_id: VALID_ORG_ID,
      game_id: VALID_GAME_ID,
      title: 'Amazing Tryout',
    })

    const result = await createTryout(null, fd)

    expect(result.error).toMatch(/permission to post tryouts/i)
  })

  it('2: returns fieldErrors when title is < 3 chars', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: MOCK_USER }) as any
    )
    const fd = toFormData({
      organization_id: VALID_ORG_ID,
      game_id: VALID_GAME_ID,
      title: 'Hi',
    })

    const result = await createTryout(null, fd)

    expect(result.fieldErrors?.title).toBeDefined()
  })

  it('3: returns success draft when is_active is "false"', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { role: 'OWNER' }, error: null }, // membership
          { data: null, error: null },               // tryout insert success
        ],
      }) as any
    )
    const fd = toFormData({
      organization_id: VALID_ORG_ID,
      game_id: VALID_GAME_ID,
      title: 'Draft Tryout',
      is_active: 'false',
    })

    const result = await createTryout(null, fd)

    expect(result).toEqual({ success: 'Tryout saved as draft.' })
  })

  it('4: redirects to /org/applications when is_active is "true"', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { role: 'OWNER' }, error: null }, // membership
          { data: null, error: null },               // tryout insert success
        ],
      }) as any
    )
    const fd = toFormData({
      organization_id: VALID_ORG_ID,
      game_id: VALID_GAME_ID,
      title: 'Live Tryout',
      is_active: 'true',
    })

    await expect(createTryout(null, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/org/applications')
  })

  it('5: stores role_needed_id as null when it is an empty string', async () => {
    const mockSupabase = makeSupabaseMock({ user: MOCK_USER })
    let insertedData: any = null

    // membership chain
    const memberChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { role: 'OWNER' }, error: null }),
    }
    // tryouts chain — capture the inserted payload
    const tryoutsChain = {
      insert: vi.fn().mockImplementation((data: any) => {
        insertedData = data
        return Promise.resolve({ data: null, error: null })
      }),
    }
    mockSupabase.from
      .mockReturnValueOnce(memberChain as any)
      .mockReturnValueOnce(tryoutsChain as any)

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    const fd = toFormData({
      organization_id: VALID_ORG_ID,
      game_id: VALID_GAME_ID,
      title: 'Tryout No Role',
      role_needed_id: '',
      is_active: 'false',
    })

    await createTryout(null, fd)

    expect(insertedData?.role_needed_id).toBeNull()
  })

  it('6: returns error when DB insert fails', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: { role: 'MANAGER' }, error: null },
          { data: null, error: { message: 'insert failed' } },
        ],
      }) as any
    )
    const fd = toFormData({
      organization_id: VALID_ORG_ID,
      game_id: VALID_GAME_ID,
      title: 'Broken Tryout',
    })

    const result = await createTryout(null, fd)

    expect(result).toEqual({
      error: 'Failed to create tryout. Please try again.',
    })
  })
})
