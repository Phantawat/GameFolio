import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminOrgsTable, type OrgRow } from '@/app/(admin)/admin/_components/AdminOrgsTable'

beforeEach(() => {
  vi.clearAllMocks()
})

function makeOrg(overrides: Partial<OrgRow> = {}): OrgRow {
  return {
    id: 'org-1',
    name: 'Team Phoenix',
    region: 'NA',
    memberCount: 5,
    ownerUserId: 'user-1',
    createdAt: '2024-01-15T00:00:00Z',
    ...overrides,
  }
}

describe('AdminOrgsTable', () => {
  it('1: shows empty state when organizations array is empty', () => {
    render(<AdminOrgsTable organizations={[]} />)

    expect(screen.getByText(/no organizations yet/i)).toBeInTheDocument()
  })

  it('2: renders org rows with name, region, member count', () => {
    const orgs = [
      makeOrg({ id: 'org-1', name: 'Team Phoenix', region: 'NA', memberCount: 5 }),
      makeOrg({ id: 'org-2', name: 'Cloud9', region: 'EU', memberCount: 12 }),
    ]

    render(<AdminOrgsTable organizations={orgs} />)

    expect(screen.getByText('Team Phoenix')).toBeInTheDocument()
    expect(screen.getByText('Cloud9')).toBeInTheDocument()
    expect(screen.getByText('NA')).toBeInTheDocument()
    expect(screen.getByText('EU')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('3: filters rows by org name when searching', async () => {
    const user = userEvent.setup()
    const orgs = [
      makeOrg({ id: 'org-1', name: 'Team Phoenix' }),
      makeOrg({ id: 'org-2', name: 'Cloud9' }),
    ]

    render(<AdminOrgsTable organizations={orgs} />)

    const searchInput = screen.getByPlaceholderText(/search organizations/i)
    await user.type(searchInput, 'Phoenix')

    expect(screen.getByText('Team Phoenix')).toBeInTheDocument()
    expect(screen.queryByText('Cloud9')).not.toBeInTheDocument()
  })
})
