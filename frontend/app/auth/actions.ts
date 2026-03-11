'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { ActionResult } from '@/lib/safe-action'

// ─── Schema ───────────────────────────────────────────────────────────────────

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Auth actions intentionally do NOT use createSafeAction because the user is
 * not yet authenticated when they call login/signup — the wrapper's session
 * check would always fail.
 */
export async function login(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const parsed = authSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>
    return { error: Object.values(fieldErrors).flat()[0] ?? 'Invalid inputs', fieldErrors }
  }

  const { email, password } = parsed.data

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return { error: authError.message }
  }

  // Route based on onboarding status
  const { data: profile } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', authData.user.id)
    .single()

  revalidatePath('/', 'layout')

  if (!profile) {
    redirect('/onboarding')
  }

  redirect('/dashboard/player')
}

export async function signup(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const parsed = authSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors as Record<string, string[]>
    return { error: Object.values(fieldErrors).flat()[0] ?? 'Invalid inputs', fieldErrors }
  }

  const { email, password } = parsed.data

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    console.error('[signup] error:', error)
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Check your email to confirm your account.')
}