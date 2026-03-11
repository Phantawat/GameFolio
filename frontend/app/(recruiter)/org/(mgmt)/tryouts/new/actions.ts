'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createSafeAction } from '@/lib/safe-action'

const createTryoutSchema = z.object({
  organization_id: z.string().uuid('Invalid organization.'),
  game_id: z.string().uuid('Please select a game.'),
  role_needed_id: z.string().optional(),
  roster_id: z.string().optional(),
  title: z.string().min(3, 'Title must be at least 3 characters.'),
  requirements: z.string().optional(),
  is_active: z.string().optional(),
})

export const createTryout = createSafeAction(createTryoutSchema, async (data, ctx) => {
  // Verify the user is an owner or manager
  const { data: membership } = await ctx.supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', data.organization_id)
    .eq('user_id', ctx.user.id)
    .in('role', ['OWNER', 'MANAGER'])
    .maybeSingle()

  if (!membership) {
    return { error: 'You do not have permission to post tryouts for this organization.' }
  }

  // Coerce empty strings to null for optional UUID fields
  const roleNeededId =
    data.role_needed_id && data.role_needed_id.length > 0 ? data.role_needed_id : null
  const rosterId =
    data.roster_id && data.roster_id.length > 0 ? data.roster_id : null

  const isActive = data.is_active === 'true'

  const { error } = await ctx.supabase.from('tryouts').insert({
    organization_id: data.organization_id,
    game_id: data.game_id,
    role_needed_id: roleNeededId,
    roster_id: rosterId,
    title: data.title,
    requirements: data.requirements ?? null,
    is_active: isActive,
  })

  if (error) {
    return { error: 'Failed to create tryout. Please try again.' }
  }

  revalidatePath('/dashboard/tryouts')
  revalidatePath('/org/applications')

  if (isActive) {
    redirect('/org/applications')
  }

  return { success: 'Tryout saved as draft.' }
})
