import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import OrgCreateForm from './_components/OrgCreateForm'

export const metadata = {
  title: 'Create Organization | GameFolio',
  description: 'Set up your official organization presence to start recruiting.',
}

export default async function OrgCreatePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // If user already owns/manages an org, skip creation
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .in('role', ['OWNER', 'MANAGER'])
    .maybeSingle()

  if (membership) redirect('/org/rosters')

  return (
    <div className="min-h-screen bg-[#0F0A09] flex flex-col">
      {/* Minimal top bar */}
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-orange-500 fill-orange-500" />
          <span className="text-base font-black tracking-wide text-white">GameFolio</span>
        </Link>
        <div className="w-8 h-8 rounded-md bg-zinc-800 border border-zinc-700" />
      </header>

      {/* Centered content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <OrgCreateForm />
      </div>

      {/* Footer */}
      <footer className="text-center pb-8">
        <p className="text-zinc-700 text-xs tracking-[0.2em] uppercase font-medium">
          Powered by GameFolio Recruiter Suite
        </p>
      </footer>
    </div>
  )
}
