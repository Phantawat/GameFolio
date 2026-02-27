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

  // 2. Check Onboarding Status (Profile Check)
  // Query player_profiles for the user's ID
  const { data: profile } = await supabase
    .from('player_profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  // If no profile exists, send them to onboarding
  if (!profile) {
    redirect('/onboarding')
  }

  return (
    <div className="min-h-screen bg-[#0F0A09] text-zinc-50 font-sans">
      <DashboardNavbar />
      <main className="p-6 md:p-8 pt-24 max-w-7xl mx-auto min-h-screen">
        {children}
      </main>
    </div>
  )
}
