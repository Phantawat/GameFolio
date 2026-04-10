import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AdminTryoutsTable, type TryoutRow } from '@/app/(admin)/admin/_components/AdminTryoutsTable'

vi.mock('@/app/(admin)/admin/actions', () => ({
  toggleTryoutActive: vi.fn(),
  deleteTryoutModeration: vi.fn(),
  restoreTryoutModeration: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
  Toaster: () => null,
}))

beforeEach(() => {
  vi.clearAllMocks()
})

function makeTryout(overrides: Partial<TryoutRow> = {}): TryoutRow {
  return {
    id: 'tryout-1',
    title: 'Valorant Open Tryout',
    isActive: true,
    deletedAt: null,
    orgName: 'Team Phoenix',
    gameName: 'Valorant',
    createdAt: '2024-01-15T00:00:00Z',
    ...overrides,
  }
}

describe('AdminTryoutsTable', () => {
  it('1: shows Active badge and Deactivate button for active tryout', () => {
    render(<AdminTryoutsTable tryouts={[makeTryout({ isActive: true })]} />)

    expect(screen.getByText('Active')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /deactivate/i })).toBeInTheDocument()
  })

  it('2: shows Inactive badge and Activate button for inactive tryout', () => {
    render(<AdminTryoutsTable tryouts={[makeTryout({ isActive: false })]} />)

    expect(screen.getByText('Inactive')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /activate/i })).toBeInTheDocument()
  })

  it('3: shows Deleted badge and Restore button for deleted tryout', () => {
    render(
      <AdminTryoutsTable
        tryouts={[makeTryout({ isActive: false, deletedAt: '2026-01-01T00:00:00Z' })]}
      />
    )

    expect(screen.getByText('Deleted')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /restore/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /activate/i })).not.toBeInTheDocument()
  })

  it('4: shows empty state when tryouts array is empty', () => {
    render(<AdminTryoutsTable tryouts={[]} />)

    expect(screen.getByText(/no tryouts yet/i)).toBeInTheDocument()
  })

  it('5: filters tryouts by search text', async () => {
    const user = userEvent.setup()
    const tryouts = [
      makeTryout({ id: 't1', title: 'Valorant Open Tryout' }),
      makeTryout({ id: 't2', title: 'LoL Championship' }),
    ]

    render(<AdminTryoutsTable tryouts={tryouts} />)

    const searchInput = screen.getByPlaceholderText(/search tryouts/i)
    await user.type(searchInput, 'LoL')

    expect(screen.getByText('LoL Championship')).toBeInTheDocument()
    expect(screen.queryByText('Valorant Open Tryout')).not.toBeInTheDocument()
  })

  it('6: renders tryout details correctly', () => {
    render(
      <AdminTryoutsTable
        tryouts={[
          makeTryout({
            title: 'Apex Legends Tryout',
            orgName: 'Cloud9',
            gameName: 'Apex Legends',
          }),
        ]}
      />
    )

    expect(screen.getByText('Apex Legends Tryout')).toBeInTheDocument()
    expect(screen.getByText('Cloud9')).toBeInTheDocument()
    expect(screen.getByText('Apex Legends')).toBeInTheDocument()
  })
})
