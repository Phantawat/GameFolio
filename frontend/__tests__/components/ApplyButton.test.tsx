import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock the server action
vi.mock('@/app/(dashboard)/dashboard/tryouts/actions', () => ({
  applyToTryout: vi.fn(),
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
  Toaster: () => null,
}))

import { ApplyButton } from '@/app/(dashboard)/dashboard/tryouts/_components/ApplyButton'
import { applyToTryout } from '@/app/(dashboard)/dashboard/tryouts/actions'
import { toast } from 'sonner'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('ApplyButton', () => {
  // ── Test 1: alreadyApplied = true ─────────────────────────────────────
  it('1: renders a disabled "Applied" button when alreadyApplied is true', () => {
    render(<ApplyButton tryoutId="uuid-1" alreadyApplied={true} />)

    const btn = screen.getByRole('button', { name: /applied/i })
    expect(btn).toBeDisabled()
  })

  // ── Test 2: alreadyApplied = false ────────────────────────────────────
  it('2: renders an "Apply Now" button when alreadyApplied is false', () => {
    render(<ApplyButton tryoutId="uuid-1" alreadyApplied={false} />)

    expect(screen.getByRole('button', { name: /apply now/i })).toBeInTheDocument()
  })

  // ── Test 3: hidden input + form submits ───────────────────────────────
  it('3: has hidden tryout_id input and calls action when submitted', async () => {
    vi.mocked(applyToTryout).mockResolvedValue({ success: 'done' })
    const user = userEvent.setup()

    render(<ApplyButton tryoutId="tryout-abc" alreadyApplied={false} />)

    // hidden input should be in the form
    const hiddenInput = document.querySelector('input[name="tryout_id"]')
    expect(hiddenInput).toBeInTheDocument()
    expect(hiddenInput).toHaveAttribute('type', 'hidden')
    expect(hiddenInput).toHaveValue('tryout-abc')

    await user.click(screen.getByRole('button', { name: /apply now/i }))
    await waitFor(() => {
      expect(applyToTryout).toHaveBeenCalled()
    })
  })

  // ── Test 4: pending state shows spinner ───────────────────────────────
  it('4: shows spinner and disables button while action is pending', async () => {
    let resolveAction!: (v: any) => void
    vi.mocked(applyToTryout).mockImplementation(
      () => new Promise((r) => { resolveAction = r })
    )
    const user = userEvent.setup()

    render(<ApplyButton tryoutId="uuid-1" alreadyApplied={false} />)

    await user.click(screen.getByRole('button', { name: /apply now/i }))

    // While the action is in-flight the button should be disabled
    await waitFor(() => {
      const btn = screen.getByRole('button')
      expect(btn).toBeDisabled()
    })

    // Cleanup
    resolveAction({ success: 'done' })
  })

  // ── Test 5: action returns error → toast.error ────────────────────────
  it('5: calls toast.error when action returns an error', async () => {
    vi.mocked(applyToTryout).mockResolvedValue({ error: 'You have already applied.' })
    const user = userEvent.setup()

    render(<ApplyButton tryoutId="uuid-1" alreadyApplied={false} />)

    await user.click(screen.getByRole('button', { name: /apply now/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('You have already applied.')
    })
  })

  // ── Test 6: action returns success → toast.success ────────────────────
  it('6: calls toast.success when action returns success', async () => {
    vi.mocked(applyToTryout).mockResolvedValue({
      success: 'Application submitted successfully!',
    })
    const user = userEvent.setup()

    render(<ApplyButton tryoutId="uuid-1" alreadyApplied={false} />)

    await user.click(screen.getByRole('button', { name: /apply now/i }))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Application submitted successfully!')
    })
  })
})
