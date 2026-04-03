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
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createOrganization } from '@/app/(recruiter)/org/create/actions'

const MOCK_USER = { id: 'user-1', email: 'user@example.com' }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createOrganization()', () => {
  it('1: returns error for unauthenticated call', async () => {
    const mockSupabase = makeSupabaseMock({ user: null })
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    const fd = toFormData({ name: 'My Org' })

    const result = await createOrganization(null, fd)

    expect(result).toEqual({
      error: 'You must be logged in to perform this action.',
    })
  })

  it('2: returns error when name is empty/1 char', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ user: MOCK_USER }) as any)

    const fd1 = toFormData({ name: '' })
    expect(await createOrganization(null, fd1)).toMatchObject({
      error: expect.stringMatching(/at least 2 characters/i),
    })

    const fd2 = toFormData({ name: 'a' })
    expect(await createOrganization(null, fd2)).toMatchObject({
      error: expect.stringMatching(/at least 2 characters/i),
    })
  })

  it('3: returns error when org name is duplicate (23505)', async () => {
    const mockSupabase = makeSupabaseMock({ user: MOCK_USER })
    // from('organizations').insert() → 23505
    mockSupabase.from.mockReturnValueOnce(makeChain({ data: null, error: { code: '23505' } }))
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    const fd = toFormData({ name: 'Existing Org' })

    const result = await createOrganization(null, fd)

    expect(result).toEqual({
      error: 'An organization with this name already exists.',
    })
  })

  it('4: returns membership error when org creates but member insert fails', async () => {
    const mockSupabase = makeSupabaseMock({ user: MOCK_USER })
    // org insert succeeds
    mockSupabase.from.mockReturnValueOnce(
      makeChain({ data: { id: 'org-1' }, error: null })
    )
    // member insert fails
    mockSupabase.from.mockReturnValueOnce(
      makeChain({ data: null, error: { message: 'member insert error' } })
    )
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    const fd = toFormData({ name: 'New Org' })

    const result = await createOrganization(null, fd)

    expect(result.error).toMatch(/Organization created but failed to set up membership/i)
  })

  it('5: creates org + membership + ORG_ADMIN role and redirects on full success', async () => {
    const mockSupabase = makeSupabaseMock({ user: MOCK_USER })
    // org insert
    mockSupabase.from.mockReturnValueOnce(
      makeChain({ data: { id: 'org-1' }, error: null })
    )
    // member insert
    mockSupabase.from.mockReturnValueOnce(makeChain({ data: null, error: null }))
    // user_roles upsert
    mockSupabase.from.mockReturnValueOnce(makeChain({ data: null, error: null }))
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    const fd = toFormData({ name: 'Gaming Org' })

    await expect(createOrganization(null, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/org/rosters')
  })

  it('6: org is created with null logo_url when storage upload fails', async () => {
    const mockSupabase = makeSupabaseMock({ user: MOCK_USER })
    // override storage to fail upload
    mockSupabase.storage.from = vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ error: { message: 'upload failed' } }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: '' } }),
    })
    // org insert with logo_url: null → success
    mockSupabase.from.mockReturnValueOnce(
      makeChain({ data: { id: 'org-2' }, error: null })
    )
    mockSupabase.from.mockReturnValueOnce(makeChain({ data: null, error: null })) // member
    mockSupabase.from.mockReturnValueOnce(makeChain({ data: null, error: null })) // user_roles
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    // Provide a logo file
    const fd = new FormData()
    fd.append('name', 'Logo Org')
    const blob = new Blob(['content'], { type: 'image/png' })
    fd.append('logo', new File([blob], 'logo.png', { type: 'image/png' }))

    await expect(createOrganization(null, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/org/rosters')
  })

  it('7: still redirects when ORG_ADMIN role upsert fails', async () => {
    const mockSupabase = makeSupabaseMock({ user: MOCK_USER })
    // org insert succeeds
    mockSupabase.from.mockReturnValueOnce(
      makeChain({ data: { id: 'org-3' }, error: null })
    )
    // member insert succeeds
    mockSupabase.from.mockReturnValueOnce(makeChain({ data: null, error: null }))
    // role upsert fails
    mockSupabase.from.mockReturnValueOnce(
      makeChain({ data: null, error: { message: 'rls denied' } })
    )
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const fd = toFormData({ name: 'No Role Sync Org' })

    await expect(createOrganization(null, fd)).rejects.toThrow('NEXT_REDIRECT')
    expect(redirect).toHaveBeenCalledWith('/org/rosters')
  })
})
