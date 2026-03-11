import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ApplicationRow } from '@/app/(recruiter)/org/(mgmt)/applications/_components/ApplicationsTable'

vi.mock('@/app/(recruiter)/org/(mgmt)/applications/actions', () => ({
  updateApplicationStatus: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
  Toaster: () => null,
}))

// next/link needs to be available in jsdom
vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}))

import ApplicationsTable from '@/app/(recruiter)/org/(mgmt)/applications/_components/ApplicationsTable'
import { updateApplicationStatus } from '@/app/(recruiter)/org/(mgmt)/applications/actions'
import { toast } from 'sonner'

const EMPTY_STATS = { total: 0, pending: 0, approvedToday: 0 }

function makeApp(overrides: Partial<ApplicationRow> = {}): ApplicationRow {
  return {
    id: 'app-1',
    status: 'PENDING',
    created_at: new Date().toISOString(),
    gamertag: 'TestPlayer',
    player_profile_id: 'profile-1',
    tryout_title: 'Valorant Tryout',
    game_name: 'Valorant',
    rank: 'Gold',
    ...overrides,
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ApplicationsTable', () => {
  // ── Test 1: empty applications ────────────────────────────────────────
  it('1: shows empty state when applications array is empty', () => {
    render(<ApplicationsTable applications={[]} stats={EMPTY_STATS} />)

    expect(screen.getByText(/no new applications/i)).toBeInTheDocument()
    expect(screen.queryByRole('row')).not.toBeInTheDocument()
  })

  // ── Test 2: filter = "All" shows all rows ────────────────────────────
  it('2: renders all application rows when filter is "All"', () => {
    const apps = [
      makeApp({ id: 'app-1', gamertag: 'Player1', status: 'PENDING' }),
      makeApp({ id: 'app-2', gamertag: 'Player2', status: 'REVIEWING' }),
      makeApp({ id: 'app-3', gamertag: 'Player3', status: 'ACCEPTED' }),
    ]
    render(<ApplicationsTable applications={apps} stats={{ total: 3, pending: 1, approvedToday: 1 }} />)

    expect(screen.getByText('Player1')).toBeInTheDocument()
    expect(screen.getByText('Player2')).toBeInTheDocument()
    expect(screen.getByText('Player3')).toBeInTheDocument()
  })

  // ── Test 3: filter = "Reviewing" shows only reviewing rows ────────────
  it('3: shows only REVIEWING rows when Reviewing filter is active', async () => {
    const user = userEvent.setup()
    const apps = [
      makeApp({ id: 'app-1', gamertag: 'PlayerA', status: 'PENDING' }),
      makeApp({ id: 'app-2', gamertag: 'PlayerB', status: 'REVIEWING' }),
    ]
    render(<ApplicationsTable applications={apps} stats={EMPTY_STATS} />)

    // Use exact name to distinguish from 'Mark as Reviewing' action button
    await user.click(screen.getByRole('button', { name: 'Reviewing' }))

    expect(screen.queryByText('PlayerA')).not.toBeInTheDocument()
    expect(screen.getByText('PlayerB')).toBeInTheDocument()
  })

  // ── Test 4: filter = "Accepted" shows only accepted rows ──────────────
  it('4: shows only ACCEPTED rows when Accepted filter is active', async () => {
    const user = userEvent.setup()
    const apps = [
      makeApp({ id: 'app-1', gamertag: 'PlayerA', status: 'PENDING' }),
      makeApp({ id: 'app-2', gamertag: 'PlayerB', status: 'ACCEPTED' }),
    ]
    render(<ApplicationsTable applications={apps} stats={EMPTY_STATS} />)

    await user.click(screen.getByRole('button', { name: /accepted/i }))

    expect(screen.queryByText('PlayerA')).not.toBeInTheDocument()
    expect(screen.getByText('PlayerB')).toBeInTheDocument()
  })

  // ── Test 5: ACCEPTED status → shows "Processed", no action buttons ────
  it('5: shows "Processed" text and no action buttons for ACCEPTED status', () => {
    render(
      <ApplicationsTable
        applications={[makeApp({ status: 'ACCEPTED' })]}
        stats={EMPTY_STATS}
      />
    )

    expect(screen.getByText(/processed/i)).toBeInTheDocument()
    expect(screen.queryByTitle(/accept/i)).not.toBeInTheDocument()
    expect(screen.queryByTitle(/reject/i)).not.toBeInTheDocument()
  })

  // ── Test 6: PENDING status → shows action buttons (review/accept/reject)
  it('6: shows action buttons for PENDING status application', () => {
    render(
      <ApplicationsTable
        applications={[makeApp({ status: 'PENDING' })]}
        stats={EMPTY_STATS}
      />
    )

    expect(screen.getByTitle(/mark as reviewing/i)).toBeInTheDocument()
    expect(screen.getByTitle(/accept/i)).toBeInTheDocument()
    expect(screen.getByTitle(/reject/i)).toBeInTheDocument()
  })

  // ── Test 7: click Accept → updateApplicationStatus called with ACCEPTED ─
  it('7: calls updateApplicationStatus with ACCEPTED when Accept is clicked', async () => {
    vi.mocked(updateApplicationStatus).mockResolvedValue({
      success: 'Application marked as accepted.',
    })
    const user = userEvent.setup()

    render(
      <ApplicationsTable
        applications={[makeApp({ id: 'app-target', status: 'PENDING' })]}
        stats={EMPTY_STATS}
      />
    )

    await user.click(screen.getByTitle(/accept/i))

    await waitFor(() => {
      expect(updateApplicationStatus).toHaveBeenCalled()
    })

    // Verify the FormData contains the right values
    const [, formData] = vi.mocked(updateApplicationStatus).mock.calls[0] as [any, FormData]
    expect(formData.get('status')).toBe('ACCEPTED')
    expect(formData.get('application_id')).toBe('app-target')
  })

  // ── Test 8: stats bar shows correct count values ───────────────────────
  it('8: stats bar displays total, pending, and approvedToday counts', () => {
    const stats = { total: 42, pending: 10, approvedToday: 5 }
    render(<ApplicationsTable applications={[]} stats={stats} />)

    expect(screen.getByText('42')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
  })
})
