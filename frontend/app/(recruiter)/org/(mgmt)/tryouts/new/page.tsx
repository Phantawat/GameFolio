import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewTryoutForm from './_components/NewTryoutForm'

export const metadata = {
  title: 'Create Tryout | GameFolio',
  description: 'Post a new tryout listing for your roster.',
}

type NewTryoutSearchParams = {
  roster?: string
  edit?: string
  view?: string
}

function parseRequirements(value: string | null) {
  const lines = (value ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  let minRank = ''
  let apiVerify = false
  let regions: string[] = []
  const descriptionLines: string[] = []

  for (const line of lines) {
    if (line.startsWith('Minimum Rank:')) {
      minRank = line.replace('Minimum Rank:', '').trim()
      continue
    }
    if (line.startsWith('Regions:')) {
      regions = line
        .replace('Regions:', '')
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
      continue
    }
    if (line === 'API Verify: Required') {
      apiVerify = true
      continue
    }

    descriptionLines.push(line)
  }

  return {
    minRank,
    regions,
    apiVerify,
    description: descriptionLines.join('\n'),
  }
}

export default async function NewTryoutPage({
  searchParams,
}: {
  searchParams: Promise<NewTryoutSearchParams>
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

  let initialTryout: {
    id: string
    gameId: string
    roleNeededId: string | null
    rosterId: string | null
    title: string
    requirements: string | null
    isActive: boolean
  } | null = null

  if (params.edit) {
    const { data: tryout } = await supabase
      .from('tryouts')
      .select('id, game_id, role_needed_id, roster_id, title, requirements, is_active')
      .eq('id', params.edit)
      .eq('organization_id', orgId)
      .maybeSingle()

    if (!tryout) {
      redirect('/org/tryouts')
    }

    initialTryout = {
      id: tryout.id,
      gameId: tryout.game_id,
      roleNeededId: tryout.role_needed_id,
      rosterId: tryout.roster_id,
      title: tryout.title,
      requirements: tryout.requirements,
      isActive: tryout.is_active,
    }
  }

  const parsedRequirements = parseRequirements(initialTryout?.requirements ?? null)
  const mode = params.view === '1' ? 'view' : initialTryout ? 'edit' : 'create'

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black text-white">
          {mode === 'view' ? 'View Tryout Listing' : mode === 'edit' ? 'Edit Tryout Listing' : 'Create New Tryout Listing'}
        </h1>
        <p className="text-zinc-400 mt-1 text-sm">
          {mode === 'view'
            ? 'Review your tryout details.'
            : mode === 'edit'
              ? 'Update your posting details and publish changes.'
              : 'Fill in the details to find the perfect addition to your roster.'}
        </p>
      </div>

      <NewTryoutForm
        orgId={orgId}
        games={games ?? []}
        gameRoles={gameRoles ?? []}
        rosters={rosters ?? []}
        preSelectedRosterId={params.roster}
        mode={mode}
        initialTryout={
          initialTryout
            ? {
                id: initialTryout.id,
                gameId: initialTryout.gameId,
                roleNeededId: initialTryout.roleNeededId,
                rosterId: initialTryout.rosterId,
                title: initialTryout.title,
                isActive: initialTryout.isActive,
                minRankRequirement: parsedRequirements.minRank,
                selectedRegions: parsedRequirements.regions,
                apiVerify: parsedRequirements.apiVerify,
                description: parsedRequirements.description,
              }
            : undefined
        }
      />
    </div>
  )
}
