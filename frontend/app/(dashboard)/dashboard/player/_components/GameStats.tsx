import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Trophy, Pencil } from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import type { GameStatWithRelations } from '@/lib/queries'

interface GameStatsProps {
  stats: GameStatWithRelations[] | null
}

export function GameStats({ stats }: GameStatsProps) {
  // Just show the first game stat for now since the UI only shows one card
  const stat = stats && stats.length > 0 ? stats[0] : null
  const gameName = stat?.game?.name ?? 'Valorant'
  const rank = stat?.rank ?? 'Unranked'
  const mmr = stat?.mmr ?? 0
  const winRate = Number(stat?.win_rate) || 0
  const mainRole = stat?.main_role?.role_name ?? 'Flex'

  return (
    <Card className="bg-[#140C0B] border-zinc-800 text-zinc-100 shadow-sm h-full group transition-all hover:border-zinc-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-zinc-800/50">
            <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#FF5C00]" />
                <CardTitle className="text-sm font-bold text-white tracking-wide uppercase">Game Stats: {gameName}</CardTitle>
            </div>
            <Link href="/dashboard/player/edit-stats" className="p-1 rounded hover:bg-zinc-800 transition-colors">
              <Pencil className="w-3.5 h-3.5 text-zinc-500 hover:text-[#FF5C00] transition-colors" />
            </Link>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
            {/* Rank Display - Large Central */}
            <div className="flex flex-col items-center justify-center py-8 bg-zinc-900/30 rounded-lg border border-zinc-800/50 relative overflow-hidden group-hover:bg-zinc-900/50 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950/80 pointer-events-none"></div>
                
                {/* Shield Icon placeholder for Rank */}
                <div className="relative mb-3">
                    <Shield className="w-16 h-16 text-zinc-700 opacity-80" strokeWidth={1} />
                    {rank === "Unranked" && (
                        <span className="absolute inset-0 flex items-center justify-center text-zinc-500 font-black text-2xl opacity-30 select-none">?</span>
                    )}
                </div>
                
                <div className="text-2xl font-bold text-white relative z-10 tracking-tight">{rank}</div>
                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mt-1 relative z-10">Current Rank</div>
            </div>

            <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-medium text-xs uppercase tracking-wide">Main Role</span>
                    <span className="font-bold text-zinc-300 px-2 py-1 bg-zinc-900 rounded text-xs border border-zinc-800">{mainRole}</span>
                </div>
                
                <Separator className="bg-zinc-900" />

                <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-500 font-medium text-xs uppercase tracking-wide">Match Making Rating</span>
                    <span className="font-bold text-white">{mmr} MMR</span>
                </div>

                <div className="space-y-2 pt-1">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500 font-medium text-xs uppercase tracking-wide">Win Rate</span>
                        <span className="font-bold text-white">{winRate}%</span>
                    </div>
                    {/* Unique Progress Bar Style */}
                    <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden relative">
                        <div 
                            className="h-full bg-gradient-to-r from-orange-600 to-orange-400 rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(255,92,0,0.3)]" 
                            style={{ width: `${Math.min(100, Math.max(5, winRate))}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
  )
}
