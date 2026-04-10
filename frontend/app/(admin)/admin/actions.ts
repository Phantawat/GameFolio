'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createSafeAction } from '@/lib/safe-action'

const toggleTryoutSchema = z.object({
  tryout_id: z.string().uuid('Invalid tryout.'),
  is_active: z.enum(['true', 'false']),
})

const moderateTryoutDeleteSchema = z.object({
  tryout_id: z.string().uuid('Invalid tryout.'),
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
      .select('id, is_active, deleted_at')
      .eq('id', data.tryout_id)
      .maybeSingle()

    if (!tryout) {
      return { error: 'Tryout not found.' }
    }

    if (tryout.deleted_at) {
      return { error: 'Restore this tryout before changing active status.' }
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

export const deleteTryoutModeration = createSafeAction(
  moderateTryoutDeleteSchema,
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

    const { data: tryout } = await ctx.supabase
      .from('tryouts')
      .select('id, deleted_at')
      .eq('id', data.tryout_id)
      .maybeSingle()

    if (!tryout) {
      return { error: 'Tryout not found.' }
    }

    if (tryout.deleted_at) {
      return { error: 'Tryout is already deleted.' }
    }

    const { error } = await ctx.supabase
      .from('tryouts')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: ctx.user.id,
        is_active: false,
      })
      .eq('id', data.tryout_id)

    if (error) {
      return { error: 'Failed to delete tryout.' }
    }

    revalidatePath('/admin')
    revalidatePath('/dashboard/tryouts')
    revalidatePath('/org/tryouts')
    return { success: 'Tryout deleted.' }
  }
)

export const restoreTryoutModeration = createSafeAction(
  moderateTryoutDeleteSchema,
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

    const { data: tryout } = await ctx.supabase
      .from('tryouts')
      .select('id, deleted_at')
      .eq('id', data.tryout_id)
      .maybeSingle()

    if (!tryout) {
      return { error: 'Tryout not found.' }
    }

    if (!tryout.deleted_at) {
      return { error: 'Tryout is not deleted.' }
    }

    const { error } = await ctx.supabase
      .from('tryouts')
      .update({
        deleted_at: null,
        deleted_by: null,
      })
      .eq('id', data.tryout_id)

    if (error) {
      return { error: 'Failed to restore tryout.' }
    }

    revalidatePath('/admin')
    revalidatePath('/dashboard/tryouts')
    revalidatePath('/org/tryouts')
    return { success: 'Tryout restored.' }
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
