import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import OrgMgmtShell from './_components/OrgMgmtShell'
import type { OrganizationMemberRole } from '@/lib/database.types'

export default async function OrgMgmtLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const cookieStore = await cookies()
  const preferredMode = cookieStore.get('gf_nav_mode')?.value

  const { data: playerProfile } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  const canSwitchToPlayer = Boolean(playerProfile)

  if (preferredMode === 'player' && canSwitchToPlayer) {
    redirect('/dashboard/player')
  }

  // Ensure the user is an owner or manager of some organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, role, organizations(name, logo_url)')
    .eq('user_id', user.id)
    .in('role', ['OWNER', 'MANAGER', 'MEMBER'])
    .maybeSingle()

  if (!membership) redirect('/org/create')

  const org = Array.isArray(membership.organizations)
    ? membership.organizations[0]
    : membership.organizations

  const { data: tryouts } = await supabase
    .from('tryouts')
    .select('id')
    .eq('organization_id', membership.organization_id)

  const tryoutIds = (tryouts ?? []).map((t) => t.id)
  let applicationCount = 0
  if (tryoutIds.length > 0) {
    const { count } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING')
      .in('tryout_id', tryoutIds)
    applicationCount = count ?? 0
  }

  return (
    <OrgMgmtShell
      orgName={org?.name ?? 'Organization'}
      orgLogoUrl={org?.logo_url ?? null}
      memberRole={(membership.role as OrganizationMemberRole) ?? 'MEMBER'}
      applicationCount={applicationCount}
      canSwitchToPlayer={canSwitchToPlayer}
    >
      {children}
    </OrgMgmtShell>
  )
}
