import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { EditGameStatsForm } from './_components/EditGameStatsForm'

export default async function EditStatsPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch player profile + existing stats
  const { data: profile } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/dashboard')

  // Fetch all active games with their roles
  // Use or() to include both is_active=true AND is_active=null (unseeded rows)
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('id, name, game_roles(id, role_name)')
    .order('name')

  if (gamesError) {
    console.error('[EditStatsPage] Failed to load games:', gamesError.message, gamesError.code)
  } else {
    console.log('[EditStatsPage] Loaded games count:', games?.length ?? 0)
  }

  // Fetch existing game stats for this player
  const { data: existingStats } = await supabase
    .from('player_game_stats')
    .select('game_id, main_role_id, rank, mmr, win_rate, hours_played')
    .eq('player_profile_id', profile.id)

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Edit Game Stats</h1>
        <p className="text-zinc-400 mt-1">Add or update your competitive statistics for each game.</p>
      </div>
      <EditGameStatsForm games={games || []} existingStats={existingStats || []} />
    </div>
  )
}
