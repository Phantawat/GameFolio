import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OrgNavbar from '@/components/layout/OrgNavbar'

export default async function OrgMgmtLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Ensure the user is an owner or manager of some organization
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .in('role', ['OWNER', 'MANAGER'])
    .maybeSingle()

  if (!membership) redirect('/org/create')

  return (
    <>
      <OrgNavbar />
      <main className="px-6 md:px-8 pt-24 pb-12 max-w-7xl mx-auto space-y-8">
        {children}
      </main>
    </>
  )
}
