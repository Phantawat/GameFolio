export type PlayerNavProps = {
  gamertag: string
  avatarUrl?: string | null
  canSwitchToOrg?: boolean
  canAccessAdmin?: boolean
}

export type OrgNavProps = {
  orgName: string
  orgLogoUrl?: string | null
  memberRole: 'OWNER' | 'MANAGER' | 'MEMBER'
  applicationCount?: number
  canSwitchToPlayer?: boolean
}
