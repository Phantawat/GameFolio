'use client'

import { useState, useMemo, useActionState, useEffect } from 'react'
import { deleteTryoutModeration, restoreTryoutModeration, toggleTryoutActive } from '../actions'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Search, Gamepad2, Loader2 } from 'lucide-react'

export type TryoutRow = {
  id: string
  title: string
  isActive: boolean
  deletedAt: string | null
  orgName: string
  gameName: string
  createdAt: string
}

interface AdminTryoutsTableProps {
  tryouts: TryoutRow[]
}

function ToggleButton({ tryoutId, isActive }: { tryoutId: string; isActive: boolean }) {
  const [state, action, isPending] = useActionState(toggleTryoutActive, null)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) toast.success(state.success)
  }, [state])

  return (
    <form action={action}>
      <input type="hidden" name="tryout_id" value={tryoutId} />
      <input type="hidden" name="is_active" value={isActive ? 'false' : 'true'} />
      <Button
        type="submit"
        size="sm"
        disabled={isPending}
        variant="outline"
        className={
          isActive
            ? 'border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs'
            : 'border-green-500/30 text-green-400 hover:bg-green-500/10 hover:text-green-300 text-xs'
        }
      >
        {isPending ? (
          <Loader2 className="w-3 h-3 animate-spin" />
        ) : isActive ? (
          'Deactivate'
        ) : (
          'Activate'
        )}
      </Button>
    </form>
  )
}

function DeleteRestoreButton({ tryoutId, isDeleted }: { tryoutId: string; isDeleted: boolean }) {
  const actionFn = isDeleted ? restoreTryoutModeration : deleteTryoutModeration
  const [state, action, isPending] = useActionState(actionFn, null)

  useEffect(() => {
    if (state?.error) toast.error(state.error)
    if (state?.success) toast.success(state.success)
  }, [state])

  return (
    <form
      action={action}
      onSubmit={(e) => {
        const message = isDeleted
          ? 'Restore this tryout listing?'
          : 'Delete this tryout listing? This hides it from player and recruiter views.'
        if (!window.confirm(message)) {
          e.preventDefault()
        }
      }}
    >
      <input type="hidden" name="tryout_id" value={tryoutId} />
      <Button
        type="submit"
        size="sm"
        disabled={isPending}
        variant="outline"
        className={
          isDeleted
            ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300 text-xs'
            : 'border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 text-xs'
        }
      >
        {isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : isDeleted ? 'Restore' : 'Delete'}
      </Button>
    </form>
  )
}

export function AdminTryoutsTable({ tryouts }: AdminTryoutsTableProps) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return tryouts
    const q = search.toLowerCase()
    return tryouts.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.orgName.toLowerCase().includes(q) ||
        t.gameName.toLowerCase().includes(q)
    )
  }, [tryouts, search])

  if (tryouts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Gamepad2 className="w-10 h-10 text-zinc-700 mb-3" />
        <h3 className="text-lg font-bold text-zinc-300">No tryouts yet</h3>
        <p className="text-zinc-500 text-sm mt-1">Tryouts will appear here once posted.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
        <Input
          placeholder="Search tryouts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:ring-[#FF5C00]/30 focus:border-[#FF5C00]/50"
        />
      </div>

      <div className="bg-[#140C0B] border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Tryout</th>
              <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Organization</th>
              <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Game</th>
              <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Status</th>
              <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Created</th>
              <th className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((tryout) => (
              <tr key={tryout.id} className="border-b border-zinc-800/50 hover:bg-zinc-900/30 transition-colors">
                <td className="px-5 py-4 text-white font-medium text-sm max-w-[200px] truncate">
                  {tryout.title}
                </td>
                <td className="px-5 py-4 text-zinc-400 text-sm">{tryout.orgName}</td>
                <td className="px-5 py-4">
                  <Badge className="bg-zinc-800 text-zinc-300 border-zinc-700 text-xs">
                    {tryout.gameName}
                  </Badge>
                </td>
                <td className="px-5 py-4">
                  {tryout.deletedAt ? (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/20 text-xs">
                      Deleted
                    </Badge>
                  ) : tryout.isActive ? (
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/20 text-xs">
                      Active
                    </Badge>
                  ) : (
                    <Badge className="bg-zinc-500/20 text-zinc-500 border-zinc-500/20 text-xs">
                      Inactive
                    </Badge>
                  )}
                </td>
                <td className="px-5 py-4 text-zinc-500 text-sm">
                  {new Date(tryout.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-5 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <DeleteRestoreButton tryoutId={tryout.id} isDeleted={Boolean(tryout.deletedAt)} />
                    {!tryout.deletedAt && <ToggleButton tryoutId={tryout.id} isActive={tryout.isActive} />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="flex items-center justify-center py-8 text-zinc-500 text-sm">
            No tryouts match your search.
          </div>
        )}
      </div>
    </div>
  )
}
