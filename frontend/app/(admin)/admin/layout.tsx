import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UserDropdownMenu from '@/components/layout/UserDropdownMenu'

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
      <nav className="sticky top-0 z-50 w-full h-16 bg-[#0F0A09]/80 backdrop-blur-md border-b border-zinc-800 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[#FF5C00] font-black text-lg">GameFolio</span>
            <span className="text-zinc-600 text-sm">/</span>
            <span className="text-white font-bold text-sm">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="/dashboard/player" className="text-zinc-400 hover:text-white text-sm transition-colors">
              Back to Dashboard
            </a>
            <UserDropdownMenu displayName={displayName} handle={handle} profileHref="/dashboard/player" />
          </div>
        </div>
      </nav>
      <main className="px-6 pt-8 pb-12 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
