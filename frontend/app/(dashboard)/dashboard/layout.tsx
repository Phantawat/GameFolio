import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardNavbar from '@/components/layout/DashboardNavbar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // 1. Check Authentication (handled by middleware too, but double-check here)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // 2. Optional profile lookup for personalized navbar
  const { data: profile } = await supabase
    .from('player_profiles')
    .select('gamertag')
    .eq('user_id', user.id)
    .maybeSingle()

  const fallbackName = user.email?.split('@')[0] ?? 'Player'
  const displayName = profile?.gamertag ?? fallbackName
  const handle = `@${displayName.toLowerCase().replace(/\s+/g, '')}`

  return (
    <div className="min-h-screen bg-[#0F0A09] text-zinc-50 font-sans">
      <DashboardNavbar displayName={displayName} handle={handle} />
      <main className="px-6 md:px-8 pt-24 pb-12 max-w-7xl mx-auto min-h-screen space-y-8">
        {children}
      </main>
    </div>
  )
}
