import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function GameStats() {
  return (
    <Card className="bg-[#140C0B] border-zinc-800 text-zinc-100">
        <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-zinc-500">Game Stats</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded flex items-center justify-center p-1">
                    {/* Valorant Icon Placeholder */}
                    <div className="text-black font-bold text-xs">VAL</div> 
                </div>
                <div>
                    <div className="text-xs text-zinc-500 uppercase">Current Rank</div>
                    <div className="font-bold text-lg text-white">Radiant #124</div>
                </div>
            </div>

            <div className="space-y-4 pt-2">
                <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">Game</span>
                    <span className="font-medium text-white">Valorant</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">Main Role</span>
                    <span className="font-medium text-white">Entry Fragger</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">MMR</span>
                    <span className="font-medium text-blue-400">2450</span>
                </div>
                
                <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-400">Win Rate</span>
                        <span className="font-bold text-white">62%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 w-[62%]"></div>
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
  )
}
