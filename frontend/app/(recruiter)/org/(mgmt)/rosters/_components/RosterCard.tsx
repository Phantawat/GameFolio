import { Eye, Users, Target, Swords, Shield, Gamepad2 } from 'lucide-react'
import Link from 'next/link'

export type RosterCardData = {
  id: string
  name: string
  game_id: string
  games: { name: string } | null
  member_count: number
}

function getGameStyle(gameName: string | null | undefined) {
  const n = gameName?.toLowerCase() ?? ''
  if (n.includes('valorant'))
    return { Icon: Target, iconColor: 'text-red-400', bg: 'bg-red-500/20' }
  if (n.includes('league'))
    return { Icon: Swords, iconColor: 'text-blue-400', bg: 'bg-blue-500/20' }
  if (n.includes('counter-strike') || n.includes('cs2'))
    return { Icon: Shield, iconColor: 'text-yellow-400', bg: 'bg-yellow-500/20' }
  if (n.includes('dota'))
    return { Icon: Swords, iconColor: 'text-purple-400', bg: 'bg-purple-500/20' }
  return { Icon: Gamepad2, iconColor: 'text-orange-400', bg: 'bg-orange-500/20' }
}

function getTier(rosterName: string) {
  const n = rosterName.toLowerCase()
  if (n.includes('main') || n.includes('pro') || n.includes('competitive'))
    return { label: 'PRO TIER', cls: 'bg-orange-500/15 text-orange-400 border-orange-500/30' }
  if (n.includes('academy') || n.includes('amateur'))
    return { label: 'ACADEMY', cls: 'bg-blue-500/15 text-blue-400 border-blue-500/30' }
  if (n.includes('elite') || n.includes('premier'))
    return { label: 'ELITE TIER', cls: 'bg-purple-500/15 text-purple-400 border-purple-500/30' }
  return { label: 'ROSTER', cls: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30' }
}

export default function RosterCard({ roster }: { roster: RosterCardData }) {
  const { Icon, iconColor, bg } = getGameStyle(roster.games?.name)
  const tier = getTier(roster.name)

  return (
    <div className="bg-[#140C0B] border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-600 transition-all flex flex-col group">
      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FF5C00] to-orange-400" />

      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Icon + Tier */}
        <div className="flex items-start justify-between">
          <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <span
            className={`text-[10px] font-black px-2 py-1 rounded border tracking-wider ${tier.cls}`}
          >
            {tier.label}
          </span>
        </div>

        {/* Name + Game */}
        <div>
          <h3 className="text-xl font-black text-white leading-tight">{roster.name}</h3>
          {roster.games?.name && (
            <div className="flex items-center gap-1 mt-1">
              <Icon className={`w-3 h-3 ${iconColor}`} />
              <span className={`text-xs font-bold uppercase tracking-wide ${iconColor}`}>
                {roster.games.name}
              </span>
            </div>
          )}
        </div>

        {/* Player count */}
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1">
            {Array.from({ length: Math.min(roster.member_count, 3) }).map((_, i) => (
              <div
                key={i}
                className="w-6 h-6 rounded-full bg-zinc-700 border-2 border-[#140C0B] flex items-center justify-center text-[10px] text-zinc-300 font-bold"
              >
                {String.fromCharCode(65 + i)}
              </div>
            ))}
          </div>
          <span className="text-sm text-zinc-400">
            {roster.member_count} Player{roster.member_count !== 1 ? 's' : ''} Active
          </span>
        </div>
      </div>

      {/* Footer links */}
      <div className="border-t border-zinc-800 grid grid-cols-2 divide-x divide-zinc-800">
        <Link
          href={`/org/rosters/${roster.id}`}
          className="flex items-center justify-center gap-1.5 py-3 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors font-medium"
        >
          <Eye className="w-3.5 h-3.5" />
          View Roster
        </Link>
        <Link
          href={`/org/tryouts/new?roster=${roster.id}`}
          className="flex items-center justify-center gap-1.5 py-3 text-xs text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors font-medium"
        >
          <Users className="w-3.5 h-3.5" />
          Manage Tryouts
        </Link>
      </div>
    </div>
  )
}
