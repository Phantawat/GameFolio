import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mouse, Keyboard, Laptop } from 'lucide-react'

export function Hardware() {
  return (
    <Card className="bg-[#140C0B] border-zinc-800 text-zinc-100 shadow-sm transition-colors hover:border-zinc-700">
        <CardHeader className="flex flex-row items-center gap-2 pb-2">
            <Laptop className="w-4 h-4 text-[#FF5C00]" />
            <CardTitle className="text-sm font-bold uppercase tracking-wide text-white">Hardware</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
            <div className="flex items-center gap-4 group p-3 rounded-lg bg-[#0F0A09] border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="w-10 h-10 rounded-md bg-zinc-800/80 flex items-center justify-center group-hover:bg-zinc-700/80 transition-colors border border-zinc-700/50">
                      <Mouse className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Mouse</span>
                      <span className="text-sm font-bold text-white tracking-tight">Logitech G Pro X Superlight</span>
                  </div>
            </div>
            
            <div className="flex items-center gap-4 group p-3 rounded-lg bg-[#0F0A09] border border-zinc-800 hover:border-zinc-700 transition-colors">
                  <div className="w-10 h-10 rounded-md bg-zinc-800/80 flex items-center justify-center group-hover:bg-zinc-700/80 transition-colors border border-zinc-700/50">
                      <Keyboard className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                  </div>
                  <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Keyboard</span>
                      <span className="text-sm font-bold text-white tracking-tight">Wooting 60HE</span>
                  </div>
            </div>
        </CardContent>
    </Card>
  )
}
