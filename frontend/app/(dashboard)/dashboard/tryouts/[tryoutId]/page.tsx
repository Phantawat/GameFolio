import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft, Building2, CalendarDays, Gamepad2, MapPin, ShieldCheck, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ApplyButton } from '../_components/ApplyButton'
import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Tryout Details | GameFolio',
  description: 'View full details for an active tryout listing.',
}

type Relation<T> = T | T[] | null

type TryoutRecord = {
  id: string
  title: string
  requirements: string | null
  job_description: string | null
  is_active: boolean | null
  created_at: string
  organizations: Relation<{ name: string; logo_url: string | null; region: string | null }>
  games: Relation<{ name: string }>
  game_roles: Relation<{ role_name: string }>
}

function pickRelation<T>(value: Relation<T>): T | null {
  if (!value) return null
  return Array.isArray(value) ? (value[0] ?? null) : value
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export default async function TryoutDetailPage({
  params,
}: {
  params: Promise<{ tryoutId: string }>
}) {
  const { tryoutId } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: rawTryout } = await supabase
    .from('tryouts')
    .select(
      `
      id,
      title,
      requirements,
      job_description,
      is_active,
      deleted_at,
      created_at,
      organizations ( name, logo_url, region ),
      games ( name ),
      game_roles ( role_name )
    `
    )
    .eq('id', tryoutId)
    .is('deleted_at', null)
    .maybeSingle()

  if (!rawTryout) notFound()

  const tryout = rawTryout as TryoutRecord
  const org = pickRelation(tryout.organizations)
  const game = pickRelation(tryout.games)
  const role = pickRelation(tryout.game_roles)

  const { data: profile } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: existingApplication } = profile
    ? await supabase
        .from('applications')
        .select('id')
        .eq('player_profile_id', profile.id)
        .eq('tryout_id', tryout.id)
        .maybeSingle()
    : { data: null }

  const alreadyApplied = Boolean(existingApplication)

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <Link
        href="/dashboard/tryouts"
        className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Browse Tryouts
      </Link>

      <div className="rounded-2xl border border-zinc-800 bg-[#140C0B] p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{tryout.title}</h1>
            <div className="flex flex-wrap items-center gap-2">
              {game && (
                <Badge className="bg-zinc-800 text-zinc-200 border-zinc-700">
                  <Gamepad2 className="mr-1 h-3.5 w-3.5" />
                  {game.name}
                </Badge>
              )}
              {role && (
                <Badge className="bg-[#FF5C00]/15 text-[#FF5C00] border-[#FF5C00]/30">
                  <Users className="mr-1 h-3.5 w-3.5" />
                  {role.role_name}
                </Badge>
              )}
              <Badge
                className={
                  tryout.is_active === false
                    ? 'bg-zinc-600/15 text-zinc-400 border-zinc-600/30'
                    : 'bg-green-500/15 text-green-500 border-green-500/30'
                }
              >
                {tryout.is_active === false ? 'Inactive' : 'Active'}
              </Badge>
            </div>
          </div>

          <div className="w-full sm:w-48">
            {tryout.is_active === false ? (
              <Button disabled className="w-full bg-zinc-800 text-zinc-500 border border-zinc-700">
                Inactive Listing
              </Button>
            ) : (
              <ApplyButton tryoutId={tryout.id} alreadyApplied={alreadyApplied} />
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-zinc-800 bg-[#140C0B]">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
              <CardTitle className="text-lg font-bold text-white">Requirements</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {tryout.requirements?.trim() ? (
                <div className="whitespace-pre-wrap rounded-xl border border-zinc-800/80 bg-[#0F0A09] p-5 text-sm leading-relaxed text-zinc-300">
                  {tryout.requirements}
                </div>
              ) : (
                <p className="text-sm italic text-zinc-500">No specific requirements were provided.</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-[#140C0B]">
            <CardHeader className="border-b border-zinc-800/50 pb-4">
              <CardTitle className="text-lg font-bold text-white">Job Description</CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {tryout.job_description?.trim() ? (
                <div className="whitespace-pre-wrap rounded-xl border border-zinc-800/80 bg-[#0F0A09] p-5 text-sm leading-relaxed text-zinc-300">
                  {tryout.job_description}
                </div>
              ) : (
                <p className="text-sm italic text-zinc-500">No job description was provided.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-zinc-800 bg-[#140C0B]">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-zinc-400">Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <Building2 className="h-3.5 w-3.5" /> Organization
                </p>
                <p className="pl-5 text-sm font-medium text-white">{org?.name ?? 'Unknown Organization'}</p>
              </div>

              <Separator className="bg-zinc-800" />

              <div>
                <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <MapPin className="h-3.5 w-3.5" /> Region
                </p>
                <p className="pl-5 text-sm font-medium text-white">{org?.region ?? 'Not specified'}</p>
              </div>

              <Separator className="bg-zinc-800" />

              <div>
                <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <CalendarDays className="h-3.5 w-3.5" /> Posted
                </p>
                <p className="pl-5 text-sm font-medium text-white">{formatDate(tryout.created_at)}</p>
              </div>

              <Separator className="bg-zinc-800" />

              <div>
                <p className="mb-1.5 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                  <ShieldCheck className="h-3.5 w-3.5" /> Listing Status
                </p>
                <p className="pl-5 text-sm font-medium text-white">
                  {tryout.is_active === false ? 'Inactive' : 'Accepting Applications'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
