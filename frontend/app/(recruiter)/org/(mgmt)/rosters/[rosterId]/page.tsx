import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { RosterMembersList } from './_components/RosterMembersList'
import { Badge } from '@/components/ui/badge'
import { Gamepad2, Users, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function RosterDetailPage({
  params,
}: {
  params: Promise<{ rosterId: string }>
}) {
  const { rosterId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch roster with game info
  const { data: roster } = await supabase
    .from('rosters')
    .select('id, name, organization_id, game_id, games(name)')
    .eq('id', rosterId)
    .maybeSingle()

  if (!roster) notFound()

  // Verify user is OWNER/MANAGER of this org
  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', roster.organization_id)
    .eq('user_id', user.id)
    .in('role', ['OWNER', 'MANAGER'])
    .maybeSingle()

  if (!membership) redirect('/org/create')

  // Fetch roster members with player info
  const { data: members } = await supabase
    .from('roster_members')
    .select(`
      id,
      role_in_roster,
      joined_at,
      player_profiles ( id, gamertag, region )
    `)
    .eq('roster_id', rosterId)
    .order('joined_at', { ascending: true })

  const memberRows = (members ?? []).map((m) => {
    const profile = Array.isArray(m.player_profiles) ? m.player_profiles[0] : m.player_profiles
    return {
      id: m.id,
      gamertag: profile?.gamertag ?? 'Unknown',
      region: profile?.region ?? null,
      roleInRoster: m.role_in_roster,
      joinedAt: m.joined_at,
    }
  })

  const gameName = Array.isArray(roster.games) ? roster.games[0]?.name : (roster.games as { name: string } | null)?.name

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link
        href="/org/rosters"
        className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Rosters
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">{roster.name}</h1>
          <div className="flex items-center gap-3 mt-2">
            {gameName && (
              <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-xs gap-1">
                <Gamepad2 className="w-3 h-3" />
                {gameName}
              </Badge>
            )}
            <Badge className="bg-[#FF5C00]/10 text-[#FF5C00] border-[#FF5C00]/20 text-xs gap-1">
              <Users className="w-3 h-3" />
              {memberRows.length} member{memberRows.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
      </div>

      <RosterMembersList rosterId={rosterId} members={memberRows} />
    </div>
  )
}
