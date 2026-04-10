import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MyTryoutsManager } from './_components/MyTryoutsManager'
import type { ApplicationStatus } from '@/lib/database.types'

function relativePostedDate(value: string) {
  const created = new Date(value)
  const diff = Date.now() - created.getTime()
  const days = Math.max(1, Math.floor(diff / (1000 * 60 * 60 * 24)))
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 5) return `${weeks} week${weeks === 1 ? '' : 's'} ago`
  const months = Math.floor(days / 30)
  return `${months} month${months === 1 ? '' : 's'} ago`
}

export const metadata = {
  title: 'My Tryouts | GameFolio',
  description: "Manage your organization's recruitment postings.",
}

export default async function OrgTryoutsPage() {
  const supabase = await createClient()

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

  const { data: tryoutRows } = await supabase
    .from('tryouts')
    .select('id, title, is_active, created_at, games(name), game_roles(role_name)')
    .eq('organization_id', orgId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const tryoutIds = (tryoutRows ?? []).map((row) => row.id)

  const applicationCounts = new Map<string, { total: number; pending: number }>()

  if (tryoutIds.length > 0) {
    const { data: apps } = await supabase
      .from('applications')
      .select('tryout_id, status')
      .in('tryout_id', tryoutIds)

    for (const app of apps ?? []) {
      const current = applicationCounts.get(app.tryout_id) ?? { total: 0, pending: 0 }
      current.total += 1
      if ((app.status as ApplicationStatus) === 'PENDING' || (app.status as ApplicationStatus) === 'REVIEWING') {
        current.pending += 1
      }
      applicationCounts.set(app.tryout_id, current)
    }
  }

  const items = (tryoutRows ?? []).map((row) => {
    const game = Array.isArray(row.games) ? row.games[0] : row.games
    const role = Array.isArray(row.game_roles) ? row.game_roles[0] : row.game_roles
    const counts = applicationCounts.get(row.id) ?? { total: 0, pending: 0 }

    return {
      id: row.id,
      title: row.title,
      gameName: game?.name ?? 'Unknown Game',
      roleName: role?.role_name ?? null,
      isActive: row.is_active,
      createdAt: row.created_at,
      postedLabel: relativePostedDate(row.created_at),
      applicantCount: counts.total,
      pendingApplicantCount: counts.pending,
    }
  })

  return <MyTryoutsManager items={items} />
}
