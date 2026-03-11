/**
 * Server-side data fetching utilities with React cache().
 *
 * React's cache() deduplicates calls within the same server request tree,
 * so multiple components that need the same data (e.g. player profile) will
 * only hit the database once per request — no redundant round-trips.
 *
 * All functions here are Server-only (no "use client").
 */

import { cache } from 'react'
import { createClient } from '@/lib/supabase/server'
import type { Tables } from '@/lib/database.types'

// ─── Types ────────────────────────────────────────────────────────────────────

export type PlayerProfileRow = Tables<'player_profiles'>

export type GameStatWithRelations = {
  rank: string | null
  mmr: number | null
  win_rate: number | null
  hours_played: number | null
  game: { name: string } | null
  main_role: { role_name: string } | null
}

// ─── Player profile (cached per request) ─────────────────────────────────────

/**
 * Returns the player_profile for the currently authenticated user, or null.
 * Cached — safe to call from multiple components in the same request.
 */
export const getPlayerProfile = cache(async (): Promise<PlayerProfileRow | null> => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('player_profiles')
    .select('id, user_id, gamertag, bio, region, created_at, updated_at')
    .eq('user_id', user.id)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      // PGRST116 = "no rows found" — expected before onboarding
      console.error('[getPlayerProfile] error:', error.message)
    }
    return null
  }

  return data
})

// ─── Game stats (cached per request) ─────────────────────────────────────────

/**
 * Returns formatted game stats with related game name and role for a given
 * player_profile_id. Cached — safe to call from multiple components.
 */
export const getPlayerGameStats = cache(
  async (playerProfileId: string): Promise<GameStatWithRelations[]> => {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('player_game_stats')
      .select(
        `
        rank,
        mmr,
        win_rate,
        hours_played,
        games(name),
        main_role:game_roles!player_game_stats_main_role_id_fkey(role_name)
      `
      )
      .eq('player_profile_id', playerProfileId)

    if (error) {
      console.error('[getPlayerGameStats] error:', error.message)
      return []
    }

    return (data ?? []).map((stat) => ({
      rank: stat.rank,
      mmr: stat.mmr,
      win_rate: stat.win_rate,
      hours_played: stat.hours_played,
      // Supabase returns joined rows as arrays for to-many, objects for to-one
      game: Array.isArray(stat.games) ? (stat.games[0] ?? null) : (stat.games ?? null),
      main_role: Array.isArray(stat.main_role)
        ? (stat.main_role[0] ?? null)
        : (stat.main_role ?? null),
    }))
  }
)

// ─── Active tryouts (cached per request) ─────────────────────────────────────

/**
 * Returns all active tryouts with their related game and organization name.
 */
export const getActiveTryouts = cache(async () => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tryouts')
    .select(
      `
      id,
      title,
      requirements,
      is_active,
      created_at,
      games(name),
      organizations(name, logo_url),
      role_needed:game_roles(role_name)
    `
    )
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getActiveTryouts] error:', error.message)
    return []
  }

  return data ?? []
})

// ─── Applications for a player (cached per request) ──────────────────────────

/**
 * Returns all applications submitted by a given player_profile_id.
 */
export const getPlayerApplications = cache(async (playerProfileId: string) => {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('applications')
    .select(
      `
      id,
      status,
      message,
      created_at,
      tryouts(title, games(name), organizations(name))
    `
    )
    .eq('player_profile_id', playerProfileId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[getPlayerApplications] error:', error.message)
    return []
  }

  return data ?? []
})
