'use client'

import OrgNavbar from '@/components/layout/OrgNavbar'
import type { OrganizationMemberRole } from '@/lib/database.types'

type OrgMgmtShellProps = {
  orgName: string
  orgLogoUrl?: string | null
  memberRole: OrganizationMemberRole
  applicationCount?: number
  children: React.ReactNode
}

export default function OrgMgmtShell({
  orgName,
  orgLogoUrl,
  memberRole,
  applicationCount,
  children,
}: OrgMgmtShellProps) {
  return (
    <>
      <OrgNavbar
        orgName={orgName}
        orgLogoUrl={orgLogoUrl ?? null}
        memberRole={memberRole}
        applicationCount={applicationCount ?? 0}
      />
      <main className="mx-auto max-w-7xl space-y-8 px-6 pb-12 pt-24 md:px-8">
        {children}
      </main>
    </>
  )
}
