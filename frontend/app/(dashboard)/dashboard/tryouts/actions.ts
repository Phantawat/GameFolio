'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createSafeAction } from '@/lib/safe-action'

// ─── Schema ───────────────────────────────────────────────────────────────────

const applyToTryoutSchema = z.object({
  tryout_id: z.string().uuid('Invalid tryout.'),
  message: z.string().optional(),
})

// ─── Action ───────────────────────────────────────────────────────────────────

export const applyToTryout = createSafeAction(applyToTryoutSchema, async (data, ctx) => {
  // Resolve the player profile for the authenticated user
  const { data: profile, error: profileError } = await ctx.supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', ctx.user.id)
    .single()

  if (profileError || !profile) {
    return { error: 'Player profile not found. Please complete onboarding.' }
  }

  const { error } = await ctx.supabase.from('applications').insert({
    tryout_id: data.tryout_id,
    player_profile_id: profile.id,
    status: 'PENDING',
    message: data.message || null,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'You have already applied to this tryout.' }
    }
    return { error: 'Failed to submit application. Please try again.' }
  }

  revalidatePath('/dashboard/applications')
  revalidatePath('/dashboard/tryouts')
  return { success: 'Application submitted successfully!' }
})
