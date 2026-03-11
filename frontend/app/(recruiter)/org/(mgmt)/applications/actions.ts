'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createSafeAction } from '@/lib/safe-action'

const updateStatusSchema = z.object({
  application_id: z.string().uuid('Invalid application.'),
  status: z.enum(['REVIEWING', 'ACCEPTED', 'REJECTED']),
})

export const updateApplicationStatus = createSafeAction(
  updateStatusSchema,
  async (data, ctx) => {
    // Resolve the org that owns this application's tryout
    const { data: app } = await ctx.supabase
      .from('applications')
      .select('id, tryouts!inner(organization_id)')
      .eq('id', data.application_id)
      .maybeSingle()

    if (!app) return { error: 'Application not found.' }

    const tryout = Array.isArray(app.tryouts) ? app.tryouts[0] : app.tryouts
    const orgId = (tryout as { organization_id: string } | null)?.organization_id

    if (!orgId) return { error: 'Could not resolve organization.' }

    // Verify current user is an owner or manager of that org
    const { data: membership } = await ctx.supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', orgId)
      .eq('user_id', ctx.user.id)
      .in('role', ['OWNER', 'MANAGER'])
      .maybeSingle()

    if (!membership) return { error: 'Permission denied.' }

    const { error } = await ctx.supabase
      .from('applications')
      .update({ status: data.status, updated_at: new Date().toISOString() })
      .eq('id', data.application_id)

    if (error) return { error: 'Failed to update application status.' }

    revalidatePath('/org/applications')
    return { success: `Application marked as ${data.status.toLowerCase()}.` }
  }
)
