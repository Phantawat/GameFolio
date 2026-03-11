'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createSafeAction } from '@/lib/safe-action'

// ─── Schema ───────────────────────────────────────────────────────────────────

const onboardingSchema = z.object({
  gamertag: z.string().min(2, 'Gamertag must be at least 2 characters'),
  bio: z.string().optional(),
  region: z.string().optional(),
})

// ─── Action ───────────────────────────────────────────────────────────────────

export const completeOnboarding = createSafeAction(onboardingSchema, async (data, ctx) => {
  const { error } = await ctx.supabase.from('player_profiles').upsert(
    {
      user_id: ctx.user.id,
      gamertag: data.gamertag,
      bio: data.bio ?? null,
      region: data.region ?? null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  )

  if (error) {
    console.error('[completeOnboarding] error:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard', 'layout')
  redirect('/dashboard/player')
})
