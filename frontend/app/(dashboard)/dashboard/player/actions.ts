'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createSafeAction } from '@/lib/safe-action'

// ─── Schema ───────────────────────────────────────────────────────────────────

const gameStatsSchema = z.object({
  game_id: z.string().uuid('Please select a game'),
  main_role_id: z.string().uuid('Please select a role').optional().or(z.literal('')),
  rank: z.string().min(1, 'Rank is required'),
  mmr: z.coerce.number().int().min(0).max(99999).optional().or(z.literal('')),
  win_rate: z.coerce.number().min(0).max(100).optional().or(z.literal('')),
  hours_played: z.coerce.number().int().min(0).optional().or(z.literal('')),
})

// ─── Action ───────────────────────────────────────────────────────────────────

export const upsertGameStats = createSafeAction(gameStatsSchema, async (data, ctx) => {
  // Resolve the player profile for the authenticated user
  const { data: profile } = await ctx.supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', ctx.user.id)
    .single()

  if (!profile) {
    return { error: 'Player profile not found. Please complete onboarding first.' }
  }

  const { game_id, main_role_id, rank, mmr, win_rate, hours_played } = data

  const { error } = await ctx.supabase
    .from('player_game_stats')
    .upsert(
      {
        player_profile_id: profile.id,
        game_id,
        main_role_id: main_role_id || null,
        rank: rank ?? null,
        mmr: typeof mmr === 'number' ? mmr : null,
        win_rate: typeof win_rate === 'number' ? win_rate : null,
        hours_played: typeof hours_played === 'number' ? hours_played : null,
      },
      { onConflict: 'player_profile_id,game_id' }
    )

  if (error) {
    console.error('[upsertGameStats] DB error:', error.message, '| code:', error.code)
    return { error: error.message }
  }

  revalidatePath('/dashboard/player')
  redirect('/dashboard/player')
})
