import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft, Building2, CalendarDays, Gamepad2, MessageSquare, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
    organizations: { name: string; logo_url: string | null } | null
    games: { name: string } | null
  } | null
}

const STATUS_MAP: Record<string, string> = {
  PENDING: 'Under Review',
  REVIEWING: 'Under Review',
  ACCEPTED: 'Accepted',
  REJECTED: 'Declined',
}

const STATUS_STYLE_MAP: Record<string, { badge: string; border: string; bg: string }> = {
  'Under Review': {
    badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    border: 'border-amber-500/20',
    bg: 'bg-amber-500/10',
  },
  Accepted: {
    badge: 'bg-green-500/10 text-green-500 border-green-500/20',
    border: 'border-green-500/20',
    bg: 'bg-green-500/10',
  },
  Declined: {
    badge: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20',
    border: 'border-zinc-800',
    bg: 'bg-zinc-500/5',
  },
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function getInitials(name: string) {
  return name.substring(0, 2).toUpperCase()
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
        organizations ( name, logo_url ),
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
  const orgInfo = tryout?.organizations
  const orgName = orgInfo?.name ?? 'Unknown Organization'
  const orgLogo = orgInfo?.logo_url
  const gameName = tryout?.games?.name
  const statusLabel = STATUS_MAP[application.status] ?? application.status
  const statusStyles = STATUS_STYLE_MAP[statusLabel] ?? STATUS_STYLE_MAP['Declined']

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <Link
        href="/dashboard/applications"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Applications
      </Link>

      <div className={`relative overflow-hidden rounded-2xl border bg-[#140C0B] ${statusStyles.border}`}>
        <div className={`absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full blur-3xl opacity-50 ${statusStyles.bg}`} />

        <div className="relative z-10 flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar className="h-16 w-16 shrink-0 border-2 border-zinc-800 bg-[#0F0A09]">
              {orgLogo ? <AvatarImage src={orgLogo} alt={orgName} className="object-cover" /> : null}
              <AvatarFallback className="bg-zinc-800 text-xl font-bold text-zinc-300">
                {getInitials(orgName)}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1.5">
              <h1 className="text-2xl font-bold leading-tight tracking-wide text-white sm:text-3xl">
                {tryout?.title ?? 'Tryout Application'}
              </h1>
              <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-zinc-400">
                <span className="flex items-center gap-1.5 text-orange-500">
                  <Building2 className="h-4 w-4 shrink-0" />
                  <span className="max-w-[200px] truncate">{orgName}</span>
                </span>
                <span className="hidden text-zinc-600 sm:inline">•</span>
                <span className="flex items-center gap-1.5">
                  <Gamepad2 className="h-4 w-4 shrink-0" />
                  <span className="max-w-[200px] truncate">{gameName ?? 'Game not specified'}</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-row items-center justify-between gap-3 border-t border-zinc-800/50 pt-4 md:w-auto md:flex-col md:items-end md:border-0 md:pt-0">
            <div className="flex flex-col items-start gap-1.5 md:items-end">
              <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">Current Status</p>
              <Badge variant="outline" className={`rounded-full border px-4 py-1.5 font-bold tracking-wide ${statusStyles.badge}`}>
                <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                {statusLabel}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-zinc-800 bg-[#140C0B] shadow-sm">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
                <MessageSquare className="h-5 w-5 text-orange-500" />
                Your Application Message
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {application.message?.trim() ? (
                <div className="whitespace-pre-wrap rounded-xl border border-zinc-800/80 bg-[#0F0A09] p-5 text-sm leading-relaxed text-zinc-300">
                  {application.message}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-800 bg-[#0F0A09]/50 p-6 text-center">
                  <p className="text-sm italic text-zinc-500">No message was included with this application.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-[#140C0B] shadow-sm">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
                <Trophy className="h-5 w-5 text-orange-500" />
                Role Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {tryout?.requirements?.trim() ? (
                <div className="whitespace-pre-wrap rounded-xl border border-zinc-800/80 bg-[#0F0A09] p-5 text-sm leading-relaxed text-zinc-300">
                  {tryout.requirements}
                </div>
              ) : (
                <p className="text-sm italic text-zinc-500">No specific requirements were provided in the original posting.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <Card className="border-zinc-800 bg-[#140C0B] shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <CalendarDays className="h-3.5 w-3.5" /> Date Applied
                </p>
                <p className="pl-5 text-sm font-medium text-white">{formatDate(application.created_at)}</p>
              </div>

              <Separator className="bg-zinc-800" />

              <div>
                <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <Building2 className="h-3.5 w-3.5" /> Tryout Host
                </p>
                <p className="pl-5 text-sm font-medium text-white">{orgName}</p>
              </div>

              <Separator className="bg-zinc-800" />

              <div>
                <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <Gamepad2 className="h-3.5 w-3.5" /> Selected Title
                </p>
                <p className="pl-5 text-sm font-medium text-white">{gameName ?? 'Unknown'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
