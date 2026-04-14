import { vi } from 'vitest'

/**
 * Creates a chainable Supabase query builder mock.
 * The returned object is thenable, so `await chain.update().eq()` resolves correctly.
 */
export function makeChain(resolveWith: { data: any; error: any } = { data: null, error: null }) {
  const chain: any = {}

  // Make it thenable so `await from().update().eq()` works
  chain.then = (onFulfilled: (v: any) => any, onRejected?: (e: any) => any) =>
    Promise.resolve(resolveWith).then(onFulfilled, onRejected)
  chain.catch = (onRejected: (e: any) => any) =>
    Promise.resolve(resolveWith).catch(onRejected)
  chain.finally = (onFinally: () => void) =>
    Promise.resolve(resolveWith).finally(onFinally)

  // Chainable methods
  const returnSelf = () => chain
  chain.select = vi.fn().mockImplementation(returnSelf)
  chain.update = vi.fn().mockImplementation(returnSelf)
  chain.delete = vi.fn().mockImplementation(returnSelf)
  chain.eq = vi.fn().mockImplementation(returnSelf)
  chain.in = vi.fn().mockImplementation(returnSelf)
  chain.ilike = vi.fn().mockImplementation(returnSelf)
  chain.neq = vi.fn().mockImplementation(returnSelf)
  chain.order = vi.fn().mockImplementation(returnSelf)
  chain.limit = vi.fn().mockImplementation(returnSelf)

  // insert/upsert: return the chain so callers can continue chaining
  // (.insert({}).select('id').single() works) OR just await directly (thenable).
  chain.insert = vi.fn().mockImplementation(returnSelf)
  chain.upsert = vi.fn().mockImplementation(returnSelf)

  // Terminal methods (return promises directly)
  chain.single = vi.fn().mockResolvedValue(resolveWith)
  chain.maybeSingle = vi.fn().mockResolvedValue(resolveWith)

  return chain
}

const DEFAULT_USER = { id: 'test-user-id', email: 'test@example.com' }

/**
 * Builds a mock Supabase client.
 * `fromChains` is an ordered queue — first call to `from()` returns fromChains[0], etc.
 */
export function makeSupabaseMock(options: {
  user?: any
  fromChains?: Array<{ data: any; error: any }>
  authOverrides?: Record<string, any>
} = {}) {
  const mockFrom = vi.fn()

  if (options.fromChains) {
    let idx = 0
    mockFrom.mockImplementation(() => {
      const response = options.fromChains![idx] ?? { data: null, error: null }
      idx++
      return makeChain(response)
    })
  }

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: options.user !== undefined ? options.user : DEFAULT_USER },
      }),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      ...options.authOverrides,
    },
    from: mockFrom,
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        remove: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({
          data: { publicUrl: 'https://example.com/logo.png' },
        }),
      }),
    },
  }
}

/** Convenience: build FormData from a plain object */
export function toFormData(obj: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [k, v] of Object.entries(obj)) {
    fd.append(k, v)
  }
  return fd
}
