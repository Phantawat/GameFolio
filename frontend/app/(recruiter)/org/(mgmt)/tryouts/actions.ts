'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createSafeAction } from '@/lib/safe-action'

const toggleTryoutSchema = z.object({
  tryout_id: z.string().uuid('Invalid tryout id.'),
  is_active: z.enum(['true', 'false']),
})

const deleteTryoutSchema = z.object({
  tryout_id: z.string().uuid('Invalid tryout id.'),
})

const bulkTryoutSchema = z.object({
  action: z.enum(['pause', 'delete']),
  tryout_ids: z.string().min(2, 'No tryouts selected.'),
})

async function verifyManageAccessForTryouts(
  supabase: Parameters<typeof createSafeAction>[1] extends never
    ? never
    : Awaited<ReturnType<typeof import('@/lib/supabase/server').createClient>>,
  userId: string,
  tryoutIds: string[]
) {
  const { data: tryouts } = await supabase
    .from('tryouts')
    .select('id, organization_id')
    .in('id', tryoutIds)

  if (!tryouts || tryouts.length !== tryoutIds.length) {
    return { ok: false as const, error: 'One or more tryouts were not found.' }
  }

  const orgIds = [...new Set(tryouts.map((t) => t.organization_id))]

  const { data: memberships } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', userId)
    .in('role', ['OWNER', 'MANAGER'])
    .in('organization_id', orgIds)

  const allowedOrgIds = new Set((memberships ?? []).map((m) => m.organization_id))
  const unauthorized = orgIds.some((orgId) => !allowedOrgIds.has(orgId))

  if (unauthorized) {
    return { ok: false as const, error: 'You do not have permission to manage one or more tryouts.' }
  }

  return { ok: true as const }
}

export const toggleTryoutStatus = createSafeAction(toggleTryoutSchema, async (data, ctx) => {
  const access = await verifyManageAccessForTryouts(ctx.supabase, ctx.user.id, [data.tryout_id])
  if (!access.ok) return { error: access.error }

  const { error } = await ctx.supabase
    .from('tryouts')
    .update({ is_active: data.is_active === 'true' })
    .eq('id', data.tryout_id)

  if (error) {
    return { error: 'Failed to update tryout status. Please try again.' }
  }

  revalidatePath('/org/tryouts')
  revalidatePath('/org/applications')
  revalidatePath('/dashboard/tryouts')

  return { success: data.is_active === 'true' ? 'Tryout resumed.' : 'Tryout paused.' }
})

export const deleteTryout = createSafeAction(deleteTryoutSchema, async (data, ctx) => {
  const access = await verifyManageAccessForTryouts(ctx.supabase, ctx.user.id, [data.tryout_id])
  if (!access.ok) return { error: access.error }

  const { error: appDeleteError } = await ctx.supabase
    .from('applications')
    .delete()
    .eq('tryout_id', data.tryout_id)

  if (appDeleteError) {
    return { error: 'Failed to remove related applications.' }
  }

  const { error } = await ctx.supabase.from('tryouts').delete().eq('id', data.tryout_id)

  if (error) {
    return { error: 'Failed to delete tryout. Please try again.' }
  }

  revalidatePath('/org/tryouts')
  revalidatePath('/org/applications')
  revalidatePath('/dashboard/tryouts')

  return { success: 'Tryout deleted.' }
})

export const bulkManageTryouts = createSafeAction(bulkTryoutSchema, async (data, ctx) => {
  let tryoutIds: string[]

  try {
    const parsed = JSON.parse(data.tryout_ids)
    const idSchema = z.array(z.string().uuid()).min(1, 'No tryouts selected.')
    tryoutIds = idSchema.parse(parsed)
  } catch {
    return { error: 'Invalid tryout selection.' }
  }

  const access = await verifyManageAccessForTryouts(ctx.supabase, ctx.user.id, tryoutIds)
  if (!access.ok) return { error: access.error }

  if (data.action === 'pause') {
    const { error } = await ctx.supabase
      .from('tryouts')
      .update({ is_active: false })
      .in('id', tryoutIds)

    if (error) {
      return { error: 'Failed to pause selected tryouts.' }
    }

    revalidatePath('/org/tryouts')
    revalidatePath('/org/applications')
    revalidatePath('/dashboard/tryouts')
    return { success: `${tryoutIds.length} tryout${tryoutIds.length === 1 ? '' : 's'} paused.` }
  }

  const { error: appDeleteError } = await ctx.supabase
    .from('applications')
    .delete()
    .in('tryout_id', tryoutIds)

  if (appDeleteError) {
    return { error: 'Failed to remove related applications.' }
  }

  const { error } = await ctx.supabase.from('tryouts').delete().in('id', tryoutIds)

  if (error) {
    return { error: 'Failed to delete selected tryouts.' }
  }

  revalidatePath('/org/tryouts')
  revalidatePath('/org/applications')
  revalidatePath('/dashboard/tryouts')
  return { success: `${tryoutIds.length} tryout${tryoutIds.length === 1 ? '' : 's'} deleted.` }
})
