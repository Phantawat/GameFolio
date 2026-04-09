'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/safe-action'

export async function updateOrganizationLogo(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to update organization logo.' }
  }

  const file = formData.get('logo') as File | null
  if (!file || file.size === 0) {
    return { error: 'Please choose an image file.' }
  }

  if (!file.type.startsWith('image/')) {
    return { error: 'Only image files are allowed.' }
  }

  if (file.size > 5 * 1024 * 1024) {
    return { error: 'Logo file is too large. Max size is 5MB.' }
  }

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, organizations(logo_url)')
    .eq('user_id', user.id)
    .in('role', ['OWNER', 'MANAGER'])
    .order('joined_at', { ascending: true })
    .limit(1)
    .maybeSingle()

  if (!membership) {
    return { error: 'You do not have permission to update organization logo.' }
  }

  const org = Array.isArray(membership.organizations)
    ? membership.organizations[0]
    : membership.organizations

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
  const path = `${membership.organization_id}/${user.id}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('organization_logos')
    .upload(path, file, { upsert: false })

  if (uploadError) {
    return { error: 'Failed to upload logo. Please try again.' }
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from('organization_logos').getPublicUrl(path)

  const { error: updateError } = await supabase
    .from('organizations')
    .update({
      logo_url: publicUrl,
      updated_at: new Date().toISOString(),
    })
    .eq('id', membership.organization_id)

  if (updateError) {
    return { error: 'Logo uploaded but organization update failed. Please try again.' }
  }

  if (org?.logo_url) {
    const marker = '/storage/v1/object/public/organization_logos/'
    const idx = org.logo_url.indexOf(marker)
    const oldPath = idx >= 0 ? org.logo_url.slice(idx + marker.length) : null
    if (oldPath) {
      await supabase.storage.from('organization_logos').remove([oldPath])
    }
  }

  revalidatePath('/dashboard/settings')
  revalidatePath('/org/rosters')
  revalidatePath('/dashboard')

  return { success: 'Organization logo updated successfully.' }
}
