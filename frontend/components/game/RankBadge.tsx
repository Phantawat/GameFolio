import { cn } from '@/lib/utils'

interface RankBadgeProps {
  rank: string | null
  className?: string
}

const TOP_RANKS = ['radiant', 'challenger', 'global elite', 'predator', 'champion']
const MID_RANKS = ['immortal', 'diamond', 'ascendant', 'master', 'grandmaster', 'platinum', 'legendary eagle']

function getRankTier(rank: string): 'top' | 'mid' | 'unranked' {
  const lower = rank.toLowerCase()
  if (TOP_RANKS.some((r) => lower.includes(r))) return 'top'
  if (MID_RANKS.some((r) => lower.includes(r))) return 'mid'
  return 'unranked'
}

const tierStyles = {
  top: 'bg-[#FF5C00]/15 text-[#FF5C00] border-[#FF5C00]/25',
  mid: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  unranked: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/25',
}

export function RankBadge({ rank, className }: RankBadgeProps) {
  if (!rank) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
          tierStyles.unranked,
          className
        )}
      >
        Unranked
      </span>
    )
  }

  const tier = getRankTier(rank)

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        tierStyles[tier],
        className
      )}
    >
      {rank}
    </span>
  )
}
