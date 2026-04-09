'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { ActionResult } from '@/lib/safe-action'
import { APP_SESSION_COOKIE, APP_SESSION_MAX_AGE_SECONDS } from '@/lib/auth/session'

function mapAuthError(error: { code?: string; message: string }) {
  switch (error.code) {
    case 'email_address_invalid':
      return 'This email address is not allowed. Please use a valid personal email.'
    case 'invalid_credentials':
      return 'Incorrect email or password. Please try again.'
    case 'email_not_confirmed':
      return 'Please confirm your email before signing in.'
    case 'user_already_exists':
      return 'An account with this email already exists.'
    default:
      return error.message || 'Authentication failed. Please try again.'
  }
}

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

  const email = parsed.data.email.trim().toLowerCase()
  const { password } = parsed.data

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (authError) {
    return { error: mapAuthError(authError) }
  }

  const { data: account } = await supabase
    .from('users')
    .select('is_suspended')
    .eq('id', authData.user.id)
    .maybeSingle()

  if (account?.is_suspended) {
    await supabase.auth.signOut()
    return {
      error:
        'Your account is suspended. Contact support if you think this is a mistake.',
    }
  }

  const cookieStore = await cookies()
  cookieStore.set(APP_SESSION_COOKIE, String(Date.now()), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: APP_SESSION_MAX_AGE_SECONDS,
  })

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

  const email = parsed.data.email.trim().toLowerCase()
  const { password } = parsed.data

  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    console.error('[signup] error:', error)
    return { error: mapAuthError(error) }
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Check your email to confirm your account.')
}