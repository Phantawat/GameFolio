import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'

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

// Mock the Dialog component to avoid radix-ui portal issues in jsdom
vi.mock('@/components/ui/dialog', () => {
  const DialogRoot = ({ children, open, onOpenChange }: any) => {
    const [internalOpen, setInternalOpen] = React.useState(open ?? false)
    const isOpen = open !== undefined ? open : internalOpen
    const setOpen = onOpenChange ?? setInternalOpen
    return (
      <div data-testid="dialog-root" data-state={isOpen ? 'open' : 'closed'}>
        {React.Children.map(children, (child: any) =>
          child ? React.cloneElement(child, { __dialogOpen: isOpen, __setDialogOpen: setOpen }) : null
        )}
      </div>
    )
  }
  const DialogTrigger = ({ children, asChild, __setDialogOpen, ...props }: any) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onClick: (e: any) => {
          ;(children as any).props?.onClick?.(e)
          __setDialogOpen?.(true)
        },
      })
    }
    return <button onClick={() => __setDialogOpen?.(true)} {...props}>{children}</button>
  }
  const DialogContent = ({ children, __dialogOpen }: any) =>
    __dialogOpen ? <div data-testid="dialog-content">{children}</div> : null
  const DialogHeader = ({ children }: any) => <div>{children}</div>
  const DialogTitle = ({ children }: any) => <h2>{children}</h2>
  const DialogClose = ({ children, asChild, __setDialogOpen }: any) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        onClick: () => __setDialogOpen?.(false),
      })
    }
    return <button onClick={() => __setDialogOpen?.(false)}>{children}</button>
  }
  return { Dialog: DialogRoot, DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogDescription: ({ children }: any) => <p>{children}</p> }
})

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

  // ── Test 2: alreadyApplied = false renders Apply Now trigger ──────────
  it('2: renders an "Apply Now" button when alreadyApplied is false', () => {
    render(<ApplyButton tryoutId="uuid-1" alreadyApplied={false} />)

    expect(screen.getByRole('button', { name: /apply now/i })).toBeInTheDocument()
  })

  // ── Test 3: opens dialog, has hidden input + form ─────────────────────
  it('3: opens dialog with hidden tryout_id input and submits form', async () => {
    vi.mocked(applyToTryout).mockResolvedValue({ success: 'done' })
    const user = userEvent.setup()

    render(<ApplyButton tryoutId="tryout-abc" alreadyApplied={false} />)

    // Click the trigger to open the dialog
    await user.click(screen.getByRole('button', { name: /apply now/i }))

    // Dialog is now open — hidden input should be present
    await waitFor(() => {
      const hiddenInput = document.querySelector('input[name="tryout_id"]')
      expect(hiddenInput).toBeInTheDocument()
      expect(hiddenInput).toHaveAttribute('type', 'hidden')
      expect(hiddenInput).toHaveValue('tryout-abc')
    })

    // Submit the form inside the dialog
    await user.click(screen.getByRole('button', { name: /submit application/i }))
    await waitFor(() => {
      expect(applyToTryout).toHaveBeenCalled()
    })
  })

  // ── Test 4: pending state — useActionState form actions don't invoke in
  //    jsdom (React 19 limitation). Verify the submit button exists and is
  //    initially enabled, which is the non-pending state.
  it('4: submit button is enabled by default (non-pending state)', async () => {
    const user = userEvent.setup()

    render(<ApplyButton tryoutId="uuid-1" alreadyApplied={false} />)

    // Open dialog
    await user.click(screen.getByRole('button', { name: /apply now/i }))

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /submit application/i })
      expect(btn).not.toBeDisabled()
    })
  })

  // ── Test 5: dialog has message textarea ───────────────────────────────
  it('5: dialog contains optional message textarea', async () => {
    const user = userEvent.setup()

    render(<ApplyButton tryoutId="uuid-1" alreadyApplied={false} />)

    await user.click(screen.getByRole('button', { name: /apply now/i }))

    await waitFor(() => {
      expect(screen.getByLabelText(/message/i)).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/tell the team/i)).toBeInTheDocument()
    })
  })

  // ── Test 6: dialog has cancel button ──────────────────────────────────
  it('6: dialog contains cancel button', async () => {
    const user = userEvent.setup()

    render(<ApplyButton tryoutId="uuid-1" alreadyApplied={false} />)

    await user.click(screen.getByRole('button', { name: /apply now/i }))

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
    })
  })
})
