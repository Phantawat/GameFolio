import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { TryoutFilterGrid, type TryoutItem } from './_components/TryoutFilterGrid'

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
  const { data: tryouts } = await supabase
    .from('tryouts')
    .select(
      `
      id,
      title,
      requirements,
      job_description,
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

  // Transform data for the client filter component
  const tryoutItems: TryoutItem[] = (tryouts ?? []).map((tryout) => ({
    id: tryout.id,
    title: tryout.title,
    requirements: tryout.requirements,
    job_description: tryout.job_description,
    created_at: tryout.created_at,
    org: (Array.isArray(tryout.organizations) ? tryout.organizations[0] : tryout.organizations) as TryoutItem['org'],
    game: (Array.isArray(tryout.games) ? tryout.games[0] : tryout.games) as TryoutItem['game'],
    role: (Array.isArray(tryout.game_roles) ? tryout.game_roles[0] : tryout.game_roles) as TryoutItem['role'],
    alreadyApplied: appliedTryoutIds.has(tryout.id),
  }))

  // Extract unique game names and roles for filter pills
  const allGames = [...new Set(tryoutItems.map((t) => t.game?.name).filter(Boolean))] as string[]
  const allRoles = [...new Set(tryoutItems.map((t) => t.role?.role_name).filter(Boolean))] as string[]

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">
            Browse Tryouts
          </h1>
          <p className="text-zinc-400 mt-1 text-sm">
            {tryoutItems.length} active opportunity{tryoutItems.length !== 1 ? 's' : ''} available
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#FF5C00]/10 border border-[#FF5C00]/20 text-[#FF5C00] text-sm font-medium px-4 py-2 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-[#FF5C00] animate-pulse" />
          Live Listings
        </div>
      </div>

      <TryoutFilterGrid tryouts={tryoutItems} allGames={allGames} allRoles={allRoles} />
    </div>
  )
}
