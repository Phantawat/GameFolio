import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import PlayerNavbar from '@/components/layout/PlayerNavbar'
import OrgNavbar from '@/components/layout/OrgNavbar'
import type { OrganizationMemberRole, UserRoleType } from '@/lib/database.types'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Check Authentication (handled by middleware too, but double-check here)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: roleRows } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)

  const roles = (roleRows ?? []).map((row) => row.role) as UserRoleType[]
  const hasPlayerRole = roles.includes('PLAYER')
  const hasOrgRole = roles.includes('ORG_ADMIN') || roles.includes('ORG_MEMBER')
  const cookieStore = await cookies()
  const preferredMode = cookieStore.get('gf_nav_mode')?.value
  const preferPlayer = preferredMode === 'player'

  let navbar: React.ReactNode

  if (hasOrgRole && !preferPlayer) {
    const { data: membership } = await supabase
      .from('organization_members')
      .select('organization_id, role, organizations(name, logo_url)')
      .eq('user_id', user.id)
      .in('role', ['OWNER', 'MANAGER', 'MEMBER'])
      .order('joined_at', { ascending: true })
      .limit(1)
      .maybeSingle()

    if (membership) {
      const orgId = membership.organization_id
      const { data: tryouts } = await supabase
        .from('tryouts')
        .select('id')
        .eq('organization_id', orgId)

      const tryoutIds = (tryouts ?? []).map((tryout) => tryout.id)

      let applicationCount = 0
      if (tryoutIds.length > 0) {
        const { count } = await supabase
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'PENDING')
          .in('tryout_id', tryoutIds)
        applicationCount = count ?? 0
      }

      const org = Array.isArray(membership.organizations)
        ? membership.organizations[0]
        : membership.organizations

      navbar = (
        <OrgNavbar
          orgName={org?.name ?? 'Organization'}
          orgLogoUrl={org?.logo_url ?? null}
          memberRole={(membership.role as OrganizationMemberRole) ?? 'MEMBER'}
          applicationCount={applicationCount}
          canSwitchToPlayer={hasPlayerRole}
        />
      )
    } else {
      const { data: profile } = await supabase
        .from('player_profiles')
        .select('gamertag')
        .eq('user_id', user.id)
        .maybeSingle()

      const fallbackName = user.email?.split('@')[0] ?? 'Player'
      navbar = (
        <PlayerNavbar
          gamertag={profile?.gamertag ?? fallbackName}
          avatarUrl={null}
          canSwitchToOrg={hasOrgRole}
        />
      )
    }
  } else {
    const { data: profile } = await supabase
      .from('player_profiles')
      .select('gamertag')
      .eq('user_id', user.id)
      .maybeSingle()

    const fallbackName = user.email?.split('@')[0] ?? 'Player'
    navbar = (
      <PlayerNavbar
        gamertag={profile?.gamertag ?? fallbackName}
        avatarUrl={null}
        canSwitchToOrg={hasOrgRole}
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#0F0A09] text-zinc-50 font-sans">
      {navbar}
      <main className="px-6 md:px-8 pt-24 pb-12 max-w-7xl mx-auto min-h-screen space-y-8">
        {children}
      </main>
    </div>
  )
}
