import { beforeEach, describe, expect, it, vi } from 'vitest'
import { makeSupabaseMock } from '../helpers/mock-supabase'

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { updateOrganizationLogo } from '@/app/(dashboard)/dashboard/settings/actions'

const USER = { id: 'user-1', email: 'owner@example.com' }

beforeEach(() => {
  vi.clearAllMocks()
})

describe('updateOrganizationLogo()', () => {
  it('1: returns error when unauthenticated', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ user: null }) as any)

    const result = await updateOrganizationLogo(null, new FormData())

    expect(result.error).toMatch(/logged in/i)
  })

  it('2: returns error when file is not image', async () => {
    vi.mocked(createClient).mockResolvedValue(makeSupabaseMock({ user: USER }) as any)

    const fd = new FormData()
    fd.append('logo', new File([new Blob(['abc'])], 'file.txt', { type: 'text/plain' }))

    const result = await updateOrganizationLogo(null, fd)

    expect(result.error).toMatch(/only image files/i)
  })

  it('3: returns permission error when not owner/manager', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: USER,
        fromChains: [{ data: null, error: null }],
      }) as any
    )

    const fd = new FormData()
    fd.append('logo', new File([new Blob(['img'])], 'logo.png', { type: 'image/png' }))

    const result = await updateOrganizationLogo(null, fd)

    expect(result.error).toMatch(/do not have permission/i)
  })

  it('4: updates organization logo and revalidates key paths', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: USER,
        fromChains: [
          {
            data: {
              organization_id: 'org-1',
              organizations: { logo_url: null },
            },
            error: null,
          },
          { data: null, error: null },
        ],
      }) as any
    )

    const fd = new FormData()
    fd.append('logo', new File([new Blob(['img'])], 'logo.png', { type: 'image/png' }))

    const result = await updateOrganizationLogo(null, fd)

    expect(result).toEqual({ success: 'Organization logo updated successfully.' })
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard/settings')
    expect(revalidatePath).toHaveBeenCalledWith('/org/rosters')
    expect(revalidatePath).toHaveBeenCalledWith('/dashboard')
  })
})
