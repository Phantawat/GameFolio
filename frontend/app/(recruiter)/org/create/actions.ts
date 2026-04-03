'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/lib/safe-action'

export async function createOrganization(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'You must be logged in to perform this action.' }

  const name = (formData.get('name') as string | null)?.trim()
  if (!name || name.length < 2) {
    return { error: 'Organization name must be at least 2 characters.' }
  }

  const websiteUrl = (formData.get('website_url') as string | null)?.trim()
  const twitterHandle = (formData.get('twitter_handle') as string | null)?.trim()
  const logoFile = formData.get('logo') as File | null

  // Combine website/twitter into description since schema has no dedicated columns
  const descParts: string[] = []
  if (websiteUrl) descParts.push(`Website: ${websiteUrl}`)
  if (twitterHandle) descParts.push(`Twitter: @${twitterHandle.replace(/^@/, '')}`)

  // Upload logo if provided
  let logoUrl: string | null = null
  if (logoFile && logoFile.size > 0) {
    const ext = logoFile.name.split('.').pop() ?? 'png'
    const path = `${user.id}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('organization_logos')
      .upload(path, logoFile, { upsert: true })

    if (!uploadError) {
      const { data: pub } = supabase.storage
        .from('organization_logos')
        .getPublicUrl(path)
      logoUrl = pub.publicUrl
    }
  }

  // Create the organization
  const { data: org, error: orgError } = await supabase
    .from('organizations')
    .insert({
      name,
      description: descParts.length > 0 ? descParts.join('\n') : null,
      logo_url: logoUrl,
    })
    .select('id')
    .single()

  if (orgError) {
    if (orgError.code === '23505') {
      return { error: 'An organization with this name already exists.' }
    }
    return { error: `Failed to create organization: ${orgError.message}` }
  }

  // Add user as OWNER
  const { error: memberError } = await supabase.from('organization_members').insert({
    organization_id: org.id,
    user_id: user.id,
    role: 'OWNER',
  })

  if (memberError) {
    return { error: `Organization created but failed to set up membership: ${memberError.message}` }
  }

  // Grant ORG_ADMIN role
  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({ user_id: user.id, role: 'ORG_ADMIN' }, { onConflict: 'user_id,role' })

  if (roleError) {
    // Org access is controlled by organization_members OWNER/MANAGER checks.
    // Keep UX flow intact even if role sync is temporarily blocked by RLS.
    console.warn('[createOrganization] ORG_ADMIN role upsert failed:', roleError.message)
  }

  revalidatePath('/org/rosters')
  redirect('/org/rosters')
}
