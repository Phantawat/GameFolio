'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import { Loader2, Search, Shield } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toggleUserSuspension } from '../actions'

export type AdminUserRow = {
  id: string
  email: string
  roles: string[]
  isSuspended: boolean
  createdAt: string
}

type AdminUsersTableProps = {
  users: AdminUserRow[]
  currentAdminUserId: string
}

function SuspensionButton({
  userId,
  isSuspended,
  disabled,
}: {
  userId: string
  isSuspended: boolean
  disabled: boolean
}) {
  const [state, action, isPending] = useActionState(toggleUserSuspension, null)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) toast.success(state.success)
  }, [state])

  return (
    <form action={action}>
      <input type="hidden" name="user_id" value={userId} />
      <input type="hidden" name="is_suspended" value={isSuspended ? 'false' : 'true'} />
      <Button
        type="submit"
        size="sm"
        variant="outline"
        disabled={isPending || disabled}
        className={
          isSuspended
            ? 'border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300 text-xs'
            : 'border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs'
        }
      >
        {isPending ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : disabled ? (
          'Current Admin'
        ) : isSuspended ? (
          'Reactivate'
        ) : (
          'Suspend'
        )}
      </Button>
    </form>
  )
}

export function AdminUsersTable({ users, currentAdminUserId }: AdminUsersTableProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return users
    const q = search.toLowerCase()
    return users.filter(
      (user) => user.email.toLowerCase().includes(q) || user.roles.some((role) => role.toLowerCase().includes(q))
    )
  }, [users, search])

  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Shield className="w-10 h-10 text-zinc-700 mb-3" />
        <h3 className="text-lg font-bold text-zinc-300">No users found</h3>
        <p className="text-zinc-500 text-sm mt-1">User accounts will appear here after signup.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          placeholder="Search users by email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-[#FF5C00]/30 focus:border-[#FF5C00]/50"
        />
      </div>

      <div className="bg-[#140C0B] border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">User</th>
              <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Roles</th>
              <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Created</th>
              <th className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => (
              <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                <td className="px-5 py-4">
                  <p className="text-sm font-medium text-white">{user.email}</p>
                  <p className="text-xs text-zinc-600 font-mono">{user.id.slice(0, 8)}...</p>
                </td>
                <td className="px-5 py-4">
                  <div className="flex flex-wrap gap-1.5">
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <Badge
                          key={`${user.id}-${role}`}
                          className="bg-zinc-800 text-zinc-300 border-zinc-700 text-[10px] uppercase tracking-wide"
                        >
                          {role}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-zinc-600 text-sm">No role</span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-4">
                  {user.isSuspended ? (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/20 text-xs">Suspended</Badge>
                  ) : (
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/20 text-xs">Active</Badge>
                  )}
                </td>
                <td className="px-5 py-4 text-zinc-500 text-sm">
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-5 py-4 text-right">
                  <SuspensionButton
                    userId={user.id}
                    isSuspended={user.isSuspended}
                    disabled={user.id === currentAdminUserId}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-8 text-zinc-500 text-sm">
            No users match your search.
          </div>
        )}
      </div>
    </div>
  )
}
