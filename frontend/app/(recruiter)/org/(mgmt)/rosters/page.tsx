import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Building2 } from 'lucide-react'
import Link from 'next/link'
import RosterCard, { type RosterCardData } from './_components/RosterCard'
import NewRosterModal from './_components/NewRosterModal'

export const metadata = {
  title: 'Your Rosters | GameFolio',
  description: 'Manage your organization rosters.',
}

export default async function RostersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get the user's organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, organizations(id, name, logo_url)')
    .eq('user_id', user.id)
    .in('role', ['OWNER', 'MANAGER'])
    .maybeSingle()

  if (!membership) redirect('/org/create')

  const orgId = membership.organization_id

  // Fetch rosters with game info
  const { data: rawRosters } = await supabase
    .from('rosters')
    .select('id, name, description, game_id, organization_id, games(name)')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })

  // Fetch member counts per roster
  const rosters: RosterCardData[] = await Promise.all(
    (rawRosters ?? []).map(async (r) => {
      const { count } = await supabase
        .from('roster_members')
        .select('*', { count: 'exact', head: true })
        .eq('roster_id', r.id)

      return {
        id: r.id,
        name: r.name,
        game_id: r.game_id,
        games: Array.isArray(r.games) ? (r.games[0] ?? null) : r.games,
        member_count: count ?? 0,
      }
    })
  )

  // All active games for the New Roster modal
  const { data: games } = await supabase
    .from('games')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-zinc-500 uppercase tracking-widest font-medium">
        <span>Organization</span>
        <span>›</span>
        <span className="text-zinc-300">Management</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-black text-white">Your Rosters</h1>
        <NewRosterModal orgId={orgId} games={games ?? []} />
      </div>

      {/* Roster Grid */}
      {rosters.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Building2 className="w-16 h-16 text-zinc-700 mb-4" />
          <h2 className="text-xl font-bold text-zinc-300">No Rosters Yet</h2>
          <p className="text-zinc-500 mt-2 text-sm max-w-sm">
            Create your first roster to start building your team.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {rosters.map((roster) => (
            <RosterCard key={roster.id} roster={roster} />
          ))}
        </div>
      )}

      {/* Expand CTA */}
      <div className="bg-[#1a0e0c] border border-zinc-800 rounded-xl p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-black text-white">Expand Your Organization</h2>
            <p className="text-zinc-400 mt-2 text-sm max-w-md leading-relaxed">
              Ready to compete in more titles? Add new rosters to track player performance,
              manage tournament registrations, and scout new talent automatically.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href="/org/applications"
              className="px-4 py-2 rounded-lg border border-zinc-700 text-zinc-300 text-sm font-medium hover:border-zinc-500 hover:text-white transition-colors"
            >
              View Analytics
            </Link>
            <NewRosterModal orgId={orgId} games={games ?? []} variant="create-now" />
          </div>
        </div>
      </div>
    </div>
  )
}
