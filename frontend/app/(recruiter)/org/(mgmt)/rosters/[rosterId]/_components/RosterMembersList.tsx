'use client'

import { useState, useActionState, useEffect } from 'react'
import { addRosterMember, removeRosterMember } from '../../actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Plus, Trash2, UserPlus, Users, MapPin, Loader2 } from 'lucide-react'

export type MemberRow = {
  id: string
  gamertag: string
  region: string | null
  roleInRoster: string | null
  joinedAt: string
}

interface RosterMembersListProps {
  rosterId: string
  members: MemberRow[]
}

function AddMemberForm({ rosterId }: { rosterId: string }) {
  const [state, action, isPending] = useActionState(addRosterMember, null)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) toast.success(state.success)
  }, [state])

  return (
    <form action={action} className="flex gap-3 items-end">
      <input type="hidden" name="roster_id" value={rosterId} />
      <div className="flex-1 space-y-1">
        <label htmlFor="gamertag" className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          Player Gamertag
        </label>
        <Input
          id="gamertag"
          name="gamertag"
          required
          placeholder="Enter gamertag..."
          className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-[#FF5C00]/30 focus:border-[#FF5C00]/50"
        />
      </div>
      <div className="w-40 space-y-1">
        <label htmlFor="role_in_roster" className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          Role (optional)
        </label>
        <Input
          id="role_in_roster"
          name="role_in_roster"
          placeholder="e.g. Captain"
          className="bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-[#FF5C00]/30 focus:border-[#FF5C00]/50"
        />
      </div>
      <Button
        type="submit"
        disabled={isPending}
        className="bg-[#FF5C00] hover:bg-orange-600 text-white font-bold shrink-0"
      >
        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" /> Add</>}
      </Button>
    </form>
  )
}

function RemoveButton({ rosterId, memberId }: { rosterId: string; memberId: string }) {
  const [state, action, isPending] = useActionState(removeRosterMember, null)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) toast.success(state.success)
  }, [state])

  return (
    <form action={action}>
      <input type="hidden" name="roster_id" value={rosterId} />
      <input type="hidden" name="roster_member_id" value={memberId} />
      <Button
        type="submit"
        disabled={isPending}
        variant="ghost"
        size="icon"
        className="text-zinc-600 hover:text-red-400 hover:bg-red-500/10 w-8 h-8"
      >
        {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
      </Button>
    </form>
  )
}

export function RosterMembersList({ rosterId, members }: RosterMembersListProps) {
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="space-y-6">
      {/* Add member toggle */}
      <div>
        {showAdd ? (
          <div className="bg-[#140C0B] border border-zinc-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#FF5C00]" /> Add Player to Roster
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdd(false)}
                className="text-zinc-500 hover:text-white text-xs"
              >
                Cancel
              </Button>
            </div>
            <AddMemberForm rosterId={rosterId} />
          </div>
        ) : (
          <Button
            onClick={() => setShowAdd(true)}
            className="bg-[#FF5C00] hover:bg-orange-600 text-white font-bold"
          >
            <UserPlus className="w-4 h-4 mr-1.5" /> Add Member
          </Button>
        )}
      </div>

      {/* Members list */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center bg-[#140C0B] border border-zinc-800 rounded-xl">
          <Users className="w-10 h-10 text-zinc-700 mb-3" />
          <h3 className="text-lg font-bold text-zinc-300">No Members Yet</h3>
          <p className="text-zinc-500 text-sm mt-1">Add players to this roster by their gamertag.</p>
        </div>
      ) : (
        <div className="bg-[#140C0B] border border-zinc-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Player</th>
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Region</th>
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Role</th>
                <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Joined</th>
                <th className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                  <td className="px-5 py-4">
                    <span className="text-white font-medium text-sm">{member.gamertag}</span>
                  </td>
                  <td className="px-5 py-4">
                    {member.region ? (
                      <div className="flex items-center gap-1 text-zinc-400 text-sm">
                        <MapPin className="w-3 h-3" />
                        {member.region}
                      </div>
                    ) : (
                      <span className="text-zinc-600 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-zinc-300 text-sm">
                    {member.roleInRoster || <span className="text-zinc-600">—</span>}
                  </td>
                  <td className="px-5 py-4 text-zinc-500 text-sm">
                    {new Date(member.joinedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <RemoveButton rosterId={rosterId} memberId={member.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
