import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
    <div className="min-h-screen bg-zinc-950 text-zinc-50 font-sans">
      {/* Temporary Navbar */}
      <nav className="border-b border-zinc-800 p-4 flex justify-between items-center bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="text-xl font-bold bg-gradient-to-r from-blue-500 to-indigo-500 bg-clip-text text-transparent">
          GameFolio
        </div>
        <div className="flex gap-4 items-center">
            <span className="text-sm text-zinc-400">
                {user.email}
            </span>
            <form action="/auth/signout" method="post">
                <button className="text-sm text-red-400 hover:text-red-300 transition-colors">
                    Sign Out
                </button>
            </form>
        </div>
      </nav>

      <main className="p-6 md:p-8 max-w-7xl mx-auto">
        {children}
      </main>
    </div>
  )
}
