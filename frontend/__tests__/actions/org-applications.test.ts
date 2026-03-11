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
import { updateApplicationStatus } from '@/app/(recruiter)/org/(mgmt)/applications/actions'

const MOCK_USER = { id: 'user-1', email: 'user@example.com' }
// Proper UUID v4: 3rd group starts with '4', 4th group starts with 8/9/a/b
const VALID_APP_ID = '00000003-0000-4000-8000-000000000003'
const ORG_ID = '00000004-0000-4000-8000-000000000004'

// Shared: a known application object with nested tryout
const APP_DATA = {
  id: VALID_APP_ID,
  tryouts: { organization_id: ORG_ID },
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('updateApplicationStatus()', () => {
  it('1: returns fieldErrors when application_id is not a UUID', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: MOCK_USER }) as any
    )
    const fd = toFormData({ application_id: 'bad-id', status: 'ACCEPTED' })

    const result = await updateApplicationStatus(null, fd)

    expect(result.fieldErrors?.application_id).toBeDefined()
  })

  it('2: returns fieldErrors when status is not a valid enum value', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: MOCK_USER }) as any
    )
    const fd = toFormData({ application_id: VALID_APP_ID, status: 'BANANA' })

    const result = await updateApplicationStatus(null, fd)

    expect(result.fieldErrors?.status).toBeDefined()
  })

  it('3: returns not-found error when application does not exist in DB', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [{ data: null, error: null }], // no app found
      }) as any
    )
    const fd = toFormData({ application_id: VALID_APP_ID, status: 'REVIEWING' })

    const result = await updateApplicationStatus(null, fd)

    expect(result).toEqual({ error: 'Application not found.' })
  })

  it('4: returns permission denied when user is not OWNER/MANAGER of linked org', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: APP_DATA, error: null },   // app found
          { data: null, error: null },        // no membership
        ],
      }) as any
    )
    const fd = toFormData({ application_id: VALID_APP_ID, status: 'ACCEPTED' })

    const result = await updateApplicationStatus(null, fd)

    expect(result).toEqual({ error: 'Permission denied.' })
  })

  it.each([
    ['REVIEWING', 'Application marked as reviewing.'],
    ['ACCEPTED', 'Application marked as accepted.'],
    ['REJECTED', 'Application marked as rejected.'],
  ])('5-7: status=%s → returns success message', async (status, message) => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: APP_DATA, error: null },        // app found
          { data: { role: 'OWNER' }, error: null }, // membership
          { data: null, error: null },               // update succeeds
        ],
      }) as any
    )
    const fd = toFormData({ application_id: VALID_APP_ID, status })

    const result = await updateApplicationStatus(null, fd)

    expect(result).toEqual({ success: message })
    expect(revalidatePath).toHaveBeenCalledWith('/org/applications')
  })

  it('8: returns error when DB update fails', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: MOCK_USER,
        fromChains: [
          { data: APP_DATA, error: null },
          { data: { role: 'OWNER' }, error: null },
          { data: null, error: { message: 'update failed' } }, // update fails
        ],
      }) as any
    )
    const fd = toFormData({ application_id: VALID_APP_ID, status: 'REJECTED' })

    const result = await updateApplicationStatus(null, fd)

    expect(result).toEqual({ error: 'Failed to update application status.' })
  })
})
