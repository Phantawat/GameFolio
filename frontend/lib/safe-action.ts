/**
 * createSafeAction
 * ─────────────────────────────────────────────────────────────────────────────
 * A lightweight server-action wrapper that eliminates boilerplate by handling:
 *   1. Zod input validation
 *   2. Supabase session verification
 *   3. Consistent ActionResult typing
 *
 * Usage
 * ─────
 *   const myAction = createSafeAction(mySchema, async (data, ctx) => {
 *     // `data`        → validated & typed FormData values
 *     // `ctx.user`    → authenticated Supabase User
 *     // `ctx.supabase`→ typed Supabase client (Server)
 *     const { error } = await ctx.supabase.from('...').insert(...)
 *     if (error) return { error: error.message }
 *     return { success: 'Done!' }
 *   })
 *
 *   // In a React form:
 *   const [state, dispatch] = useActionState(myAction, null)
 */

'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'

// ─── Public types ─────────────────────────────────────────────────────────────

export type ActionResult = {
  error?: string
  success?: string
  fieldErrors?: Record<string, string[]>
}

type ActionContext = {
  user: User
  supabase: SupabaseClient<Database>
}

type SafeActionHandler<TSchema extends z.ZodTypeAny> = (
  data: z.infer<TSchema>,
  ctx: ActionContext
) => Promise<ActionResult>

/**
 * Creates a type-safe server action bound to a Zod schema.
 *
 * The returned function matches the `(prevState, formData) => Promise<ActionResult>`
 * signature expected by React's `useActionState`.
 */
export function createSafeAction<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  handler: SafeActionHandler<TSchema>
) {
  return async function safeAction(
    _prevState: ActionResult | null,
    formData: FormData
  ): Promise<ActionResult> {
    // 1. Verify authentication
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'You must be logged in to perform this action.' }
    }

    // 2. Parse raw FormData into a plain object and validate
    const rawData = Object.fromEntries(formData.entries())
    const parsed = schema.safeParse(rawData)

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>
      // Return the first field error as the top-level message for convenience
      const firstMessage = Object.values(fieldErrors).flat()[0] ?? 'Invalid input'
      return { error: firstMessage, fieldErrors }
    }

    // 3. Delegate to the handler
    try {
      return await handler(parsed.data, { user, supabase })
    } catch (err: unknown) {
      // Surface redirect/notFound signals transparently (Next.js uses thrown errors for these)
      if (
        err instanceof Error &&
        (err.message === 'NEXT_REDIRECT' || err.message === 'NEXT_NOT_FOUND')
      ) {
        throw err
      }
      console.error('[safe-action] Unhandled error:', err)
      return { error: 'An unexpected error occurred. Please try again.' }
    }
  }
}
