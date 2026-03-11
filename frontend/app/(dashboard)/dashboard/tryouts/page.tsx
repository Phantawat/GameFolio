import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ApplyButton } from './_components/ApplyButton'
import { Badge } from '@/components/ui/badge'
import { Gamepad2, Users, MapPin, Clock } from 'lucide-react'

export const metadata = {
  title: 'Browse Tryouts | GameFolio',
  description: 'Find teams and apply to active tryouts.',
}

export default async function TryoutsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Get the logged-in player's profile id (to check existing applications)
  const { data: profile } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // Fetch all active tryouts with org, game, and role info
  // neq(false) also includes rows where is_active is NULL (seed edge case)
  const { data: tryouts } = await supabase
    .from('tryouts')
    .select(
      `
      id,
      title,
      requirements,
      is_active,
      created_at,
      organizations ( name, logo_url, region ),
      games ( name ),
      game_roles ( role_name )
    `
    )
    .neq('is_active', false)
    .order('created_at', { ascending: false })

  // Fetch the current player's existing applications to show "Applied" state
  const { data: myApplications } = profile
    ? await supabase
        .from('applications')
        .select('tryout_id')
        .eq('player_profile_id', profile.id)
    : { data: [] }

  const appliedTryoutIds = new Set(myApplications?.map((a) => a.tryout_id) ?? [])

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Browse Tryouts
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">
            {tryouts?.length ?? 0} active opportunity{(tryouts?.length ?? 0) !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#FF5C00]/10 border border-[#FF5C00]/20 text-[#FF5C00] text-sm font-medium px-4 py-2 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-[#FF5C00] animate-pulse" />
          Live Listings
        </div>
      </div>

      {/* Tryout Grid */}
      {!tryouts || tryouts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Gamepad2 className="w-16 h-16 text-zinc-700 mb-4" />
          <h2 className="text-xl font-bold text-zinc-300">No Active Tryouts</h2>
          <p className="text-zinc-500 mt-2 text-sm max-w-sm">
            Check back soon — organizations will be posting tryouts here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {tryouts.map((tryout) => {
            const org = (Array.isArray(tryout.organizations) ? tryout.organizations[0] : tryout.organizations) as { name: string; logo_url: string | null; region: string | null } | null
            const game = (Array.isArray(tryout.games) ? tryout.games[0] : tryout.games) as { name: string } | null
            const role = (Array.isArray(tryout.game_roles) ? tryout.game_roles[0] : tryout.game_roles) as { role_name: string } | null
            const alreadyApplied = appliedTryoutIds.has(tryout.id)

            return (
              <div
                key={tryout.id}
                className="bg-[#140C0B] border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all group flex flex-col"
              >
                {/* Card Top Accent */}
                <div className="h-1 w-full bg-gradient-to-r from-[#FF5C00] to-orange-400" />

                <div className="p-5 flex flex-col gap-4 flex-1">
                  {/* Org Info */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-black text-zinc-400 shrink-0 overflow-hidden">
                      {org?.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={org.logo_url} alt={org.name} className="w-full h-full object-cover" />
                      ) : (
                        <span>{(org?.name ?? 'O').charAt(0)}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-bold text-sm truncate leading-tight">{org?.name ?? 'Unknown Org'}</p>
                      {org?.region && (
                        <div className="flex items-center gap-1 text-zinc-500 text-xs mt-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{org.region}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-white font-bold text-base leading-tight group-hover:text-[#FF5C00] transition-colors line-clamp-2">
                      {tryout.title}
                    </h3>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    {game && (
                      <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 hover:bg-zinc-700 text-xs gap-1">
                        <Gamepad2 className="w-3 h-3" />
                        {game.name}
                      </Badge>
                    )}
                    {role && (
                      <Badge className="bg-[#FF5C00]/10 text-[#FF5C00] border-[#FF5C00]/20 text-xs gap-1">
                        <Users className="w-3 h-3" />
                        {role.role_name}
                      </Badge>
                    )}
                  </div>

                  {/* Requirements */}
                  {tryout.requirements && (
                    <p className="text-zinc-400 text-xs leading-relaxed line-clamp-3 flex-1">
                      {tryout.requirements}
                    </p>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
                    <div className="flex items-center gap-1 text-zinc-500 text-xs">
                      <Clock className="w-3 h-3" />
                      <span>
                        {new Date(tryout.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="w-32">
                      <ApplyButton tryoutId={tryout.id} alreadyApplied={alreadyApplied} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
