'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, Eye, Pause, Pencil, Play, Search, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  bulkManageTryouts,
  deleteTryout,
  toggleTryoutStatus,
} from '../actions'

export type TryoutManagerItem = {
  id: string
  title: string
  gameName: string
  roleName: string | null
  isActive: boolean
  createdAt: string
  postedLabel: string
  applicantCount: number
  pendingApplicantCount: number
}

type Props = {
  items: TryoutManagerItem[]
}

function statusBadge(isActive: boolean) {
  if (isActive) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-1 text-[10px] font-black tracking-wide text-emerald-400">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
        ACTIVE
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/20 px-2 py-1 text-[10px] font-black tracking-wide text-amber-400">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
      PAUSED
    </span>
  )
}

function gameDotClass(gameName: string) {
  const game = gameName.toLowerCase()
  if (game.includes('valorant')) return 'bg-teal-400'
  if (game.includes('league')) return 'bg-blue-400'
  if (game.includes('cs2') || game.includes('counter')) return 'bg-orange-400'
  return 'bg-zinc-500'
}

export function MyTryoutsManager({ items }: Props) {
  const router = useRouter()

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [gameFilter, setGameFilter] = useState<'ALL' | string>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'PAUSED'>('ALL')

  const [toggleState, toggleAction, isTogglePending] = useActionState(toggleTryoutStatus, null)
  const [deleteState, deleteAction, isDeletePending] = useActionState(deleteTryout, null)
  const [bulkState, bulkAction, isBulkPending] = useActionState(bulkManageTryouts, null)

  useEffect(() => {
    if (!toggleState) return
    if (toggleState.error) toast.error(toggleState.error)
    if (toggleState.success) {
      toast.success(toggleState.success)
      router.refresh()
    }
  }, [toggleState, router])

  useEffect(() => {
    if (!deleteState) return
    if (deleteState.error) toast.error(deleteState.error)
    if (deleteState.success) {
      toast.success(deleteState.success)
      router.refresh()
    }
  }, [deleteState, router])

  useEffect(() => {
    if (!bulkState) return
    if (bulkState.error) toast.error(bulkState.error)
    if (bulkState.success) {
      toast.success(bulkState.success)
      setSelectedIds([])
      router.refresh()
    }
  }, [bulkState, router])

  const availableGames = useMemo(() => {
    return [...new Set(items.map((item) => item.gameName).filter(Boolean))]
  }, [items])

  const filteredRows = useMemo(() => {
    return items.filter((item) => {
      const q = search.trim().toLowerCase()
      const matchesSearch =
        q.length === 0 ||
        item.title.toLowerCase().includes(q) ||
        item.gameName.toLowerCase().includes(q) ||
        (item.roleName ?? '').toLowerCase().includes(q)

      const matchesGame = gameFilter === 'ALL' || item.gameName === gameFilter

      const status = item.isActive ? 'ACTIVE' : 'PAUSED'
      const matchesStatus = statusFilter === 'ALL' || statusFilter === status

      return matchesSearch && matchesGame && matchesStatus
    })
  }, [items, search, gameFilter, statusFilter])

  const total = items.length
  const activeCount = items.filter((item) => item.isActive).length
  const pausedCount = items.filter((item) => !item.isActive).length

  function toggleSelected(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((value) => value !== id) : [...prev, id]
    )
  }

  function setAllSelected(checked: boolean) {
    if (!checked) {
      setSelectedIds([])
      return
    }
    setSelectedIds(filteredRows.map((row) => row.id))
  }

  const allSelected = filteredRows.length > 0 && filteredRows.every((row) => selectedIds.includes(row.id))

  return (
    <div className="space-y-8 text-zinc-200">
      <section className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">
              Organization <span className="mx-1 text-zinc-700">›</span>{' '}
              <span className="text-[#FF5C00]">Management</span>
            </p>
            <h1 className="text-5xl font-black tracking-tight text-zinc-100">My Tryouts</h1>
            <p className="text-sm text-zinc-400">Manage your organization's recruitment postings</p>
          </div>
          <Link
            href="/org/tryouts/new"
            className="inline-flex h-11 items-center gap-2 rounded-md bg-[#FF5C00] px-5 text-sm font-bold text-white transition-colors hover:bg-orange-600"
          >
            +
            <span>Post New Tryout</span>
          </Link>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-black tracking-wide">
          <span className="rounded border border-zinc-800 bg-[#140C0B] px-3 py-1.5 text-zinc-400">
            <span className="mr-1 text-[#FF5C00]">{total}</span> TOTAL
          </span>
          <span className="rounded border border-zinc-800 bg-[#140C0B] px-3 py-1.5 text-zinc-400">
            <span className="mr-1 text-emerald-400">{activeCount}</span> ACTIVE
          </span>
          <span className="rounded border border-zinc-800 bg-[#140C0B] px-3 py-1.5 text-zinc-400">
            <span className="mr-1 text-amber-400">{pausedCount}</span> PAUSED
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[260px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-600" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by title or game..."
              className="h-10 border-zinc-800 bg-[#140C0B] pl-10 text-zinc-300 placeholder:text-zinc-600"
            />
          </div>

          <select
            value={gameFilter}
            onChange={(e) => setGameFilter(e.target.value)}
            className="h-10 min-w-[110px] rounded-md border border-zinc-800 bg-[#140C0B] px-3 text-xs text-zinc-300 outline-none"
          >
            <option value="ALL">All Games</option>
            {availableGames.map((game) => (
              <option key={game} value={game}>
                {game}
              </option>
            ))}
          </select>

          <div className="inline-flex h-10 items-center overflow-hidden rounded-md border border-zinc-800 bg-[#140C0B] text-xs">
            {(['ALL', 'ACTIVE', 'PAUSED'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={cn(
                  'px-3',
                  statusFilter === status
                    ? 'bg-[#FF5C00]/20 font-semibold text-[#FF5C00]'
                    : 'text-zinc-400'
                )}
              >
                {status === 'ALL' ? 'All' : status === 'ACTIVE' ? 'Active' : 'Paused'}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-[#140C0B]">
          <table className="min-w-full text-left">
            <thead className="bg-zinc-900/50 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              <tr>
                <th className="w-10 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => setAllSelected(e.target.checked)}
                    className="h-3.5 w-3.5 rounded border-zinc-700 bg-transparent accent-[#FF5C00]"
                  />
                </th>
                <th className="px-4 py-3">Tryout Posting</th>
                <th className="px-4 py-3">Game</th>
                <th className="px-4 py-3">Applicants</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Posted</th>
                <th className="px-4 py-3">Closes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={row.id} className="border-t border-zinc-800 text-sm text-zinc-300">
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(row.id)}
                      onChange={() => toggleSelected(row.id)}
                      className="h-3.5 w-3.5 rounded border-zinc-700 bg-transparent accent-[#FF5C00]"
                    />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-start gap-2">
                      <span className={cn('mt-1.5 h-2.5 w-2.5 rounded-full', gameDotClass(row.gameName))} />
                      <div>
                        <p className="font-semibold text-zinc-100">{row.title}</p>
                        <p className="text-xs text-zinc-500">{row.roleName ?? 'Role not specified'}</p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-zinc-400">{row.gameName}</td>

                  <td className="px-4 py-4">
                    {row.pendingApplicantCount > 0 ? (
                      <span className="rounded-full border border-[#FF5C00]/30 bg-[#FF5C00]/20 px-2 py-1 text-[10px] font-black text-[#FF5C00]">
                        {row.pendingApplicantCount} PENDING
                      </span>
                    ) : (
                      <span>{row.applicantCount} applicant{row.applicantCount === 1 ? '' : 's'}</span>
                    )}
                  </td>

                  <td className="px-4 py-4">{statusBadge(row.isActive)}</td>

                  <td className="px-4 py-4 text-zinc-500">{row.postedLabel}</td>

                  <td className="px-4 py-4 text-[11px] font-bold tracking-wide">
                    {row.pendingApplicantCount > 0 && row.isActive ? (
                      <span className="inline-flex items-center gap-1 text-amber-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        REVIEWING
                      </span>
                    ) : (
                      <span className="text-zinc-600">NO EXPIRY</span>
                    )}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/org/tryouts/new?edit=${row.id}&view=1`}
                        aria-label="View posting"
                        className="rounded p-1 text-zinc-500 transition-colors hover:text-white"
                      >
                        <Eye className="h-[18px] w-[18px]" />
                      </Link>

                      <Link
                        href={`/org/tryouts/new?edit=${row.id}`}
                        aria-label="Edit posting"
                        className="rounded p-1 text-zinc-500 transition-colors hover:text-white"
                      >
                        <Pencil className="h-[18px] w-[18px]" />
                      </Link>

                      <form action={toggleAction}>
                        <input type="hidden" name="tryout_id" value={row.id} />
                        <input type="hidden" name="is_active" value={row.isActive ? 'false' : 'true'} />
                        <button
                          type="submit"
                          disabled={isTogglePending}
                          aria-label="Toggle status"
                          className="rounded p-1 text-zinc-500 transition-colors hover:text-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {row.isActive ? <Pause className="h-[18px] w-[18px]" /> : <Play className="h-[18px] w-[18px]" />}
                        </button>
                      </form>

                      <form action={deleteAction}>
                        <input type="hidden" name="tryout_id" value={row.id} />
                        <button
                          type="submit"
                          disabled={isDeletePending}
                          aria-label="Delete"
                          className="rounded-md p-1 text-zinc-500 transition-colors hover:bg-red-900/20 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Trash2 className="h-[18px] w-[18px]" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {items.length === 0 && (
          <section className="relative overflow-hidden rounded-xl border border-zinc-800 bg-[#140C0B] p-6 pl-8">
            <span className="absolute inset-y-0 left-0 w-1 bg-[#FF5C00]" />
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight text-zinc-100">No Tryouts Yet</h3>
              <p className="text-sm leading-relaxed text-zinc-400">
                Start by posting your first tryout to begin receiving applications.
              </p>
            </div>
          </section>
        )}
      </section>

      {selectedIds.length > 0 && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-30 -translate-x-1/2">
          <div className="pointer-events-auto flex w-[560px] max-w-[calc(100vw-2rem)] items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-[#140C0B] px-3 py-2 text-xs font-bold tracking-wide">
            <span className="rounded bg-[#FF5C00] px-2 py-1 text-white">{selectedIds.length} SELECTED</span>

            <form action={bulkAction}>
              <input type="hidden" name="action" value="pause" />
              <input type="hidden" name="tryout_ids" value={JSON.stringify(selectedIds)} />
              <button
                type="submit"
                disabled={isBulkPending}
                className="rounded border border-amber-500 bg-amber-500/20 px-3 py-1 text-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                PAUSE ALL
              </button>
            </form>

            <form action={bulkAction}>
              <input type="hidden" name="action" value="delete" />
              <input type="hidden" name="tryout_ids" value={JSON.stringify(selectedIds)} />
              <button
                type="submit"
                disabled={isBulkPending}
                className="rounded border border-red-400 bg-red-400/20 px-3 py-1 text-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                DELETE ALL
              </button>
            </form>

            <button type="button" onClick={() => setSelectedIds([])} className="px-2 py-1 text-zinc-400">
              CANCEL
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
