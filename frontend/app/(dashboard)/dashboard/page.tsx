import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserRound, Building2, CheckCircle2, Circle } from 'lucide-react'

export const metadata = {
  title: 'Dashboard | GameFolio',
  description: 'Choose your player or organization path.',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: profile } = user
    ? await supabase
        .from('player_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle()
    : { data: null }

  const { data: membership } = user
    ? await supabase
        .from('organization_members')
        .select('organization_id')
        .eq('user_id', user.id)
        .in('role', ['OWNER', 'MANAGER'])
        .maybeSingle()
    : { data: null }

  const hasPlayerProfile = Boolean(profile)
  const hasOrganization = Boolean(membership)

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.18em] text-zinc-500 font-semibold">Welcome to GameFolio</p>
        <h1 className="text-4xl font-black tracking-tight text-white">Your Dashboard</h1>
        <p className="text-zinc-400 text-sm">
          Continue as a player, an organization, or both. You can update these at any time.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#140C0B] border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FF5C00]/20 bg-[#FF5C00]/10 px-3 py-1 text-xs text-[#FF5C00] font-semibold uppercase tracking-wide">
                <UserRound className="w-3.5 h-3.5" />
                Player Path
              </div>
              {hasPlayerProfile ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Profile Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                  <Circle className="w-3.5 h-3.5" />
                  Setup Required
                </span>
              )}
            </div>
            <CardTitle className="text-white">Build Player Profile</CardTitle>
            <CardDescription className="text-zinc-400">
              Set gamertag, region, and competitive stats to apply for tryouts.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Link href={hasPlayerProfile ? '/dashboard/player' : '/onboarding'}>
              <Button className="bg-[#FF5C00] hover:bg-orange-600 text-white font-bold">
                {hasPlayerProfile ? 'Open Player Profile' : 'Complete Profile'}
              </Button>
            </Link>
            <Link href="/dashboard/tryouts" className="text-sm text-zinc-400 hover:text-white">
              Browse Tryouts
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-[#140C0B] border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/70 px-3 py-1 text-xs text-zinc-300 font-semibold uppercase tracking-wide">
                <Building2 className="w-3.5 h-3.5" />
                Organization Path
              </div>
              {hasOrganization ? (
                <span className="inline-flex items-center gap-1 text-xs text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Dashboard Ready
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                  <Circle className="w-3.5 h-3.5" />
                  Setup Required
                </span>
              )}
            </div>
            <CardTitle className="text-white">Manage Organization</CardTitle>
            <CardDescription className="text-zinc-400">
              Create your org, build rosters, and manage applications from your own dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            <Link href={hasOrganization ? '/org/rosters' : '/org/create'}>
              <Button className="bg-[#FF5C00] hover:bg-orange-600 text-white font-bold">
                {hasOrganization ? 'Open Org Dashboard' : 'Create Organization'}
              </Button>
            </Link>
            <Link href="/org/rosters" className="text-sm text-zinc-400 hover:text-white">
              View Rosters
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
