import { describe, it, expect, vi, beforeEach } from 'vitest'
import { z } from 'zod'
import { makeSupabaseMock, makeChain, toFormData } from '../../helpers/mock-supabase'

// Must be before imports of modules that use createClient
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { createSafeAction } from '@/lib/safe-action'

const testSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  count: z.coerce.number().int().optional(),
})

describe('createSafeAction wrapper', () => {
  const mockUser = { id: 'user-1', email: 'user@test.com' }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ── Test 1: unauthenticated ──────────────────────────────────────────────
  it('returns error when user is not authenticated', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: null }) as any
    )

    const handler = vi.fn().mockResolvedValue({ success: 'done' })
    const action = createSafeAction(testSchema, handler)
    const fd = toFormData({ name: 'whatever' })

    const result = await action(null, fd)

    expect(result).toEqual({ error: 'You must be logged in to perform this action.' })
    expect(handler).not.toHaveBeenCalled()
  })

  // ── Test 2: Zod validation fails ──────────────────────────────────────────
  it('returns field errors when input fails Zod validation', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: mockUser }) as any
    )

    const handler = vi.fn().mockResolvedValue({ success: 'done' })
    const action = createSafeAction(testSchema, handler)
    const fd = toFormData({ name: '' }) // violates min(1)

    const result = await action(null, fd)

    expect(result.error).toBeTruthy()
    expect(result.fieldErrors).toBeDefined()
    expect(handler).not.toHaveBeenCalled()
  })

  // ── Test 3: auth + validation pass → handler is called ──────────────────
  it('calls handler with validated data and ctx when auth and validation succeed', async () => {
    const mockSupabase = makeSupabaseMock({ user: mockUser })
    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const handler = vi.fn().mockResolvedValue({ success: 'done' })
    const action = createSafeAction(testSchema, handler)
    const fd = toFormData({ name: 'hello', count: '3' })

    await action(null, fd)

    expect(handler).toHaveBeenCalledOnce()
    const [data, ctx] = handler.mock.calls[0]
    expect(data.name).toBe('hello')
    expect(data.count).toBe(3)
    expect(ctx.user).toEqual(mockUser)
    expect(ctx.supabase).toBe(mockSupabase)
  })

  // ── Test 4: handler returns error ────────────────────────────────────────
  it('returns handler error unchanged', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: mockUser }) as any
    )

    const action = createSafeAction(testSchema, async () => ({
      error: 'Something went wrong on the DB side',
    }))
    const fd = toFormData({ name: 'valid' })

    const result = await action(null, fd)
    expect(result).toEqual({ error: 'Something went wrong on the DB side' })
  })

  // ── Test 5: handler returns success ──────────────────────────────────────
  it('returns handler success unchanged', async () => {
    vi.mocked(createClient).mockResolvedValue(
      makeSupabaseMock({ user: mockUser }) as any
    )

    const action = createSafeAction(testSchema, async () => ({
      success: 'Record saved!',
    }))
    const fd = toFormData({ name: 'valid' })

    const result = await action(null, fd)
    expect(result).toEqual({ success: 'Record saved!' })
  })
})
