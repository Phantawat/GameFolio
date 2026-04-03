'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createSafeAction } from '@/lib/safe-action'

const createRosterSchema = z.object({
  organization_id: z.string().uuid('Invalid organization.'),
  game_id: z.string().uuid('Please select a game.'),
  name: z.string().min(2, 'Roster name must be at least 2 characters.'),
})

export const createRoster = createSafeAction(createRosterSchema, async (data, ctx) => {
  // Verify the user is an owner or manager of this org
  const { data: membership } = await ctx.supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', data.organization_id)
    .eq('user_id', ctx.user.id)
    .in('role', ['OWNER', 'MANAGER'])
    .maybeSingle()

  if (!membership) {
    return { error: 'You do not have permission to manage this organization.' }
  }

  const { error } = await ctx.supabase.from('rosters').insert({
    organization_id: data.organization_id,
    game_id: data.game_id,
    name: data.name,
  })

  if (error) {
    if (error.code === '23505') {
      return { error: 'A roster with this name already exists for this game.' }
    }
    return { error: `Failed to create roster: ${error.message}` }
  }

  revalidatePath('/org/rosters')
  return { success: 'Roster created successfully!' }
})

// ─── Add player to roster ────────────────────────────────────────────────────

const addRosterMemberSchema = z.object({
  roster_id: z.string().uuid('Invalid roster.'),
  gamertag: z.string().min(1, 'Please enter a gamertag.'),
  role_in_roster: z.string().optional(),
})

export const addRosterMember = createSafeAction(addRosterMemberSchema, async (data, ctx) => {
  // Get the roster and its org
  const { data: roster } = await ctx.supabase
    .from('rosters')
    .select('id, organization_id')
    .eq('id', data.roster_id)
    .maybeSingle()

  if (!roster) return { error: 'Roster not found.' }

  // Verify user is OWNER/MANAGER
  const { data: membership } = await ctx.supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', roster.organization_id)
    .eq('user_id', ctx.user.id)
    .in('role', ['OWNER', 'MANAGER'])
    .maybeSingle()

  if (!membership) return { error: 'Permission denied.' }

  // Find the player by gamertag
  const { data: profile } = await ctx.supabase
    .from('player_profiles')
    .select('id')
    .eq('gamertag', data.gamertag)
    .maybeSingle()

  if (!profile) return { error: `Player "${data.gamertag}" not found.` }

  const { error } = await ctx.supabase.from('roster_members').insert({
    roster_id: data.roster_id,
    player_profile_id: profile.id,
    role_in_roster: data.role_in_roster || null,
  })

  if (error) {
    if (error.code === '23505') return { error: 'This player is already on this roster.' }
    return { error: 'Failed to add member. Please try again.' }
  }

  revalidatePath(`/org/rosters/${data.roster_id}`)
  revalidatePath('/org/rosters')
  return { success: `${data.gamertag} added to roster!` }
})

// ─── Remove player from roster ──────────────────────────────────────────────

const removeRosterMemberSchema = z.object({
  roster_id: z.string().uuid('Invalid roster.'),
  roster_member_id: z.string().uuid('Invalid member.'),
})

export const removeRosterMember = createSafeAction(removeRosterMemberSchema, async (data, ctx) => {
  // Get the roster and its org
  const { data: roster } = await ctx.supabase
    .from('rosters')
    .select('id, organization_id')
    .eq('id', data.roster_id)
    .maybeSingle()

  if (!roster) return { error: 'Roster not found.' }

  // Verify user is OWNER/MANAGER
  const { data: membership } = await ctx.supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', roster.organization_id)
    .eq('user_id', ctx.user.id)
    .in('role', ['OWNER', 'MANAGER'])
    .maybeSingle()

  if (!membership) return { error: 'Permission denied.' }

  const { error } = await ctx.supabase
    .from('roster_members')
    .delete()
    .eq('id', data.roster_member_id)
    .eq('roster_id', data.roster_id)

  if (error) return { error: 'Failed to remove member.' }

  revalidatePath(`/org/rosters/${data.roster_id}`)
  revalidatePath('/org/rosters')
  return { success: 'Member removed from roster.' }
})
