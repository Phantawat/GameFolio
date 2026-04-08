import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  CalendarDays,
  Cpu,
  Gamepad2,
  MapPin,
  Monitor,
  MousePointer2,
  ScrollText,
  Shield,
  Trophy,
  UserRound,
  Video,
} from 'lucide-react'

type ExperienceData = {
  year: string
  role: string
  game: string
  team: string
  highlights: string
}

type HardwareData = {
  mouse: string
  keyboard: string
  mousepad: string
  headset: string
  monitor: string
}

function parseExperienceList(value?: string | null): ExperienceData[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value) as unknown

    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => {
          const item = entry as Partial<ExperienceData>
          return {
            year: item.year ?? '',
            role: item.role ?? '',
            game: item.game ?? '',
            team: item.team ?? '',
            highlights: item.highlights ?? '',
          }
        })
        .filter((entry) =>
          Boolean(entry.year.trim() || entry.role.trim() || entry.game.trim() || entry.team.trim() || entry.highlights.trim())
        )
    }
  } catch {
    // Fallback for legacy free-text experience entries.
    return [
      {
        year: '',
        role: '',
        game: '',
        team: '',
        highlights: value,
      },
    ]
  }

  return []
}

function parseHardware(value?: string | null): HardwareData {
  const empty: HardwareData = {
    mouse: '',
    keyboard: '',
    mousepad: '',
    headset: '',
    monitor: '',
  }

  if (!value) return empty

  try {
    const parsed = JSON.parse(value) as Partial<HardwareData>
    return {
      mouse: parsed.mouse ?? '',
      keyboard: parsed.keyboard ?? '',
      mousepad: parsed.mousepad ?? '',
      headset: parsed.headset ?? '',
      monitor: parsed.monitor ?? '',
    }
  } catch {
    return {
      ...empty,
      mouse: value,
    }
  }
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

function formatDuration(seconds: number) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

function getInitials(gamertag: string) {
  return gamertag.slice(0, 2).toUpperCase()
}

function getStatusStyle(status: string) {
  switch (status.toUpperCase()) {
    case 'REVIEWING':
      return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
    case 'ACCEPTED':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'REJECTED':
      return 'bg-zinc-600/30 text-zinc-400 border-zinc-600/30'
    default:
      return 'bg-zinc-700/30 text-zinc-400 border-zinc-700/40'
  }
}

export default async function OrgApplicationProfilePage({
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

  const { data: appRow } = await supabase
    .from('applications')
    .select(
      `
      id,
      status,
      message,
      created_at,
      player_profile_id,
      tryouts!inner(
        title,
        game_id,
        organization_id,
        games(name),
        role_needed:game_roles(role_name)
      ),
      player_profiles!inner(
        id,
        gamertag,
        region,
        bio,
        competitive_experience,
        hardware_details
      )
    `
    )
    .eq('id', applicationId)
    .maybeSingle()

  if (!appRow) {
    redirect('/org/applications')
  }

  const tryout = Array.isArray(appRow.tryouts) ? appRow.tryouts[0] : appRow.tryouts
  const profile = Array.isArray(appRow.player_profiles) ? appRow.player_profiles[0] : appRow.player_profiles

  const { data: membership } = await supabase
    .from('organization_members')
    .select('id')
    .eq('user_id', user.id)
    .eq('organization_id', tryout.organization_id)
    .in('role', ['OWNER', 'MANAGER'])
    .maybeSingle()

  if (!membership) {
    redirect('/org/applications')
  }

  const { data: rawStats } = await supabase
    .from('player_game_stats')
    .select(
      `
      id,
      rank,
      mmr,
      win_rate,
      games(name),
      main_role:game_roles!player_game_stats_main_role_id_fkey(role_name)
      `
    )
    .eq('player_profile_id', profile.id)

  const { data: highlights } = await supabase
    .from('player_highlights')
    .select('id, title, video_url, duration_seconds, created_at')
    .eq('player_profile_id', profile.id)
    .order('created_at', { ascending: false })

  const gameName = Array.isArray(tryout.games) ? (tryout.games[0]?.name ?? null) : (tryout.games?.name ?? null)
  const roleName = Array.isArray(tryout.role_needed)
    ? (tryout.role_needed[0]?.role_name ?? null)
    : (tryout.role_needed?.role_name ?? null)

  const stats = (rawStats ?? []).map((row) => {
    const game = Array.isArray(row.games) ? (row.games[0]?.name ?? 'Unknown Game') : (row.games?.name ?? 'Unknown Game')
    const mainRole = Array.isArray(row.main_role)
      ? (row.main_role[0]?.role_name ?? 'Flex')
      : (row.main_role?.role_name ?? 'Flex')

    return {
      id: row.id,
      game,
      rank: row.rank ?? 'Unranked',
      mmr: row.mmr ?? 0,
      winRate: Number(row.win_rate) || 0,
      mainRole,
    }
  })

  const experiences = parseExperienceList(profile.competitive_experience)
  const hardware = parseHardware(profile.hardware_details)
  const submittedDate = formatDate(appRow.created_at)
  const highlightCount = (highlights ?? []).length
  const averageWinRate =
    stats.length > 0
      ? Math.round(stats.reduce((sum, stat) => sum + stat.winRate, 0) / stats.length)
      : 0
  const topStat = stats[0] ?? null

  return (
    <div className="relative space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-16">
      <div className="pointer-events-none absolute inset-x-0 -top-24 z-0 h-72 bg-[radial-gradient(circle_at_top,rgba(255,92,0,0.18),transparent_65%)]" />

      <section className="relative z-10 overflow-hidden rounded-2xl border border-zinc-800 bg-[#140C0B]">
        <div className="relative h-52 sm:h-56">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-45" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(15,10,9,0.3),rgba(15,10,9,0.92))]" />
          <div className="absolute right-4 top-4 flex items-center gap-2">
            <Badge className={`border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${getStatusStyle(appRow.status)}`}>
              {appRow.status}
            </Badge>
            <Link
              href="/org/applications"
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-[#0F0A09]/90 px-3 py-1.5 text-xs font-medium text-zinc-200 transition-colors hover:border-zinc-600 hover:text-white"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Applications
            </Link>
          </div>
        </div>

        <div className="px-4 pb-5 sm:px-6">
          <div className="-mt-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar className="h-24 w-24 border-4 border-[#140C0B] bg-zinc-800 shadow-lg shadow-black/30 sm:h-28 sm:w-28">
                <AvatarFallback className="bg-zinc-800 text-2xl font-black text-zinc-200">
                  {getInitials(profile.gamertag)}
                </AvatarFallback>
              </Avatar>

              <div className="pb-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Applicant Review</p>
                <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">{profile.gamertag}</h1>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-[#0F0A09] px-2.5 py-1">
                    <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                    {profile.region || 'Region not specified'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-[#0F0A09] px-2.5 py-1">
                    <Gamepad2 className="h-3.5 w-3.5 text-zinc-500" />
                    {gameName || 'Game not specified'}
                  </span>
                  {roleName && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-[#0F0A09] px-2.5 py-1">
                      <Shield className="h-3.5 w-3.5 text-zinc-500" />
                      {roleName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="grid w-full max-w-sm grid-cols-3 gap-2 text-center sm:w-auto">
              <div className="rounded-lg border border-zinc-800 bg-[#0F0A09] px-2 py-2">
                <p className="text-base font-bold text-white">{highlightCount}</p>
                <p className="text-[10px] uppercase tracking-wide text-zinc-500">Highlights</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-[#0F0A09] px-2 py-2">
                <p className="text-base font-bold text-white">{stats.length}</p>
                <p className="text-[10px] uppercase tracking-wide text-zinc-500">Game Stats</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-[#0F0A09] px-2 py-2">
                <p className="text-base font-bold text-white">{averageWinRate}%</p>
                <p className="text-[10px] uppercase tracking-wide text-zinc-500">Avg Win Rate</p>
              </div>
            </div>
          </div>

          <Separator className="my-4 bg-zinc-800" />

          <p className="text-sm leading-6 text-zinc-300">{profile.bio?.trim() || 'No bio provided by the player yet.'}</p>
        </div>
      </section>

      <section className="relative z-10 grid grid-cols-2 gap-2 rounded-xl border border-zinc-800 bg-[#140C0B] p-3 sm:grid-cols-4 sm:p-4">
        <div className="rounded-md border border-zinc-800 bg-[#0F0A09] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Applied For</p>
          <p className="mt-1 text-sm font-semibold text-zinc-100 line-clamp-1">{tryout.title}</p>
        </div>
        <div className="rounded-md border border-zinc-800 bg-[#0F0A09] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Submitted</p>
          <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-100">
            <CalendarDays className="h-3.5 w-3.5 text-zinc-500" />
            {submittedDate}
          </p>
        </div>
        <div className="rounded-md border border-zinc-800 bg-[#0F0A09] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Primary Rank</p>
          <p className="mt-1 text-sm font-semibold text-zinc-100">{topStat?.rank ?? 'Unranked'}</p>
        </div>
        <div className="rounded-md border border-zinc-800 bg-[#0F0A09] px-3 py-2">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Main Role</p>
          <p className="mt-1 text-sm font-semibold text-zinc-100">{topStat?.mainRole ?? 'Flex'}</p>
        </div>
      </section>

      <div className="relative z-10 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <section className="space-y-6 xl:col-span-8">
          <Card className="border-zinc-800 bg-[#140C0B] text-zinc-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-xl text-white">
                <Video className="h-5 w-5 text-[#FF5C00]" />
                Latest Match Highlights
              </CardTitle>
              <p className="text-xs text-zinc-500">Recruiter review feed with submitted highlight videos.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {highlightCount === 0 ? (
                <p className="rounded-lg border border-zinc-800 bg-[#0F0A09] p-3 text-sm text-zinc-500">
                  No highlight videos uploaded.
                </p>
              ) : (
                <div className="space-y-4">
                  {(highlights ?? []).map((highlight) => (
                    <div key={highlight.id} className="overflow-hidden rounded-xl border border-zinc-800 bg-[#0F0A09]">
                      <video controls className="aspect-video w-full bg-black" src={highlight.video_url} />
                      <div className="space-y-2 p-3">
                        <div className="flex items-center justify-between gap-2">
                          <p className="line-clamp-1 text-sm font-semibold text-zinc-100">{highlight.title}</p>
                          <span className="text-xs text-zinc-500">{formatDuration(highlight.duration_seconds)}</span>
                        </div>
                        <p className="text-xs text-zinc-500">Uploaded {formatDate(highlight.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-[#140C0B] text-zinc-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <Trophy className="h-5 w-5 text-[#FF5C00]" />
                Competitive Experience
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {experiences.length === 0 ? (
                <p className="rounded-lg border border-zinc-800 bg-[#0F0A09] p-3 text-sm text-zinc-500">
                  No competitive experience added yet.
                </p>
              ) : (
                experiences.map((entry, index) => (
                  <div key={`${entry.year}-${entry.role}-${index}`} className="rounded-lg border border-zinc-800 bg-[#0F0A09] p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-zinc-100">
                        {entry.role || 'Role'} · {entry.game || 'Game'}
                      </p>
                      <span className="text-xs text-zinc-500">{entry.year || 'Year not specified'}</span>
                    </div>
                    <p className="mt-1 text-xs text-zinc-400">{entry.team ? `Team: ${entry.team}` : 'Independent player'}</p>
                    {entry.highlights && <p className="mt-2 text-sm leading-6 text-zinc-300">{entry.highlights}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-6 xl:col-span-4 xl:sticky xl:top-24 xl:self-start">
          <Card className="border-zinc-800 bg-[#140C0B] text-zinc-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <ScrollText className="h-5 w-5 text-[#FF5C00]" />
                Application Context
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border border-zinc-800 bg-[#0F0A09] p-3">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Status</p>
                <p className="mt-1 text-sm font-semibold text-zinc-100">{appRow.status}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-[#0F0A09] p-3">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Player Note</p>
                <p className="mt-1 text-sm leading-6 text-zinc-300">{appRow.message?.trim() ? appRow.message : 'No application note provided.'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-[#140C0B] text-zinc-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <UserRound className="h-5 w-5 text-[#FF5C00]" />
                Profile Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="rounded-md border border-zinc-800 bg-[#0F0A09] px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Gamertag</p>
                <p className="text-sm font-semibold text-zinc-200">{profile.gamertag}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-[#0F0A09] px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Region</p>
                <p className="text-sm text-zinc-200">{profile.region || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-[#140C0B] text-zinc-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <Monitor className="h-5 w-5 text-[#FF5C00]" />
                Hardware Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="rounded-md border border-zinc-800 bg-[#0F0A09] px-3 py-2">
                <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-500">
                  <MousePointer2 className="h-3.5 w-3.5" />
                  Mouse
                </p>
                <p className="mt-0.5 text-sm text-zinc-200">{hardware.mouse || 'Not specified'}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-[#0F0A09] px-3 py-2">
                <p className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-500">
                  <Cpu className="h-3.5 w-3.5" />
                  Keyboard
                </p>
                <p className="mt-0.5 text-sm text-zinc-200">{hardware.keyboard || 'Not specified'}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-[#0F0A09] px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Mousepad</p>
                <p className="mt-0.5 text-sm text-zinc-200">{hardware.mousepad || 'Not specified'}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-[#0F0A09] px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Headset</p>
                <p className="mt-0.5 text-sm text-zinc-200">{hardware.headset || 'Not specified'}</p>
              </div>
              <div className="rounded-md border border-zinc-800 bg-[#0F0A09] px-3 py-2">
                <p className="text-xs uppercase tracking-wide text-zinc-500">Monitor</p>
                <p className="mt-0.5 text-sm text-zinc-200">{hardware.monitor || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-[#140C0B] text-zinc-100">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <Trophy className="h-5 w-5 text-[#FF5C00]" />
                Game Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats.length === 0 ? (
                <p className="rounded-lg border border-zinc-800 bg-[#0F0A09] p-3 text-sm text-zinc-500">
                  No game stats available yet.
                </p>
              ) : (
                stats.map((stat) => (
                  <div key={stat.id} className="rounded-lg border border-zinc-800 bg-[#0F0A09] p-3">
                    <p className="text-sm font-semibold text-zinc-100">{stat.game}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                      <div className="rounded border border-zinc-800 bg-[#120D0C] px-2 py-1.5">
                        <p className="text-zinc-500 uppercase">Rank</p>
                        <p className="font-semibold text-zinc-200">{stat.rank}</p>
                      </div>
                      <div className="rounded border border-zinc-800 bg-[#120D0C] px-2 py-1.5">
                        <p className="text-zinc-500 uppercase">Main Role</p>
                        <p className="font-semibold text-zinc-200">{stat.mainRole}</p>
                      </div>
                      <div className="rounded border border-zinc-800 bg-[#120D0C] px-2 py-1.5">
                        <p className="text-zinc-500 uppercase">MMR</p>
                        <p className="font-semibold text-zinc-200">{stat.mmr}</p>
                      </div>
                      <div className="rounded border border-zinc-800 bg-[#120D0C] px-2 py-1.5">
                        <p className="text-zinc-500 uppercase">Win Rate</p>
                        <p className="font-semibold text-zinc-200">{stat.winRate}%</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  )
}
