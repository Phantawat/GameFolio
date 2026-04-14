import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { makeSupabaseMock } from '../../helpers/mock-supabase'

const redirectMock = vi.fn((url: string) => {
  throw Object.assign(new Error('NEXT_REDIRECT'), { url })
})

const cookiesMock = vi.fn()

vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }))
vi.mock('next/navigation', () => ({ redirect: (url: string) => redirectMock(url) }))
vi.mock('next/headers', () => ({ cookies: () => cookiesMock() }))

vi.mock('@/components/layout/PlayerNavbar', () => ({
  default: (props: any) => <div data-testid="player-navbar">{JSON.stringify(props)}</div>,
}))

vi.mock('@/components/layout/OrgNavbar', () => ({
  default: (props: any) => <div data-testid="org-navbar">{JSON.stringify(props)}</div>,
}))

vi.mock('@/app/(recruiter)/org/(mgmt)/_components/OrgMgmtShell', () => ({
  default: ({ children, ...props }: any) => (
    <div>
      <div data-testid="org-mgmt-shell">{JSON.stringify(props)}</div>
      {children}
    </div>
  ),
}))

import { createClient } from '@/lib/supabase/server'
import DashboardLayout from '@/app/(dashboard)/dashboard/layout'
import OrgMgmtLayout from '@/app/(recruiter)/org/(mgmt)/layout'

const USER = { id: 'u-1', email: 'user@example.com' }

beforeEach(() => {
  vi.clearAllMocks()
  cookiesMock.mockReturnValue({
    get: vi.fn().mockReturnValue(undefined),
  })
})

describe('DashboardLayout role/nav fallback', () => {
  it('prefers player navbar when gf_nav_mode=player and player mode is available', async () => {
    cookiesMock.mockReturnValue({
      get: vi.fn().mockReturnValue({ value: 'player' }),
    })

    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: USER,
        fromChains: [
          { data: [{ role: 'ORG_MEMBER' }, { role: 'PLAYER' }], error: null },
          { data: { gamertag: 'Ace', avatar_url: null }, error: null },
        ],
      }) as any
    )

    const element = await DashboardLayout({ children: <div>Child</div> })
    render(element)

    expect(screen.getByTestId('player-navbar')).toBeInTheDocument()
    expect(screen.queryByTestId('org-navbar')).not.toBeInTheDocument()
  })

  it('falls back to player navbar when org role exists but membership record is missing', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: USER,
        fromChains: [
          { data: [{ role: 'ORG_MEMBER' }], error: null },
          { data: null, error: null },
          { data: null, error: null },
        ],
      }) as any
    )

    const element = await DashboardLayout({ children: <div>Child</div> })
    render(element)

    const navbar = screen.getByTestId('player-navbar')
    expect(navbar).toBeInTheDocument()
    expect(navbar.textContent).toContain('"canSwitchToOrg":true')
  })
})

describe('OrgMgmtLayout role/nav fallback', () => {
  it('redirects to /dashboard/player when preferred mode is player and profile exists', async () => {
    cookiesMock.mockReturnValue({
      get: vi.fn().mockReturnValue({ value: 'player' }),
    })

    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: USER,
        fromChains: [{ data: { id: 'profile-1' }, error: null }],
      }) as any
    )

    await expect(OrgMgmtLayout({ children: <div>Child</div> })).rejects.toThrow('NEXT_REDIRECT')
    expect(redirectMock).toHaveBeenCalledWith('/dashboard/player')
  })

  it('redirects to /org/create when user has no organization membership', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: USER,
        fromChains: [
          { data: null, error: null },
          { data: null, error: null },
        ],
      }) as any
    )

    await expect(OrgMgmtLayout({ children: <div>Child</div> })).rejects.toThrow('NEXT_REDIRECT')
    expect(redirectMock).toHaveBeenCalledWith('/org/create')
  })

  it('renders shell for MEMBER role and passes pending application count', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({
        user: USER,
        fromChains: [
          { data: { id: 'profile-1' }, error: null },
          {
            data: {
              organization_id: 'org-1',
              role: 'MEMBER',
              organizations: { name: 'Team Alpha', logo_url: null },
            },
            error: null,
          },
          { data: [{ id: 't-1' }], error: null },
          { data: null, error: null, count: 3 },
        ],
      }) as any
    )

    const element = await OrgMgmtLayout({ children: <div>Org Child</div> })
    render(element)

    const shell = screen.getByTestId('org-mgmt-shell')
    expect(shell).toBeInTheDocument()
    expect(shell.textContent).toContain('"memberRole":"MEMBER"')
    expect(shell.textContent).toContain('"applicationCount":3')
    expect(shell.textContent).toContain('"canSwitchToPlayer":true')
  })
})
