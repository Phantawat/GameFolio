import { beforeEach, describe, expect, it, vi } from 'vitest'
import { makeSupabaseMock, toFormData } from '../helpers/mock-supabase'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import {
  bulkManageTryouts,
  deleteTryout,
  toggleTryoutStatus,
} from '@/app/(recruiter)/org/(mgmt)/tryouts/actions'

const MOCK_USER = { id: 'user-1', email: 'user@example.com' }
const TRYOUT_ID = '00000010-0000-4000-8000-000000000010'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('toggleTryoutStatus()', () => {
  it('returns permission error when recruiter cannot manage the tryout org', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: [{ id: TRYOUT_ID, organization_id: 'org-1' }], error: null },
          { data: [], error: null },
        ],
      }) as any
    )

    const result = await toggleTryoutStatus(null, toFormData({ tryout_id: TRYOUT_ID, is_active: 'false' }))

    expect(result).toEqual({ error: 'You do not have permission to manage one or more tryouts.' })
  })

  it('returns success and revalidates paths when toggle succeeds', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: [{ id: TRYOUT_ID, organization_id: 'org-1' }], error: null },
          { data: [{ organization_id: 'org-1' }], error: null },
          { data: null, error: null },
        ],
      }) as any
    )

    const result = await toggleTryoutStatus(null, toFormData({ tryout_id: TRYOUT_ID, is_active: 'false' }))

    expect(result).toEqual({ success: 'Tryout paused.' })
    expect(revalidatePath).toHaveBeenCalledWith('/org/tryouts')
    expect(revalidatePath).toHaveBeenCalledWith('/org/applications')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/tryouts')
  })
})

describe('deleteTryout()', () => {
  it('returns an error when related application delete fails', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: [{ id: TRYOUT_ID, organization_id: 'org-1' }], error: null },
          { data: [{ organization_id: 'org-1' }], error: null },
          { data: null, error: { message: 'failed' } },
        ],
      }) as any
    )

    const result = await deleteTryout(null, toFormData({ tryout_id: TRYOUT_ID }))

    expect(result).toEqual({ error: 'Failed to remove related applications.' })
  })
})

describe('bulkManageTryouts()', () => {
  it('returns invalid-selection error when tryout_ids is not valid JSON UUID array', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ user: MOCK_USER }) as any)

    const result = await bulkManageTryouts(
      null,
      toFormData({ action: 'pause', tryout_ids: 'not-json' })
    )

    expect(result).toEqual({ error: 'Invalid tryout selection.' })
  })

  it('returns success for pause action with selected tryouts', async () => {
    const ids = [TRYOUT_ID, '00000011-0000-4000-8000-000000000011']

    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          {
            data: [
              { id: ids[0], organization_id: 'org-1' },
              { id: ids[1], organization_id: 'org-1' },
            ],
            error: null,
          },
          { data: [{ organization_id: 'org-1' }], error: null },
          { data: null, error: null },
        ],
      }) as any
    )

    const result = await bulkManageTryouts(
      null,
      toFormData({ action: 'pause', tryout_ids: JSON.stringify(ids) })
    )

    expect(result).toEqual({ success: '2 tryouts paused.' })
  })
})
