import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminNavbar from '@/components/layout/AdminNavbar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if user has PLATFORM_ADMIN role
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'PLATFORM_ADMIN')
    .maybeSingle()

  if (!role) redirect('/dashboard/player')

  const { data: profile } = await supabase
    .from('player_profiles')
    .select('gamertag')
    .eq('user_id', user.id)
    .maybeSingle()

  const fallbackName = user.email?.split('@')[0] ?? 'Admin'
  const displayName = profile?.gamertag ?? fallbackName
  const handle = `@${displayName.toLowerCase().replace(/\s+/g, '')}`

  return (
    <div className="min-h-screen bg-[#0F0A09]">
      <AdminNavbar displayName={displayName} handle={handle} />
      <main className="px-6 pt-24 pb-12 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
