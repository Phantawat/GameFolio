import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, CalendarDays, MessageSquare, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { createClient } from '@/lib/supabase/server'

type RawApplication = {
  id: string
  status: string
  message: string | null
  created_at: string
  tryouts: {
    title: string
    requirements: string | null
    organizations: { name: string } | null
    games: { name: string } | null
  } | null
}

const STATUS_MAP: Record<string, string> = {
  PENDING: 'Under Review',
  REVIEWING: 'Under Review',
  ACCEPTED: 'Accepted',
  REJECTED: 'Declined',
}

const STATUS_BADGE_CLASS_MAP: Record<string, string> = {
  'Under Review': 'bg-amber-500/20 text-amber-500 border-amber-500/20',
  Accepted: 'bg-green-500/20 text-green-500 border-green-500/20',
  Declined: 'bg-zinc-500/20 text-zinc-400 border-zinc-500/20',
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export default async function PlayerApplicationDetailPage({
  params,
}: {
  params: Promise<{ applicationId: string }>
}) {
  const { applicationId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (!profile) redirect('/dashboard')

  const { data: rawApplication } = await supabase
    .from('applications')
    .select(
      `
      id,
      status,
      message,
      created_at,
      tryouts (
        title,
        requirements,
        organizations ( name ),
        games ( name )
      )
    `
    )
    .eq('id', applicationId)
    .eq('player_profile_id', profile.id)
    .maybeSingle()

  if (!rawApplication) redirect('/dashboard/applications')

  const application = rawApplication as RawApplication
  const tryout = application.tryouts
  const orgName = tryout?.organizations?.name ?? 'Unknown Organization'
  const gameName = tryout?.games?.name
  const statusLabel = STATUS_MAP[application.status] ?? application.status
  const statusClass =
    STATUS_BADGE_CLASS_MAP[statusLabel] ?? 'bg-zinc-500/20 text-zinc-400 border-zinc-500/20'

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">Application Details</h1>
          <p className="mt-1 text-sm text-zinc-400">Review your application and current status.</p>
        </div>

        <Link
          href="/dashboard/applications"
          className="inline-flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
      </div>

      <Card className="border-zinc-800 bg-[#140C0B]">
        <CardHeader className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="text-sm text-zinc-400">Organization</p>
              <CardTitle className="text-white">{orgName}</CardTitle>
            </div>

            <Badge variant="outline" className={`border px-3 py-1 font-medium ${statusClass}`}>
              {statusLabel}
            </Badge>
          </div>

          <Separator className="bg-zinc-800" />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-800 bg-[#0F0A09] p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Tryout</p>
              <p className="mt-2 text-sm font-medium text-zinc-200">{tryout?.title ?? 'Unknown Tryout'}</p>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-[#0F0A09] p-4">
              <p className="text-xs uppercase tracking-wide text-zinc-500">Game</p>
              <p className="mt-2 text-sm font-medium text-zinc-200">{gameName ?? 'Not specified'}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-lg border border-zinc-800 bg-[#0F0A09] p-4">
            <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
              <MessageSquare className="h-4 w-4" />
              Your Message
            </p>
            <p className="text-sm leading-6 text-zinc-300">
              {application.message?.trim() || 'No message was included with this application.'}
            </p>
          </div>

          <div className="rounded-lg border border-zinc-800 bg-[#0F0A09] p-4">
            <p className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500">
              <Trophy className="h-4 w-4" />
              Tryout Requirements
            </p>
            <p className="text-sm leading-6 text-zinc-300">
              {tryout?.requirements?.trim() || 'No specific requirements were provided.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <CalendarDays className="h-4 w-4" />
            Applied on {formatDate(application.created_at)}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
