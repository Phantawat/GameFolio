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
    return { error: 'Failed to create roster. Please try again.' }
  }

  revalidatePath('/org/rosters')
  return { success: 'Roster created successfully!' }
})
