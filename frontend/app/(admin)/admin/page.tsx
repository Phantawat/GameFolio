import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminDashboardContent } from './_components/AdminDashboardContent'

export const metadata = {
  title: 'Admin Dashboard | GameFolio',
  description: 'Platform administration panel.',
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch all organizations with member counts
  const { data: organizations } = await supabase
    .from('organizations')
    .select(`
      id, name, description, region, logo_url, created_at,
      organization_members ( user_id, role )
    `)
    .order('created_at', { ascending: false })

  // Fetch all tryouts with org and game info
  const { data: tryouts } = await supabase
    .from('tryouts')
    .select(`
      id, title, is_active, created_at,
      organizations ( name ),
      games ( name )
    `)
    .order('created_at', { ascending: false })

  // Compute stats
  const totalOrgs = organizations?.length ?? 0
  const totalTryouts = tryouts?.length ?? 0
  const activeTryouts = tryouts?.filter((t) => t.is_active !== false).length ?? 0

  const orgRows = (organizations ?? []).map((org) => {
    const members = Array.isArray(org.organization_members) ? org.organization_members : []
    const owner = members.find((m: { role: string }) => m.role === 'OWNER')
    return {
      id: org.id,
      name: org.name,
      region: org.region,
      memberCount: members.length,
      ownerUserId: owner?.user_id ?? null,
      createdAt: org.created_at,
    }
  })

  const tryoutRows = (tryouts ?? []).map((tryout) => {
    const orgName = Array.isArray(tryout.organizations)
      ? tryout.organizations[0]?.name
      : (tryout.organizations as { name: string } | null)?.name
    const gameName = Array.isArray(tryout.games)
      ? tryout.games[0]?.name
      : (tryout.games as { name: string } | null)?.name
    return {
      id: tryout.id,
      title: tryout.title,
      isActive: tryout.is_active !== false,
      orgName: orgName ?? 'Unknown',
      gameName: gameName ?? 'Unknown',
      createdAt: tryout.created_at,
    }
  })

  return (
    <AdminDashboardContent
      stats={{ totalOrgs, totalTryouts, activeTryouts }}
      organizations={orgRows}
      tryouts={tryoutRows}
    />
  )
}
