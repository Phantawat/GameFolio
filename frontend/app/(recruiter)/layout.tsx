import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function RecruiterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen bg-[#0F0A09] text-zinc-50 font-sans">
      {children}
    </div>
  )
}
