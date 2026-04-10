import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ApplicationsTable, {
  type ApplicationRow,
} from './_components/ApplicationsTable'

export const metadata = {
  title: 'Incoming Applications | GameFolio',
  description: 'Review and manage candidates for your active team tryouts.',
}

export default async function OrgApplicationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .in('role', ['OWNER', 'MANAGER'])
    .maybeSingle()

  if (!membership) redirect('/org/create')

  const orgId = membership.organization_id

  // Fetch tryout IDs for this org
  const { data: tryoutRows } = await supabase
    .from('tryouts')
    .select('id, title, games(name)')
    .eq('organization_id', orgId)
    .is('deleted_at', null)

  const tryoutIds = (tryoutRows ?? []).map((t) => t.id)

  if (tryoutIds.length === 0) {
    return (
      <ApplicationsTable
        applications={[]}
        stats={{ total: 0, pending: 0, approvedToday: 0 }}
      />
    )
  }

  // Fetch applications for those tryouts with player profile data
  const { data: rawApps } = await supabase
    .from('applications')
    .select(
      `
      id,
      status,
      created_at,
      tryout_id,
      player_profiles!inner(
        id,
        gamertag,
        player_game_stats(rank, game_id)
      ),
      tryouts!inner(title, game_id, games(name))
    `
    )
    .in('tryout_id', tryoutIds)
    .order('created_at', { ascending: false })

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const applications: ApplicationRow[] = (rawApps ?? []).map((app) => {
    const profile = Array.isArray(app.player_profiles)
      ? app.player_profiles[0]
      : app.player_profiles
    const tryout = Array.isArray(app.tryouts) ? app.tryouts[0] : app.tryouts
    const game = tryout
      ? Array.isArray((tryout as { games?: { name: string } | { name: string }[] }).games)
        ? ((tryout as { games: { name: string }[] }).games[0]?.name ?? null)
        : ((tryout as { games: { name: string } | null }).games?.name ?? null)
      : null

    // Pick rank from the stat that matches this tryout's game
    const stats = (profile as { player_game_stats?: { rank: string | null; game_id: string }[] })
      ?.player_game_stats
    const matchingStat = stats?.find((s: { game_id: string }) => s.game_id === tryout?.game_id)
    const rank = matchingStat?.rank ?? stats?.[0]?.rank ?? null

    return {
      id: app.id,
      status: app.status,
      created_at: app.created_at,
      gamertag: (profile as { gamertag: string })?.gamertag ?? 'Unknown',
      player_profile_id: (profile as { id: string })?.id ?? '',
      tryout_title: (tryout as { title: string })?.title ?? 'Unknown Tryout',
      game_name: game,
      rank,
    }
  })

  const stats = {
    total: applications.length,
    pending: applications.filter(
      (a) => a.status === 'PENDING' || a.status === 'REVIEWING'
    ).length,
    approvedToday: applications.filter(
      (a) =>
        a.status === 'ACCEPTED' && new Date(a.created_at) >= todayStart
    ).length,
  }

  return <ApplicationsTable applications={applications} stats={stats} />
}
