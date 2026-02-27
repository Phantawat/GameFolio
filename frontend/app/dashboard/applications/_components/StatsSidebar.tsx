import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Star } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StatsSidebarProps {
    responseRate: number
    activeApps: number
    acceptedApps: number
}

export function StatsSidebar({ responseRate, activeApps, acceptedApps }: StatsSidebarProps) {
    return (
        <div className="space-y-6 sticky top-6">
            <Card className="bg-[#140C0B] border-zinc-800 text-zinc-100 shadow-xl shadow-black/20">
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider text-zinc-500">Insights</h3>
                        <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 hover:bg-zinc-700 text-xs">Beta</Badge>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-400">Response Rate</span>
                            <span className="text-orange-500 font-bold">{responseRate}%</span>
                        </div>
                        <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-600 to-orange-500 transition-all duration-1000 ease-out" style={{ width: `${responseRate}%` }}></div>
                        </div>
                        <p className="text-xs text-zinc-600">Based on last 30 days activity.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-zinc-900/40 rounded-lg p-3 text-center border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                            <span className="block text-2xl font-bold text-white mb-1">{activeApps}</span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Active</span>
                        </div>
                        <div className="bg-zinc-900/40 rounded-lg p-3 text-center border border-zinc-800/50 hover:border-zinc-700 transition-colors">
                            <span className="block text-2xl font-bold text-green-500 mb-1">{acceptedApps}</span>
                            <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Offers</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Pro Upsell Card */}
            <Card className="bg-gradient-to-br from-orange-600 to-orange-500 border-0 text-white overflow-hidden relative shadow-lg shadow-orange-900/20 group cursor-pointer hover:shadow-orange-600/20 transition-all hover:-translate-y-1">
                <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                <CardContent className="p-6 relative z-10">
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="font-bold text-lg leading-tight">Boost your<br />visibility</h3>
                        <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                            <Star className="w-4 h-4 text-white fill-current" />
                        </div>
                    </div>
                    <p className="text-orange-50 text-sm mb-5 font-medium/90 leading-relaxed">
                        Verified players get <span className="font-bold bg-white/20 px-1 rounded">3x</span> more roster invites on average.
                    </p>
                    <Button className="bg-white text-orange-600 hover:bg-orange-50 border-0 font-bold w-full shadow-lg shadow-black/10">
                        Upgrade to Pro
                    </Button>
                </CardContent>

                {/* Decorative Star/Icon */}
                <Star className="absolute -bottom-8 -right-8 w-32 h-32 fill-white text-white/10 rotate-12 pointer-events-none" />
            </Card>
        </div>
    )
}
