import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

vi.mock('@/app/(recruiter)/org/(mgmt)/rosters/actions', () => ({
  createRoster: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
  Toaster: () => null,
}))

import NewRosterModal from '@/app/(recruiter)/org/(mgmt)/rosters/_components/NewRosterModal'
import { createRoster } from '@/app/(recruiter)/org/(mgmt)/rosters/actions'
import { toast } from 'sonner'

const GAMES = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Valorant' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'League of Legends' },
]
const ORG_ID = 'org-aabbccdd'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('NewRosterModal', () => {
  // ── Test 1: initial render — modal is closed ──────────────────────────
  it('1: dialog content is not visible on initial render', () => {
    render(<NewRosterModal orgId={ORG_ID} games={GAMES} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  // ── Test 2: click trigger opens the dialog ────────────────────────────
  it('2: opens the dialog when the trigger button is clicked', async () => {
    const user = userEvent.setup()
    render(<NewRosterModal orgId={ORG_ID} games={GAMES} />)

    await user.click(screen.getByRole('button', { name: /new roster/i }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  // ── Test 3: click Cancel closes the dialog ────────────────────────────
  it('3: closes the dialog when Cancel is clicked', async () => {
    const user = userEvent.setup()
    render(<NewRosterModal orgId={ORG_ID} games={GAMES} />)

    await user.click(screen.getByRole('button', { name: /new roster/i }))
    await screen.findByRole('dialog')

    await user.click(screen.getByRole('button', { name: /cancel/i }))

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  // ── Test 4: submit valid data → action called, toast shown, dialog closes
  it('4: calls createRoster, shows success toast and closes dialog on valid submit', async () => {
    vi.mocked(createRoster).mockResolvedValue({ success: 'Roster created successfully!' })
    const user = userEvent.setup()
    render(<NewRosterModal orgId={ORG_ID} games={GAMES} />)

    // Open dialog
    await user.click(screen.getByRole('button', { name: /new roster/i }))
    await screen.findByRole('dialog')

    // Select a game and enter roster name
    await user.selectOptions(screen.getByRole('combobox'), GAMES[0].id)
    await user.type(screen.getByLabelText(/roster name/i), 'Main Roster')

    // Submit
    await user.click(screen.getByRole('button', { name: /create roster/i }))

    await waitFor(() => {
      expect(createRoster).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Roster created successfully!')
    })

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  // ── Test 5: variant="create-now" → button text is "Create Now" ────────
  it('5: renders "Create Now" button when variant is "create-now"', () => {
    render(<NewRosterModal orgId={ORG_ID} games={GAMES} variant="create-now" />)

    expect(screen.getByRole('button', { name: /create now/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /\+ new roster/i })).not.toBeInTheDocument()
  })
})
