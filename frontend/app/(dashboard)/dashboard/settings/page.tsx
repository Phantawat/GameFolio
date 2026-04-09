import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import OrgLogoSettingsCard from './_components/OrgLogoSettingsCard'

export const metadata = {
  title: 'Settings | GameFolio',
  description: 'Manage your account preferences.',
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: orgMembership } = user
    ? await supabase
        .from('organization_members')
        .select('organization_id, organizations(name, logo_url)')
        .eq('user_id', user.id)
        .in('role', ['OWNER', 'MANAGER'])
        .order('joined_at', { ascending: true })
        .limit(1)
        .maybeSingle()
    : { data: null }

  const org = orgMembership
    ? Array.isArray(orgMembership.organizations)
      ? orgMembership.organizations[0]
      : orgMembership.organizations
    : null

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-white">Settings</h1>
        <p className="mt-1 text-sm text-zinc-400">Account preferences and session controls.</p>
      </div>

      <Card className="bg-[#140C0B] border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Account</CardTitle>
          <CardDescription className="text-zinc-400">
            Manage your profile navigation and sign-out actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-zinc-200">Open Player Profile</p>
              <p className="text-xs text-zinc-500">Review your public portfolio details.</p>
            </div>
            <a
              href="/dashboard/player"
              className="text-sm font-medium text-[#FF5C00] hover:text-orange-400"
            >
              Go to profile
            </a>
          </div>

          <Separator className="bg-zinc-800" />

          <form action="/auth/signout" method="post">
            <Button
              type="submit"
              variant="outline"
              className="border-zinc-700 bg-zinc-900 text-zinc-200 hover:bg-zinc-800 hover:text-white"
            >
              Sign Out
            </Button>
          </form>
        </CardContent>
      </Card>

      {org ? <OrgLogoSettingsCard orgName={org.name ?? 'Organization'} logoUrl={org.logo_url ?? null} /> : null}
    </div>
  )
}