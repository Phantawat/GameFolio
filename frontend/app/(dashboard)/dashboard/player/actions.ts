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

const playerProfileSchema = z.object({
  gamertag: z.string().trim().min(2, 'Gamertag must be at least 2 characters').max(32),
  region: z.string().trim().max(32).optional().or(z.literal('')),
  bio: z.string().trim().max(500, 'Bio must be 500 characters or fewer').optional().or(z.literal('')),
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

export const updatePlayerProfile = createSafeAction(playerProfileSchema, async (data, ctx) => {
  const { data: profile } = await ctx.supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', ctx.user.id)
    .maybeSingle()

  if (!profile) {
    return { error: 'Player profile not found. Please complete onboarding first.' }
  }

  const { error } = await ctx.supabase
    .from('player_profiles')
    .update({
      gamertag: data.gamertag,
      region: data.region ? data.region : null,
      bio: data.bio ? data.bio : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', profile.id)

  if (error) {
    if (error.code === '23505') {
      return { error: 'This gamertag is already taken. Please choose another one.' }
    }
    return { error: 'Failed to update profile. Please try again.' }
  }

  revalidatePath('/dashboard/player')
  return { success: 'Profile updated successfully.' }
})
