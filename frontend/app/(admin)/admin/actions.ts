'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createSafeAction } from '@/lib/safe-action'

const toggleTryoutSchema = z.object({
  tryout_id: z.string().uuid('Invalid tryout.'),
  is_active: z.enum(['true', 'false']),
})

const toggleUserSuspensionSchema = z.object({
  user_id: z.string().uuid('Invalid user.'),
  is_suspended: z.enum(['true', 'false']),
})

export const toggleTryoutActive = createSafeAction(
  toggleTryoutSchema,
  async (data, ctx) => {
    // Verify user is PLATFORM_ADMIN
    const { data: role } = await ctx.supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', ctx.user.id)
      .eq('role', 'PLATFORM_ADMIN')
      .maybeSingle()

    if (!role) {
      return { error: 'Permission denied. Platform admin access required.' }
    }

    // Check tryout exists
    const { data: tryout } = await ctx.supabase
      .from('tryouts')
      .select('id, is_active')
      .eq('id', data.tryout_id)
      .maybeSingle()

    if (!tryout) {
      return { error: 'Tryout not found.' }
    }

    const newActive = data.is_active === 'true'

    const { error } = await ctx.supabase
      .from('tryouts')
      .update({ is_active: newActive })
      .eq('id', data.tryout_id)

    if (error) {
      return { error: 'Failed to update tryout status.' }
    }

    revalidatePath('/admin')
    revalidatePath('/dashboard/tryouts')
    return {
      success: newActive ? 'Tryout activated.' : 'Tryout deactivated.',
    }
  }
)

export const toggleUserSuspension = createSafeAction(
  toggleUserSuspensionSchema,
  async (data, ctx) => {
    const { data: role } = await ctx.supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', ctx.user.id)
      .eq('role', 'PLATFORM_ADMIN')
      .maybeSingle()

    if (!role) {
      return { error: 'Permission denied. Platform admin access required.' }
    }

    if (data.user_id === ctx.user.id) {
      return { error: 'You cannot change your own account status.' }
    }

    const nextSuspended = data.is_suspended === 'true'

    const { error } = await ctx.supabase
      .from('users')
      .update({ is_suspended: nextSuspended })
      .eq('id', data.user_id)

    if (error) {
      return { error: 'Failed to update user account status.' }
    }

    revalidatePath('/admin')
    return {
      success: nextSuspended ? 'User account suspended.' : 'User account reactivated.',
    }
  }
)
