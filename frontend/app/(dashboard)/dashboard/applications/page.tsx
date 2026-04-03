import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ApplicationsContent } from './_components/ApplicationsContent'
import type { Application } from './_components/ApplicationsList'

export const metadata = {
  title: 'My Applications | GameFolio',
  description: 'Track your tryout applications.',
}

const STATUS_MAP: Record<string, string> = {
  PENDING: 'Under Review',
  REVIEWING: 'Under Review',
  ACCEPTED: 'Accepted',
  REJECTED: 'Declined',
}

const STATUS_COLOR_MAP: Record<string, string> = {
  'Under Review': 'bg-amber-500/20 text-amber-500 border-amber-500/20',
  Accepted: 'bg-green-500/20 text-green-500 border-green-500/20',
  Declined: 'bg-zinc-500/20 text-zinc-500 border-zinc-500/20',
}

type RawApplication = {
  id: string
  status: string
  message: string | null
  created_at: string
  tryouts: {
    title: string
    organizations: { name: string; logo_url: string | null } | null
    games: { name: string } | null
  } | null
}

export default async function ApplicationsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/dashboard')

  const { data: rawApplications } = await supabase
    .from('applications')
    .select(
      `
      id,
      status,
      message,
      created_at,
      tryouts (
        title,
        organizations ( name, logo_url ),
        games ( name )
      )
    `
    )
    .eq('player_profile_id', profile.id)
    .order('created_at', { ascending: false })

  const applications: Application[] = ((rawApplications as RawApplication[] | null) ?? []).map(
    (app) => {
      const org = app.tryouts?.organizations
      const game = app.tryouts?.games
      const displayStatus = STATUS_MAP[app.status] ?? app.status
      const orgName = org?.name ?? 'Unknown Org'

      return {
        id: app.id,
        orgName,
        logo: org?.logo_url ?? '',
        initial: orgName.slice(0, 2).toUpperCase(),
        verified: false,
        role: [app.tryouts?.title, game?.name].filter(Boolean).join(' – '),
        status: displayStatus,
        statusColor:
          STATUS_COLOR_MAP[displayStatus] ??
          'bg-zinc-500/20 text-zinc-500 border-zinc-500/20',
        appliedDate: `Applied on ${new Date(app.created_at).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })}`,
      }
    }
  )

  return <ApplicationsContent applications={applications} />
}
