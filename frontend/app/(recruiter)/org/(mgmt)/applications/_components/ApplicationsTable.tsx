'use client'

import { useActionState, useEffect, useState } from 'react'
import { updateApplicationStatus } from '../actions'
import { toast } from 'sonner'
import { Eye, Check, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export type ApplicationRow = {
  id: string
  status: string
  created_at: string
  gamertag: string
  player_profile_id: string
  tryout_title: string
  game_name: string | null
  rank: string | null
}

const STATUS_FILTERS = ['All', 'Pending', 'Reviewing', 'Accepted', 'Rejected'] as const

function getRankStyle(rank: string | null) {
  if (!rank) return 'bg-zinc-700/40 text-zinc-400 border-zinc-700'
  const r = rank.toUpperCase()
  if (r.includes('RADIANT')) return 'bg-orange-500/20 text-orange-300 border-orange-500/30'
  if (r.includes('IMMORTAL')) return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
  if (r.includes('DIAMOND') || r.includes('ASCENDANT'))
    return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
  if (r.includes('PLATINUM')) return 'bg-teal-500/20 text-teal-300 border-teal-500/30'
  if (r.includes('GOLD')) return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
  if (r.includes('SILVER')) return 'bg-zinc-400/20 text-zinc-300 border-zinc-400/30'
  return 'bg-zinc-700/40 text-zinc-400 border-zinc-700'
}

function getStatusStyle(status: string) {
  switch (status.toUpperCase()) {
    case 'REVIEWING':
      return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
    case 'ACCEPTED':
      return 'bg-green-500/20 text-green-400 border-green-500/30'
    case 'REJECTED':
      return 'bg-zinc-600/30 text-zinc-400 border-zinc-600/30'
    default:
      return 'bg-zinc-700/30 text-zinc-400 border-zinc-700/40'
  }
}

function ActionButtons({ applicationId, status }: { applicationId: string; status: string }) {
  const [reviewState, reviewAction, reviewPending] = useActionState(updateApplicationStatus, null)
  const [acceptState, acceptAction, acceptPending] = useActionState(updateApplicationStatus, null)
  const [rejectState, rejectAction, rejectPending] = useActionState(updateApplicationStatus, null)

  useEffect(() => {
    if (reviewState?.error) toast.error(reviewState.error)
    if (reviewState?.success) toast.success(reviewState.success)
  }, [reviewState])

  useEffect(() => {
    if (acceptState?.error) toast.error(acceptState.error)
    if (acceptState?.success) toast.success(acceptState.success)
  }, [acceptState])

  useEffect(() => {
    if (rejectState?.error) toast.error(rejectState.error)
    if (rejectState?.success) toast.success(rejectState.success)
  }, [rejectState])

  const isProcessed = status === 'ACCEPTED' || status === 'REJECTED'

  if (isProcessed) {
    return (
      <span className="text-xs text-zinc-500 font-medium">Processed</span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Review */}
      <form action={reviewAction}>
        <input type="hidden" name="application_id" value={applicationId} />
        <input type="hidden" name="status" value="REVIEWING" />
        <button
          type="submit"
          disabled={reviewPending}
          title="Mark as Reviewing"
          className="w-7 h-7 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white hover:border-zinc-500 transition-colors disabled:opacity-40"
        >
          {reviewPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
        </button>
      </form>

      {/* Accept */}
      <form action={acceptAction}>
        <input type="hidden" name="application_id" value={applicationId} />
        <input type="hidden" name="status" value="ACCEPTED" />
        <button
          type="submit"
          disabled={acceptPending}
          title="Accept"
          className="w-7 h-7 rounded-full border border-green-700/50 flex items-center justify-center text-green-500 hover:text-green-400 hover:border-green-600 transition-colors disabled:opacity-40"
        >
          {acceptPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Check className="w-3.5 h-3.5" />
          )}
        </button>
      </form>

      {/* Reject */}
      <form action={rejectAction}>
        <input type="hidden" name="application_id" value={applicationId} />
        <input type="hidden" name="status" value="REJECTED" />
        <button
          type="submit"
          disabled={rejectPending}
          title="Reject"
          className="w-7 h-7 rounded-full border border-red-700/50 flex items-center justify-center text-red-500 hover:text-red-400 hover:border-red-600 transition-colors disabled:opacity-40"
        >
          {rejectPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <X className="w-3.5 h-3.5" />
          )}
        </button>
      </form>
    </div>
  )
}

export default function ApplicationsTable({
  applications,
  stats,
}: {
  applications: ApplicationRow[]
  stats: { total: number; pending: number; approvedToday: number }
}) {
  const [activeFilter, setActiveFilter] = useState<(typeof STATUS_FILTERS)[number]>('All')

  const filtered = applications.filter((app) => {
    if (activeFilter === 'All') return true
    return app.status.toUpperCase() === activeFilter.toUpperCase()
  })

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-white">Incoming Applications</h1>
        <p className="text-zinc-400 mt-1 text-sm">
          Reviewing candidates for active team tryouts.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={cn(
              'px-4 py-1.5 rounded-md text-sm font-medium transition-colors',
              activeFilter === filter
                ? 'bg-[#FF5C00] text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            )}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#140C0B] border border-zinc-800 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-14 h-14 rounded-full bg-zinc-800/60 flex items-center justify-center mb-4">
              <Eye className="w-6 h-6 text-zinc-600" />
            </div>
            <h3 className="text-lg font-bold text-zinc-300">No new applications</h3>
            <p className="text-zinc-500 text-sm mt-1 max-w-xs">
              You&apos;re all caught up! There are no{' '}
              {activeFilter !== 'All' ? activeFilter.toLowerCase() + ' ' : ''}
              applications for your active tryouts at the moment.
            </p>
            {activeFilter === 'All' && (
              <Link
                href="/org/tryouts/new"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#FF5C00] hover:bg-orange-600 text-white text-sm font-bold rounded-lg transition-colors"
              >
                View Active Tryouts
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  {['APPLICANT', 'RANK', 'TRYOUT APPLIED FOR', 'DATE', 'STATUS', 'ACTIONS'].map(
                    (col) => (
                      <th
                        key={col}
                        className="text-left text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-4 py-3"
                      >
                        {col}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filtered.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-zinc-800/20 transition-colors"
                  >
                    {/* Applicant */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-zinc-700 flex items-center justify-center text-sm font-black text-zinc-300 shrink-0">
                          {app.gamertag.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white">{app.gamertag}</p>
                          <Link
                            href={`/dashboard/player`}
                            className="text-xs text-zinc-500 hover:text-orange-400 transition-colors"
                          >
                            View Public Resume
                          </Link>
                        </div>
                      </div>
                    </td>

                    {/* Rank */}
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'text-xs font-bold px-2 py-1 rounded border uppercase tracking-wide',
                          getRankStyle(app.rank)
                        )}
                      >
                        {app.rank ?? 'N/A'}
                      </span>
                    </td>

                    {/* Tryout */}
                    <td className="px-4 py-4">
                      <p className="text-sm text-zinc-200 font-medium">{app.tryout_title}</p>
                      {app.game_name && (
                        <p className="text-xs text-zinc-500">{app.game_name}</p>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-4 py-4">
                      <span className="text-sm text-zinc-400">
                        {(() => {
                          const diff = Date.now() - new Date(app.created_at).getTime()
                          const days = Math.floor(diff / 86400000)
                          if (days === 0) return 'Today'
                          if (days === 1) return '1 day ago'
                          return `${days} days ago`
                        })()}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'text-xs font-bold px-2.5 py-1 rounded border uppercase tracking-wide',
                          getStatusStyle(app.status)
                        )}
                      >
                        {app.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <ActionButtons applicationId={app.id} status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 py-3 px-4 border-t border-zinc-800 rounded-lg bg-[#0F0A09] text-xs">
        <div className="flex items-center gap-6 flex-wrap">
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-zinc-500" />
            TOTAL APPLICANTS:{' '}
            <span className="text-zinc-200 font-bold">{stats.total}</span>
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            PENDING REVIEW:{' '}
            <span className="text-zinc-200 font-bold">{stats.pending}</span>
          </span>
          <span className="flex items-center gap-1.5 text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            APPROVED TODAY:{' '}
            <span className="text-zinc-200 font-bold">{stats.approvedToday}</span>
          </span>
        </div>
        <span className="flex items-center gap-1.5 text-zinc-400 uppercase font-medium tracking-wide">
          SYSTEM STATUS:{' '}
          <span className="text-green-400 font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            OPERATIONAL
          </span>
        </span>
      </div>
    </div>
  )
}
