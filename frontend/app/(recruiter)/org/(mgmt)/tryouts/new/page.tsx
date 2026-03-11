import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewTryoutForm from './_components/NewTryoutForm'

export const metadata = {
  title: 'Create Tryout | GameFolio',
  description: 'Post a new tryout listing for your roster.',
}

export default async function NewTryoutPage({
  searchParams,
}: {
  searchParams: Promise<{ roster?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams

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

  // Fetch active games
  const { data: games } = await supabase
    .from('games')
    .select('id, name')
    .eq('is_active', true)
    .order('name')

  // Fetch all game roles
  const { data: gameRoles } = await supabase
    .from('game_roles')
    .select('id, game_id, role_name')
    .order('role_name')

  // Fetch org rosters
  const { data: rosters } = await supabase
    .from('rosters')
    .select('id, name')
    .eq('organization_id', orgId)
    .order('name')

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-white">Create New Tryout Listing</h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Fill in the details to find the perfect addition to your roster.
        </p>
      </div>

      <NewTryoutForm
        orgId={orgId}
        games={games ?? []}
        gameRoles={gameRoles ?? []}
        rosters={rosters ?? []}
        preSelectedRosterId={params.roster}
      />
    </div>
  )
}
